from fastapi import APIRouter, HTTPException, Depends, Request
from utils.db_utils import *
from utils.auth_utils import *
from base_models.models import *
import json
import stripe
import random

router = APIRouter(prefix="/api/orders")
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY") 
PUBLIC_FRONTEND_URL = os.environ.get("PUBLIC_FRONTEND_URL") 

def create_new_order(order: dict, delivery: bool = False):
    try:
        customer = read_record('customers', conditions={'email': order.get('email')})
        # print(customer)
        if not customer:
            return False
        print("Generating order")
        
        order_otp = str(random.randint(100000, 999999))
        customer_id = customer.get('id')
        cart_items = order.get('cart_items')
        store_orders = {}
        # Search customer address id from customer_addresses table using customer_id and street_address
        delivery_address_id = None
        if delivery:
            delivery_address_id = read_record('customer_addresses', conditions={'customer_id': customer_id, 'street_address': order.get('street_address')}).get('id')

        for product_id, qty in cart_items.items():
            product_data = read_record('products', conditions={'id': product_id})
            store_id = product_data.get('store_id')
            price = product_data.get('price')
            item_total = price * qty
            if store_id not in store_orders:
                store_orders[store_id] = []
            store_orders[store_id].append({
                'product_id': product_id,
                'quantity': qty,
                'item_total': item_total,
            })

        # Create separate orders for each store
        for store_id, items in store_orders.items():
            total = sum([item.get('item_total') for item in items])
            order_data = {
                'customer_id': customer_id,
                'store_id': store_id,
                'delivery': delivery,
                'delivery_address_id': delivery_address_id,
                'order_otp': order_otp,
                'status': 'pending',
                'paid': True,
                'total': total
            }
            
            order_id = str(uuid.uuid4())
            insert_record('orders', attributes=['id', 'customer_id', 'store_id', 'delivery', 'delivery_address_id', 'order_otp', 'status', 'paid', 'total'], 
                          values=[order_id, customer_id, store_id, delivery, delivery_address_id, order_otp, 'pending', True, total])
            print(f"Order created for store {store_id} with items: {items}")
            
            for item in items:
                order_items_id = str(uuid.uuid4())
                order_id = order_id
                product_id = item.get('product_id')
                qty = item.get('quantity')
                insert_record('order_items', attributes=['id', 'order_id', 'product_id', 'qty'], values=[order_items_id, order_id, product_id, qty])
                print(f"Order item created for product {product_id} with quantity {qty}")
        return True
    except Exception as e:
        print("Error creating order:", e)
        return False

@router.post("/create-checkout-session")
async def create_checkout_session(cart_items: CartItems):
    # print(cart_items)
    try:
        line_items = []
        for item in cart_items.cart_items:
            print(item)
            line_items.append({
                "price_data": {
                    "currency": "eur",
                    "product_data": {"name": item.title},
                    "unit_amount": int(item.price * 100),
                },
                "quantity": item.quantity,
            })

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="payment",
            line_items=line_items,
            success_url=f"{PUBLIC_FRONTEND_URL}/cart?success=true",
            cancel_url=f"{PUBLIC_FRONTEND_URL}/cart?canceled=true",
        )

        return {"sessionId": session.id}
    except Exception as e:
        print("Error creating checkout session:", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/checkout-online")
async def create_order(order: CheckoutOnline, request: Request):
    print(order)
    if order.password:
        if check_if_customer_exists(order.email):
            if not check_password(order.email, order.password):
                raise HTTPException(status_code=400, detail="Password incorrect")
            else:
                print("User exists: Password correct")
        else:
            user_register = {
                "name": order.name,
                "email": order.email,
                "phone_number": order.phone_number,
                "city": order.city,
                "postal_code": order.postal_code,
                "street_address": order.street_address,
                "country": order.country,
                "password": order.password
            }
            account_created = create_customer_account(user_register)
            if not account_created:
                raise HTTPException(status_code=400, detail="Error creating user account")
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": order.email}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    else:
        token = request.headers.get("Authorization")
        if token == None or not len(token) > 50:
            if check_if_customer_exists(order.email):
                raise HTTPException(status_code=400, detail="User already exists")
            else:
                raise HTTPException(status_code=400, detail="Password or JWT token required")
        else:
            print("Token:", token)
            user_update = {
                "name": order.name,
                "email": order.email,
                "phone_number": order.phone_number,
                "city": order.city,
                "postal_code": order.postal_code,
                "street_address": order.street_address,
                "country": order.country,
                "password": order.password
            }
            account_updated = update_customer_account(user_update)
            if not account_updated:
                raise HTTPException(status_code=400, detail="Error updating user account")
            return {"message": "Token received"}

@router.post("/checkout-offline")
async def create_order(order: CheckoutOffline, request: Request):
    print(order)
    if order.password:
        if check_if_customer_exists(order.email):
            if not check_password(order.email, order.password):
                raise HTTPException(status_code=400, detail="Password incorrect")
            else:
                print("User exists: Password correct")
        else:
            user_register = {
                "name": order.name,
                "email": order.email,
                "phone_number": order.phone_number,
                # "city": order.city,
                # "postal_code": order.postal_code,
                # "street_address": order.street_address,
                # "country": order.country,
                "password": order.password
            }
            account_created = create_customer_account(user_register)
            if not account_created:
                raise HTTPException(status_code=400, detail="Error creating user account")
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": order.email}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    else:
        token = request.headers.get("Authorization")
        if token == None or not len(token) > 50:
            if check_if_customer_exists(order.email):
                raise HTTPException(status_code=400, detail="User already exists")
            else:
                raise HTTPException(status_code=400, detail="Password or JWT token required")
        else:
            print("Token:", token)
            user_update = {
                "name": order.name,
                "email": order.email,
                "phone_number": order.phone_number,
                # "city": order.city,
                # "postal_code": order.postal_code,
                # "street_address": order.street_address,
                # "country": order.country,
                "password": order.password
            }
            account_updated = update_customer_account(user_update)
            if not account_updated:
                raise HTTPException(status_code=400, detail="Error updating user account")
            return {"message": "Token received"}
        

@router.post("/submit-order-online")
async def create_order(order: SubmitOrderOnline, request: Request):
    print(order)
    order_data = {
        # "line_items": order.line_items,
        "cart_items": order.cart_items,
        "name": order.name,
        "email": order.email,
        "phone_number": order.phone_number,
        "city": order.city,
        "postal_code": order.postal_code,
        "street_address": order.street_address,
        "country": order.country,
    }
    account_created = create_new_order(order_data, delivery=True)
    if not account_created:
        raise HTTPException(status_code=400, detail="Error creating user account")

    # return {"access_token": access_token, "token_type": "bearer"}
    return {"message": "Order submitted"}


@router.post("/submit-order-offline")
async def create_order(order: SubmitOrderOffline, request: Request):
    print(order)
    order_data = {
        # "line_items": order.line_items,
        "cart_items": order.cart_items,
        "name": order.name,
        "email": order.email,
        "phone_number": order.phone_number,
        # "city": order.city,
        # "postal_code": order.postal_code,
        # "street_address": order.street_address,
        # "country": order.country,
    }
    new_order_submitted = create_new_order(order_data)
    if not new_order_submitted:
        raise HTTPException(status_code=400, detail="Error creating new order")

    return {"message": "Order submitted"}
