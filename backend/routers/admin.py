from fastapi import FastAPI, HTTPException, Depends, status, APIRouter, UploadFile, File, Form
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
import uuid, hashlib, os
from utils.db_utils import *
from base_models.models import *
from routers.auth_admin import is_admin_user, encode_password

router = APIRouter(prefix="/api/admin")

BACKEND_URL = os.getenv("BACKEND_URL")
IMAGE_BASE_DIR = os.getenv("IMAGE_BASE_DIR")

def get_all_cities():
    cities = read_column(table_name='cities', column_name='city')
    return cities

def update_store_img_id(img_id: str, store_id: str):
    update_record('stores', attributes=['image'], values=[img_id], conditions={'id': store_id})

@router.get("/image/{image_id}")
async def get_image(image_id: str): #current_user: TokenData = Depends(is_admin_user) ommitted for testing
    image_metadata = read_record('images', conditions={'image_id': image_id})
    if image_metadata is None:
        raise HTTPException(status_code=404, detail="Image not found")

    # Constructing the URL for the image
    image_url = f"{BACKEND_URL}/images/{image_metadata['file_path']}/{image_metadata['file_name']}"
    
    return {"image_url": image_url}

@router.post("/image/upload")
async def upload_image(file: UploadFile = File(...), store_id: str = Form(...)): # current_user: TokenData = Depends(is_admin_user) ommitted for testing
    image_id = str(uuid.uuid4())
    
    # Create a directory structure based on the current date (e.g., 2023/10)
    current_date = datetime.now()
    year = current_date.year
    month = current_date.month
    file_path = os.path.join(str(year), str(month))
    
    # Ensure the directory exists
    full_dir_path = os.path.join(IMAGE_BASE_DIR, file_path)
    os.makedirs(full_dir_path, exist_ok=True)
    
    # Save the file to the filesystem
    file_extension = os.path.splitext(file.filename)[1]  # Get the file extension
    file_name = f"{image_id}{file_extension}"  # Use the UUID as the file name
    full_file_path = os.path.join(full_dir_path, file_name)
    
    try:
        # Write the file to the filesystem
        with open(full_file_path, "wb") as buffer:
            buffer.write(await file.read())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save image file: {e}")
    
    # Insert metadata into the database
    try:
        insert_record(
            'images',
            attributes=['image_id', 'file_path', 'file_name', 'mime_type'],
            values=[image_id, file_path, file_name, file.content_type]
        )
        update_store_img_id(image_id, store_id)
    except Exception as e:
        # Clean up the saved file if database insertion fails
        os.remove(full_file_path)
        raise HTTPException(status_code=500, detail=f"Failed to insert image metadata: {e}")
    
    return { "image_id": [image_id] }

@router.delete("image/{image_id}") # current_user: TokenData = Depends(is_admin_user) ommitted for testing
async def delete_product_image(image_id: str):
    # Fetch image metadata from the database
    image_metadata = read_record('images', conditions={'image_id': image_id})
    if image_metadata is None:
        raise HTTPException(status_code=404, detail="Image not found")

    # Construct the full file path
    file_path = os.path.join(IMAGE_BASE_DIR, image_metadata['file_path'], image_metadata['file_name'])
    
    # Delete the image file from the filesystem
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to delete image file: {e}")
    else:
        raise HTTPException(status_code=404, detail="Image file not found")

    delete_record('images', conditions={'image_id': image_id})
    return {"message": "Image deleted successfully"}

@router.get("/cities")
async def get_cities():
    cities = get_all_cities()
    return cities

@router.post("/new-store")
async def create_product(store: StoreCreate , current_user: TokenData = Depends(is_admin_user)):
    print(store)
    store_id = str(uuid.uuid4())
    store_users_id = str(uuid.uuid4())
    insert_record(
        'stores',
        attributes=['id', 'name', 'description', 'city', 'location'],
        values=[store_id, store.storeName, store.storeDescription, store.city, store.storeLocation]
    )
    insert_record(
        'store_users',
        attributes=['id', 'email', 'name', 'store_id'],
        values=[store_users_id, store.storeAdminEmail, store.storeAdminName, store_id]
    )
    insert_record(
        'roles',
        attributes=['id', 'role'],
        values=[store_users_id, 'STORE_ADMIN']
    )
    insert_record(
        'passwords',
        attributes=['id', 'password'],
        values=[store_users_id, encode_password("test1234")]
    )
    return {
        "message": "Store created successfully",
        "store_id": store_id
        }

@router.get("/stores")
async def get_store_users_with_stores(current_user: TokenData = Depends(is_admin_user)):
    attributes = [
        "store_users.id AS user_id", 
        "store_users.email AS store_admin_email", 
        "store_users.name AS store_admin_name", 
        "stores.id AS store_id", 
        "stores.name AS store_name", 
        "stores.description", 
        "stores.city", 
        "stores.location"
    ]
    tables = ["store_users", "stores", "roles"]
    join_conditions = ["store_users.store_id = stores.id", "store_users.id = roles.id"]
    conditions = {"roles.role": "STORE_ADMIN"}

    store_admins_with_stores = read_joined_records(tables, join_conditions, attributes, conditions)

    return store_admins_with_stores

@router.get("/store/{store_id}")
async def get_store(store_id: str, current_user: TokenData = Depends(is_admin_user)):
    attributes = [
        "store_users.id AS user_id", 
        "store_users.email AS store_admin_email", 
        "store_users.name AS store_admin_name", 
        "stores.id AS store_id", 
        "stores.name AS store_name", 
        "stores.description", 
        "stores.city", 
        "stores.location"
    ]
    tables = ["store_users", "stores", "roles"]
    join_conditions = ["store_users.store_id = stores.id", "store_users.id = roles.id"]
    conditions = {"roles.role": "STORE_ADMIN", "stores.id": store_id}

    store_admins_with_stores = read_joined_records(tables, join_conditions, attributes, conditions)
    # print(len(store_admins_with_stores))
    if len(store_admins_with_stores) == 1:
        return store_admins_with_stores[0]
    return store_admins_with_stores

@router.delete("/store/{store_id}")
async def delete_store(store_id: str, current_user: TokenData = Depends(is_admin_user)):
    admin_data = read_record('store_admins_with_stores_view', conditions={'store_id': store_id})
    delete_record('passwords', conditions={'id': admin_data.get('user_id')})
    delete_record('stores', conditions={'id': store_id})
    delete_record('store_users', conditions={'id': admin_data.get('user_id')})
    return {"message": "Store deleted successfully"}