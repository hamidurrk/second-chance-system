# Second Chance Backend

This repository contains the backend code for the Second Chance project. It is built using FastAPI and PostgreSQL for RBAC, store management, categories, products, and orders.

## Requirements

- Python 3.8+
- PostgreSQL

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/BoDS-Group/backend
    cd backend
    ```

2. Create a virtual environment and activate it:
    ```sh
    python -m venv venv
    ./venv/Scripts/activate  # On Windows
    # source venv/bin/activate  # On macOS/Linux
    ```

3. Install the dependencies:
    ```sh
    pip install -r requirements.txt
    ```

4. Set up your environment variables by creating a `.env` file in the root directory:
    ```
    DB_NAME=your_db_name
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_HOST=your_db_host
    DB_PORT=your_db_port

    
    IMAGE_BASE_DIR=./api/images

    SECRET_KEY = "your_secret_key"
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30

    BACKEND_URL = http://localhost:8000
    PUBLIC_FRONTEND_URL = http://localhost:3000

    STRIPE_SECRET_KEY = "sk_test_51Qykb9Pp13vxAOiL9OpyIh5zNVykxTZVhtw5QwPBqab4ubIRAPRK3ZG5BOOrbDJwem0Ju5deUc6Gq7xzkhguIrbz00AGbZSYoZ"
    ```

5. Start the PostgreSQL Database Server (if not already running) using pgAdmin or command line tools. 

6. Restore the database from the backup file `second-chance-plain.sql` under `/db_backup` directory using pgAdmin or command line tools.

5. Run the FastAPI application:
    ```sh
    uvicorn main:app --reload
    ```

# API Endpoints Documentation

### auth_admin.py

| Endpoint          | Method | Request Body       | Return Body                      |
|-------------------|--------|--------------------|----------------------------------|
| /api/auth/admin/register | POST   | UserRegister       | Token                            |
| /api/auth/admin/login    | POST   | UserLogin          | Token                            |
| /api/auth/admin/users/me | GET    | None               | SysAdminUser                     |

### admin.py

| Endpoint                  | Method | Request Body       | Return Body                      |
|---------------------------|--------|--------------------|----------------------------------|
| /api/admin/image/upload   | POST   | UploadFile, Form   | {"image_id": [image_id]}         |
| /api/admin/image/{image_id} | GET  | None               | {"image_url": image_url}         |
| /api/admin/image/{image_id} | DELETE | None             | {"message": "Image deleted successfully"} |
| /api/admin/cities         | GET    | None               | List of cities                   |
| /api/admin/new-store      | POST   | StoreCreate        | {"message": "Store created successfully", "store_id": store_id} |
| /api/admin/stores         | GET    | None               | List of stores with admin details|
| /api/admin/store/{store_id} | GET  | None               | Store details with admin details |
| /api/admin/store/{store_id} | DELETE | None             | {"message": "Store deleted successfully"} |

### auth_store.py

| Endpoint                  | Method | Request Body       | Return Body                      |
|---------------------------|--------|--------------------|----------------------------------|
| /api/auth/store/google    | POST   | User               | Token                            |
| /api/auth/store/register  | POST   | UserRegister       | Token                            |
| /api/auth/store/login     | POST   | UserLogin          | Token                            |
| /api/auth/store/users/me  | GET    | None               | User                             |

### orders.py

| Endpoint                  | Method | Request Body       | Return Body                      |
|---------------------------|--------|--------------------|----------------------------------|
| /api/orders/create-checkout-session | POST | CartItems | {"sessionId": session.id}        |
| /api/orders/checkout-online | POST | CheckoutOnline, Request | {"access_token": access_token, "token_type": "bearer"} |
| /api/orders/checkout-offline | POST | CheckoutOffline, Request | {"message": "Token received"}    |
| /api/orders/submit-order-online | POST | SubmitOrderOnline, Request | {"message": "Order submitted"}   |
| /api/orders/submit-order-offline | POST | SubmitOrderOffline, Request | {"message": "Order submitted"}   |

### store_categories.py

| Endpoint                  | Method | Request Body       | Return Body                      |
|---------------------------|--------|--------------------|----------------------------------|
| /api/store/categories     | GET    | None               | List of categories               |
| /api/store/categories/{category_id} | PUT | CategoryCreate | {"message": "Category updated successfully"} |
| /api/store/categories     | POST   | CategoryCreate     | {"message": "Category created successfully"} |
| /api/store/categories/{category_id} | DELETE | None       | {"message": "Category deleted successfully"} |

### store_products.py

| Endpoint                  | Method | Request Body       | Return Body                      |
|---------------------------|--------|--------------------|----------------------------------|
| /api/store/products       | GET    | None               | List of products                 |
| /api/store/products/{product_id} | GET | None           | Product details                  |
| /api/store/products       | POST   | ProductCreate      | {"message": "Product created successfully", "product_id": product_id} |
| /api/store/products/{product_id} | PUT | ProductUpdate   | {"message": "Product updated successfully"} |
| /api/store/products/{product_id} | DELETE | None         | {"message": "Product deleted successfully"} |
| /api/store/products/recent/{page} | GET | None           | List of recent products          |

### store_orders.py

| Endpoint                  | Method | Request Body       | Return Body                      |
|---------------------------|--------|--------------------|----------------------------------|
| /api/store/orders         | GET    | None               | List of orders                   |

### store_admin.py

| Endpoint                  | Method | Request Body       | Return Body                      |
|---------------------------|--------|--------------------|----------------------------------|
| /api/store/admin/new-employee | POST | EmployeeCreate   | {"message": "Employee created successfully"} |
| /api/store/admin/employees | GET  | None               | List of employees                |
| /api/store/admin/employee/{employee_id} | DELETE | None | {"message": "Employee deleted successfully"} |

### store_employee.py

| Endpoint                  | Method | Request Body       | Return Body                      |
|---------------------------|--------|--------------------|----------------------------------|
| /api/store/employee/product/{barcode} | GET | None       | Product details                  |
| /api/store/employee/submit-order | POST | OrderCart      | {"message": "Order submitted successfully!", "orderId": new_order_submitted} |
| /api/store/employee/invoice/{order_id} | GET | None       | PDF invoice                      |
| /api/store/employee/product/barcode/{product_id} | GET | None | Barcode image                    |

### image.py

| Endpoint                  | Method | Request Body       | Return Body                      |
|---------------------------|--------|--------------------|----------------------------------|
| /api/image/upload         | POST   | UploadFile, Form   | {"image_id": [image_id]}         |
| /api/image/{image_id}     | GET    | None               | {"image_url": image_url}         |
| /api/image/{image_id}     | DELETE | None               | {"message": "Image deleted successfully"} |