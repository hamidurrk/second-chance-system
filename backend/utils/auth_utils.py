from fastapi import HTTPException, Security
from fastapi.security import OAuth2PasswordBearer
from utils.db_utils import *
from datetime import datetime, timedelta
from jose import JWTError, jwt
import uuid
import os
import hashlib

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

async def check_token_presence(token: str = Security(oauth2_scheme)):
    if not token:
        raise HTTPException(status_code=401, detail="Token missing. Please create an account first.")
    return token

def encode_password(password: str) -> str:
    sha_signature = hashlib.sha256(password.encode()).hexdigest()
    return sha_signature

def create_customer_account(user: dict):
    try:
        customer = read_record('customers', conditions={'email': user.get('email')})
        if customer:
            return False
        print("Creating customer account")
        customer_id = str(uuid.uuid4())
        name = user.get('name')
        email = user.get('email')
        phone_number = user.get('phone_number')
        insert_record('customers', attributes=['id', 'name', 'email', 'phone_number'], values=[customer_id, name, email, phone_number]) 
        print("Customer account created")
        password = encode_password(user.get('password'))
        insert_record('customer_passwords', attributes=['id', 'password'], values=[customer_id, password])
        if 'city' in user:
            address_id = str(uuid.uuid4())
            street_address = user.get('street_address')
            country = user.get('country')
            city = user.get('city')
            postal_code = user.get('postal_code')
            insert_record('customer_addresses', attributes=['id', 'customer_id', 'street_address', 'country', 'city', 'postal_code'], values=[address_id, customer_id, street_address, country, city, postal_code])
        return True
    except Exception as e:
        print("Error creating customer account:", e)
        return False
    
def update_customer_account(user: dict):
    try:
        customer = read_record('customers', conditions={'email': user.get('email')})
        # print(customer)
        if not customer:
            return False
        print("Updating customer account")
        customer_id = customer.get('id')
        name = user.get('name')
        email = user.get('email')
        phone_number = user.get('phone_number')
        update_record('customers', attributes=['name', 'email', 'phone_number'], values=[name, email, phone_number], conditions={'id': customer_id})
        if 'city' in user:
            street_address = user.get('street_address')
            country = user.get('country')
            city = user.get('city')
            postal_code = user.get('postal_code')
            update_record('customer_addresses', attributes=['street_address', 'country', 'city', 'postal_code'], values=[street_address, country, city, postal_code], conditions={'customer_id': customer_id})
        return True
    except Exception as e:
        print("Error updating customer account:", e)
        return False

def check_if_customer_exists(email: str):
    customer = read_record('customers', conditions={'email': email})
    if customer:
        return True
    return False

def check_password(email: str, password: str):
    customer = read_record('customers', conditions={'email': email})
    if customer is None:
        return False
    customer_id = customer.get('id')
    customer_password = read_record('customer_passwords', conditions={'id': customer_id})
    if customer_password is None:
        return False
    return customer_password.get('password') == encode_password(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt