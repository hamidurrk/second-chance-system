from fastapi import APIRouter, HTTPException, Depends
from utils.db_utils import *
from base_models.models import *
import json
from routers.auth_store import is_admin_user

router = APIRouter(prefix="/api/store/products")

@router.get("/")
async def get_products(current_user: TokenData = Depends(is_admin_user)):
    store_id = current_user.store_id
    products = read_records('products', conditions={'store_id': store_id})
    # print(products)
    return products

@router.get("/{product_id}")
async def get_product(product_id: str, current_user: TokenData = Depends(is_admin_user)):
    store_id = current_user.store_id
    product = read_record('products', conditions={'id': product_id, 'store_id': store_id})
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    # print(product)
    return product 

@router.post("/")
async def create_product(product: ProductCreate, current_user: TokenData = Depends(is_admin_user)):
    properties_json = json.dumps(product.properties) if product.properties else None

    insert_record(
        'products',
        attributes=['title', 'description', 'price', 'images', 'category', 'properties', 'store_id'],
        values=[product.title, product.description, product.price, product.images, product.category, properties_json, current_user.store_id]
    )
    product_id = read_record('products', conditions={'title': product.title, 'store_id': current_user.store_id})['id']
    return {
        "message": "Product created successfully",
        "product_id": product_id
        }

@router.put("/{product_id}")
async def update_product(product_id: str, product: ProductUpdate, current_user: TokenData = Depends(is_admin_user)):
    properties_json = json.dumps(product.properties) if product.properties else None

    update_data = {k: v for k, v in product.dict().items() if v is not None}
    # update_data['store_id'] = current_user.store_id
    if 'properties' in update_data:
        update_data['properties'] = properties_json

    # print(update_data)
    # Update the product in the database
    update_record(
        'products',
        conditions={'id': product_id},
        attributes=update_data.keys(),
        values=list(update_data.values())
    )
    return {"message": "Product updated successfully"}

@router.delete("/{product_id}")
async def delete_product(product_id: str, current_user: TokenData = Depends(is_admin_user)):
    delete_record('products', conditions={'id': product_id})
    return {"message": "Product deleted successfully"}

ITEMS_PER_PAGE = 10

@router.get("/recent/{page}")
async def get_recent_products(page: int):
    if page < 1:
        raise HTTPException(status_code=400, detail="Page number must be at least 1")
    try:
        products = read_by_page("products", page, ITEMS_PER_PAGE)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch products: {e}")
    if not products:
        return []
    return products

