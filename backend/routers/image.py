from fastapi import HTTPException, APIRouter, UploadFile, File, Form
from utils.db_utils import *
from base_models.models import *
import uuid
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/image")

BACKEND_URL = os.getenv("BACKEND_URL")
IMAGE_BASE_DIR = os.getenv("IMAGE_BASE_DIR")

def update_product_img_id(img_id: str, product_id: str):
    product = read_record('products', conditions={'id': product_id})
    img_ids = product.get('images')
    img_ids.append(img_id)
    update_record('products', attributes=['images'], values=[img_ids], conditions={'id': product_id})

@router.get("/{image_id}")
async def get_image(image_id: str): #current_user: TokenData = Depends(is_admin_user) ommitted for testing
    image_metadata = read_record('images', conditions={'image_id': image_id})
    if image_metadata is None:
        raise HTTPException(status_code=404, detail="Image not found")

    # Constructing the URL for the image
    image_url = f"{BACKEND_URL}/api/images/{image_metadata['file_path']}/{image_metadata['file_name']}"
    
    return {"image_url": image_url}

@router.post("/upload")
async def upload_image(file: UploadFile = File(...), product_id: str = Form(...)): # current_user: TokenData = Depends(is_admin_user) omitted for testing
    image_id = str(uuid.uuid4())
    print(product_id)
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
        print(f"Failed to save image file: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save image file: {e}")
    
    # Insert metadata into the database
    try:
        insert_record(
            'images',
            attributes=['image_id', 'file_path', 'file_name', 'mime_type'],
            values=[image_id, file_path, file_name, file.content_type]
        )
        update_product_img_id(image_id, product_id)
    except Exception as e:
        # Clean up the saved file if database insertion fails
        os.remove(full_file_path)
        print(f"Failed to insert image metadata: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to insert image metadata: {e}")
    
    return {"image_id": [image_id]}

@router.delete("/{image_id}") # current_user: TokenData = Depends(is_admin_user) ommitted for testing
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