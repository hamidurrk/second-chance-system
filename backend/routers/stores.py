from fastapi import APIRouter, HTTPException, Depends
from utils.db_utils import *
from base_models.models import *
from routers.auth_store import is_admin_user

router = APIRouter(prefix="/api/store")

@router.get("/")
async def get_store_data(current_user: TokenData = Depends(is_admin_user)):
    store_id = current_user.store_id
    store_profile = read_record('stores', conditions={'id': store_id})
    return store_profile

