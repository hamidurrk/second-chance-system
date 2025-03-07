from fastapi import FastAPI, HTTPException, Depends, status, APIRouter
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
import uuid, hashlib, os
from utils.db_utils import *
from base_models.models import *

load_dotenv()

router = APIRouter(prefix="/api/auth/admin")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def encode_password(password: str) -> str:
    sha_signature = hashlib.sha256(password.encode()).hexdigest()
    return sha_signature

def get_current_user(token: str = Depends(oauth2_scheme)):
    print("token", token)
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        is_admin: bool = payload.get("is_admin", False)
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email, is_admin=is_admin)
    except JWTError:
        raise credentials_exception
    return token_data

def is_admin_user(current_user: TokenData = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    return current_user

def check_if_user_email_exists(email: str):
    user = read_record('store_users', conditions={'email': email})
    if user is None:
        return False
    return True

def check_if_user_data_exists(email: str):
    user_data = read_record('store_users', conditions={'email': email})
    if user_data.get('picture') is None:
        return False
    else:
        return True

def insert_user_registration_data(user_email: str, password: str, name: str):
    uuid_id = str(uuid.uuid4())
    insert_record('store_users', attributes=['id', 'email', 'name'], values=[uuid_id, user_email, name])
    insert_record('roles', attributes=['id', 'role'], values=[uuid_id, 'STORE_ADMIN'])
    insert_record('passwords', attributes=['id', 'password'], values=[uuid_id, password])

def insert_user_data(user_email: str, user: User):
    update_record('store_users', attributes=['name', 'picture'], values=[user.name, user.picture], conditions={'email': user_email})

def get_user(email: str):
    user_data = read_record('system_admin', conditions={'email': email})
    return user_data

@router.post("/register", response_model=Token)
async def register(user: UserRegister):
    print(user)
    if check_if_user_email_exists(user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    insert_user_registration_data(user.email, encode_password(user.password), user.name)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "is_admin": True}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    print(user)
    user_email = user.email
    user_password = user.password
    user_data = read_record('system_admin', conditions={'email': user_email})
    if user_data is None:
        raise HTTPException(status_code=401, detail="Unauthorized")
    password_hash = encode_password(user_password)
    password_data = user_data.get('password')
    print(password_data != password_hash)
    if password_data is None:
        raise HTTPException(status_code=401, detail="Unauthorized")
    if password_data != password_hash:
        raise HTTPException(status_code=401, detail="Unauthorized")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "is_admin": True}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "message": "Login successful" if password_data == password_hash else "Login failed"
    }

@router.get("/users/me", response_model=SysAdminUser)
async def read_users_me(current_user: TokenData = Depends(get_current_user)):
    user = get_user(current_user.email)
    return {
        "email": current_user.email,
        "name": user.get('name'),  
        "phone_number": user.get('phone_number')
    }