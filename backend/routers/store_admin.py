from fastapi import FastAPI, HTTPException, Depends, status, APIRouter, UploadFile, File, Form
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
import uuid, hashlib, os
from utils.db_utils import *
from base_models.models import *
from routers.auth_store import is_admin_user, encode_password

router = APIRouter(prefix="/api/store/admin")

@router.post("/new-employee")
async def create_employee(employee: EmployeeCreate , current_user: TokenData = Depends(is_admin_user)):
    print(employee)
    store_id = current_user.store_id
    store_users_id = str(uuid.uuid4())
    # print(store_users_id)
    # print(store_id)
    insert_record(
        'store_users',
        attributes=['id', 'email', 'name', 'address','store_id'],
        values=[store_users_id, employee.email, employee.name, employee.address, store_id]
    )
    insert_record(
        'roles',
        attributes=['id', 'role'],
        values=[store_users_id, 'EMPLOYEE']
    )
    insert_record(
        'passwords',
        attributes=['id', 'password'],
        values=[store_users_id, encode_password("test1234")]
    )
    return {
        "message": "Employee created successfully"
        }
    
@router.get("/employees")
async def get_store_employees(current_user: TokenData = Depends(is_admin_user)):
    store_id = current_user.store_id
    employees = read_records('employee_view', conditions={'store_id': store_id})
    return employees

@router.delete("/employee/{employee_id}")
async def delete_employee(employee_id: str, current_user: TokenData = Depends(is_admin_user)):
    # delete_record('roles', conditions={'id': employee_id})
    delete_record('passwords', conditions={'id': employee_id})
    delete_record('store_users', conditions={'id': employee_id})
    return {"message": "Employee deleted successfully"}