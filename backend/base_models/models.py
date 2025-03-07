from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    is_admin: Optional[bool] = False
    store_id: Optional[str] = None

class User(BaseModel):
    email: str
    name: str
    picture: Optional[str] = None
    is_admin: bool

class SysAdminUser(BaseModel):
    email: str
    name: str
    phone_number: Optional[str] = None

class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class CusotmerCheck(BaseModel):
    email: str
    
class ProductCreate(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    images: Optional[list[str]] = None
    category: List[int]
    properties: Optional[dict] = None

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    images: Optional[list[str]] = None
    category: Optional[List[int]] = None
    properties: Optional[dict] = None

class CartItem(BaseModel):
    title: str
    price: float
    quantity: int

class CartItems(BaseModel):
    cart_items: List[CartItem]
    
class CheckoutOnline(BaseModel):
    cart_items: dict
    name: str
    email: str
    phone_number: str
    city: str
    postal_code: str
    street_address: str
    country: str
    password: Optional[str] = None

class CheckoutOffline(BaseModel):
    cart_items: dict
    name: str
    email: str
    phone_number: str
    # city: str
    # postal_code: str
    # street_address: str
    # country: str
    password: Optional[str] = None

class SubmitOrderOnline(BaseModel):
    # line_items: List[CartItem]
    cart_items: dict
    name: str
    email: str
    phone_number: str
    city: str
    postal_code: str
    street_address: str
    country: str
    # password: Optional[str] = None
    
class SubmitOrderOffline(BaseModel):
    # line_items: List[CartItem]
    cart_items: dict
    name: str
    email: str
    phone_number: str
    # city: str
    # postal_code: str
    # street_address: str
    # country: str
    # password: Optional[str] = None
    
class OrderCart(BaseModel):
    cart_items: dict

class CategoryCreate(BaseModel):
    name: str
    parent: Optional[int] = None
    properties: Optional[dict] = None
    
class StoreCreate(BaseModel):
    storeName: str
    storeDescription: Optional[str] = None
    city: str
    storeLocation: str
    storeAdminName: str
    storeAdminEmail: str

class EmployeeCreate(BaseModel):
    email: str
    name: str
    address: str
    
class ProductIDs(BaseModel):
    ids: List[int]
    




class ProductData(BaseModel):
    name: str

class PriceData(BaseModel):
    product_data: ProductData

class LineItem(BaseModel):
    price_data: Optional[PriceData]
    quantity: int

class Order(BaseModel):
    _id: str
    createdAt: datetime
    paid: bool
    name: str
    email: str
    city: str
    postalCode: str
    country: str
    streetAddress: str
    customer_id: str
    store_id: str
    delivery: bool
    delivery_address_id: Optional[str]
    order_otp: Optional[str]
    status: str
    total: int
    line_items: List[LineItem]

class OrdersResponse(BaseModel):
    orders: List[Order]
    
class SearchRequest(BaseModel):
    title: str