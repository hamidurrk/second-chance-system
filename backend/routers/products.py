from fastapi import APIRouter, HTTPException, Depends, Query
from utils.db_utils import *
from base_models.models import *
import json
from routers.auth_store import is_admin_user

router = APIRouter(prefix="/api/products")

@router.get("/")
async def get_products():
    products = read_records('products')
    # print(products)
    return products

@router.get("/{product_id}")
async def get_product(product_id: str):
    try:
        product_id = int(product_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid product ID format. Must be an integer.")
    
    product = read_record('products', conditions={'id': product_id})
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    # print(product)
    return product 

ITEMS_PER_PAGE = 10

@router.get("/recent/{page}")
async def get_recent_products(page: int):
    if page < 1:
        raise HTTPException(status_code=400, detail="Page number must be at least 1")
    try:
        products = read_by_page("products", page, ITEMS_PER_PAGE)
        print("products", page)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch products: {e}")
    if not products:
        return []
    return products

@router.post("/ids")
async def fetch_products_by_ids(product_ids: ProductIDs):
    products = []
    for product_id in product_ids.ids:
        product = read_record('products', conditions={'id': product_id})
        if product:
            products.append(product)
    if not products:
        raise HTTPException(status_code=404, detail="No products found for the given IDs")
    return products

@router.post("/search")
def search_products(data: SearchRequest):
    title = data.title
    print(f"Searching for products with title: {title}")
    products = get_products_by_title(title)
    if len(products) > 20:
        products = products[:20]
    if not products:
        raise HTTPException(status_code=404, detail="No products found matching the search criteria")
    return products