from fastapi import FastAPI, HTTPException, Depends, status, APIRouter, UploadFile, File, Form
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
import uuid, hashlib, os
from utils.db_utils import *
from base_models.models import *
from routers.auth_store import is_admin_user, encode_password
from fastapi.responses import StreamingResponse
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from PIL import Image, ImageDraw, ImageFont
import barcode
from barcode.writer import ImageWriter

router = APIRouter(prefix="/api/store/employee")


def create_new_order(order: dict, delivery: bool = False):
    try:
        # customer = read_record('customers', conditions={'email': order.get('email')})
        # # print(customer)
        # if not customer:
        #     return False
        print("Generating order")
        
        # order_otp = str(random.randint(100000, 999999))
        # customer_id = customer.get('id')
        cart_items = order.get('cart_items')
        store_orders = {}
        # Search customer address id from customer_addresses table using customer_id and street_address
        delivery_address_id = None
        # if delivery:
        #     delivery_address_id = read_record('customer_addresses', conditions={'customer_id': customer_id, 'street_address': order.get('street_address')}).get('id')

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
                # 'customer_id': customer_id,
                'store_id': store_id,
                'delivery': delivery,
                'delivery_address_id': delivery_address_id,
                # 'order_otp': order_otp,
                'status': 'pending',
                'paid': True,
                'total': total
            }
            
            order_id = str(uuid.uuid4())
            insert_record('orders', attributes=['id', 'store_id', 'delivery', 'delivery_address_id', 'status', 'paid', 'total'], 
                                    values=[order_id, store_id, delivery, delivery_address_id, 'delivered', True, total])
            print(f"Order created for store {store_id} with items: {items}")
            
            for item in items:
                order_items_id = str(uuid.uuid4())
                order_id = order_id
                product_id = item.get('product_id')
                qty = item.get('quantity')
                insert_record('order_items', attributes=['id', 'order_id', 'product_id', 'qty'], values=[order_items_id, order_id, product_id, qty])
                
                product_qty = int(read_column('products', 'qty', conditions={'id': product_id})[0])
                update_record('products', attributes=['qty'], values=[f"{product_qty-qty}"], conditions={'id': product_id})
                
                print(f"Order item created for product {product_id} with quantity {qty}")
        return order_id
    except Exception as e:
        print("Error creating order:", e)
        return None

@router.get("/product/{barcode}")
async def get_product(barcode: str, current_user: TokenData = Depends(is_admin_user)):
    product = read_record('products', conditions={'barcode': barcode})
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/submit-order")
async def create_order(order: OrderCart, current_user: TokenData = Depends(is_admin_user)):
    print(order)
    order_data = {
        "cart_items": order.cart_items
    }
    new_order_submitted = create_new_order(order_data)
    if not new_order_submitted:
        raise HTTPException(status_code=400, detail="Error creating new order")

    return {
        "message": "Order submitted successfully!",
        "orderId": new_order_submitted
    }
@router.get("/invoice/{order_id}")
def get_invoice(order_id: str, current_user: TokenData = Depends(is_admin_user)):
    order_records = read_records('orders', conditions={'id': order_id})
    if not order_records:
        raise HTTPException(status_code=404, detail="Order not found")
    order_data = order_records[0]

    order_items = read_records('order_items', conditions={'order_id': order_id})
    if not order_items:
        raise HTTPException(status_code=404, detail="No items found for this order")

    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)

    p.setFont("Helvetica-Bold", 20)
    p.drawString(inch, 10.2 * inch, "Second Chance")

    p.setFont("Helvetica", 12)
    p.drawString(inch, 9.8 * inch, f"Invoice for Order: {order_id}")
    p.drawString(inch, 9.5 * inch, f"Status: Paid")
    p.drawString(inch, 9.2 * inch, f"Total: €{order_data['total']}")

    p.line(inch, 9.0 * inch, 7.5 * inch, 9.0 * inch)

    current_y = 8.7 * inch
    p.setFont("Helvetica-Bold", 12)
    p.drawString(inch, current_y, "Product")
    p.drawString(4.0 * inch, current_y, "Price")
    p.drawString(5.0 * inch, current_y, "Qty")
    p.drawString(6.0 * inch, current_y, "Line Total")

    p.setFont("Helvetica", 12)
    current_y -= 0.2 * inch

    for item in order_items:
        product_id = item["product_id"]
        qty = item["qty"]
        product_data = read_record("products", conditions={"id": product_id})

        product_name = product_data.get("title", "Unknown Product")
        price = product_data.get("price", 0.0)
        line_total = price * qty

        max_product_name_length = 30
        if len(product_name) > max_product_name_length:
            product_name = product_name[:max_product_name_length] + "..."

        text_object = p.beginText(inch, current_y)
        text_object.setFont("Helvetica", 12)
        text_object.textLines(product_name)
        p.drawText(text_object)

        p.drawString(4.0 * inch, current_y, f"€{price}")
        p.drawString(5.0 * inch, current_y, str(qty))
        p.drawString(6.0 * inch, current_y, f"€{line_total}")

        current_y -= 0.2 * inch
        
        if current_y < inch:
            p.showPage()
            current_y = 10.5 * inch
            p.setFont("Helvetica-Bold", 12)
            p.drawString(inch, current_y, "Product")
            p.drawString(4.0 * inch, current_y, "Price")
            p.drawString(5.0 * inch, current_y, "Qty")
            p.drawString(6.0 * inch, current_y, "Line Total")
            p.setFont("Helvetica", 12)
            current_y -= 0.2 * inch

    p.line(inch, current_y, 7.5 * inch, current_y)
    current_y -= 0.2 * inch

    p.setFont("Helvetica-Bold", 12)
    p.drawString(5.0 * inch, current_y, "Total:")
    p.drawString(6.0 * inch, current_y, f"€{order_data['total']}")

    p.showPage()
    p.save()
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=invoice_{order_id}.pdf"
        }
    )
 
@router.get("/product/barcode/{product_id}")
def download_barcode(product_id: str):
    product = read_record("products", conditions={"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product_barcode = product.get("barcode", "")
    product_price = product.get("price", 0.0)

    if len(product_barcode) != 12 or not product_barcode.isdigit():
        raise HTTPException(status_code=400, detail="Invalid or missing 12-digit barcode.")

    CODE128 = barcode.get_barcode_class("code128")
    bc = CODE128(product_barcode, writer=ImageWriter())
    filename = f"./api/barcode_{product_id}"
    bc.save(filename)
    filename = f"{filename}.png"

    with Image.open(filename) as img:
        draw = ImageDraw.Draw(img)
        font = ImageFont.truetype("arial.ttf", 30) 

        text = f"Price: {product_price} eur"
        
        mask = font.getmask(text)
        text_width, text_height = mask.size

        x = (img.width - text_width) // 2
        y = img.height - text_height - 14

        draw.text((x, y), text, font=font, fill="black")
        img.save(filename)

    return FileResponse(
        path=filename,
        media_type="image/png",
        filename=filename
    )