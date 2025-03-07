from utils.db_utils import *
from base_models.models import *
import uuid
import json
import hashlib
import pandas as pd

def encode_password(password: str) -> str:
    sha_signature = hashlib.sha256(password.encode()).hexdigest()
    return sha_signature

# Define the table name and attributes
table_name = 'roles'
attributes = {
    'id': 'UUID PRIMARY KEY',
    'role': 'VARCHAR(50) NOT NULL',
    'FOREIGN KEY (id)': 'REFERENCES store_users(id)'
}

table_name = 'store_users'
attributes = {
    'id': 'UUID PRIMARY KEY',
    'email': 'VARCHAR(255) NOT NULL',
    'name': 'VARCHAR(127) NOT NULL',
    'picture': 'VARCHAR(255)',
    'address': 'VARCHAR(255)',
    'store_id': 'UUID',
    'FOREIGN KEY (store_id)': 'REFERENCES stores(id)'
}

table_name = 'categories'
attributes = {
    'id': 'SERIAL PRIMARY KEY',
    'name': 'VARCHAR(255) NOT NULL',
    'parent': 'INTEGER REFERENCES categories(id)',
    'properties': 'JSONB'
}

# table_name = 'orders'
# attributes = {
#     'id': 'SERIAL PRIMARY KEY',
#     'line_items': 'JSONB',
#     'name': 'VARCHAR(255)',
#     'email': 'VARCHAR(255)',
#     'city': 'VARCHAR(255)',
#     'postal_code': 'VARCHAR(20)',
#     'street_address': 'VARCHAR(255)',
#     'country': 'VARCHAR(255)',
#     'paid': 'BOOLEAN',
#     'created_at': 'TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP',
#     'updated_at': 'TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP'
# }

table_name = 'passwords'
attributes = {
    'id': 'UUID PRIMARY KEY',
    'password': 'VARCHAR(255) NOT NULL',
    'FOREIGN KEY (id)': 'REFERENCES store_users(id)'
}

table_name = 'system_admin'
attributes = {
    'id': 'UUID PRIMARY KEY',
    'name': 'VARCHAR(255) NOT NULL',
    'email': 'VARCHAR(255) NOT NULL',
    'password': 'VARCHAR(255) NOT NULL',
    'phone_number': 'VARCHAR',
    'created_at': 'TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP',
    'updated_at': 'TIMESTAMPTZ',
    'deleted_at': 'TIMESTAMPTZ'
}

table_name = 'cities'
attributes = {
    'id': 'SERIAL PRIMARY KEY',
    'city': 'VARCHAR(50) NOT NULL',
    'lat': 'VARCHAR(20)',
    'lng': 'VARCHAR(20)'
}

table_name = 'stores'
attributes = {
    'id': 'UUID PRIMARY KEY',
    'name': 'VARCHAR(127) NOT NULL',
    'description': 'TEXT',
    'city': 'VARCHAR(50) NOT NULL',
    'location': 'VARCHAR(255) NOT NULL',
    'image': 'UUID',
    'sustainability_achievement': 'TEXT',
    'home_delivery': 'BOOLEAN'
}

table_name = 'products'
attributes = {
    'id': 'SERIAL PRIMARY KEY',
    'title': 'VARCHAR(255) NOT NULL',
    'description': 'TEXT',
    'price': 'NUMERIC(10, 2) NOT NULL',
    'images': 'TEXT[]',
    'category': 'INTEGER[]',
    'properties': 'JSONB',
    'store_id': 'UUID REFERENCES stores(id)',
    'barcode': 'VARCHAR',
    'carbon_savings': 'VARCHAR(127)',
    'status': 'BOOLEAN',
    'qty': 'INTEGER NOT NULL DEFAULT 1',
    'created_at': 'TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP',
    'updated_at': 'TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP'
}

table_name = 'customers'
attributes = {
    'id': 'UUID PRIMARY KEY',
    'name': 'VARCHAR(255) NOT NULL',
    'email': 'VARCHAR(50) NOT NULL',
    'phone_number': 'VARCHAR(20) NOT NULL',
    'created_at': 'TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP',
    'sustainability_achievement': 'TEXT'
}

table_name = 'customer_addresses'
attributes = {
    'id': 'UUID PRIMARY KEY',
    'customer_id': 'UUID REFERENCES customer(id)',
    'street_address': 'VARCHAR(255) NOT NULL',
    'country': 'VARCHAR(255) NOT NULL',
    'city': 'VARCHAR(255)',
    'postal_code': 'VARCHAR(20)',
    'created_at': 'TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP',
    'deleted_at': 'TIMESTAMPTZ'
}

table_name = 'customer_passwords'
attributes = {
    'id': 'UUID PRIMARY KEY REFERENCES customer(id)',
    'password': 'VARCHAR(255) NOT NULL'
}

table_name = 'orders'
attributes = {
    'id': 'UUID PRIMARY KEY',
    'customer_id': 'UUID NOT NULL REFERENCES customers(id)',
    'store_id': 'UUID NOT NULL REFERENCES stores(id)',
    'delivery': 'BOOLEAN NOT NULL',
    'delivery_address_id': 'UUID REFERENCES customer_addresses(id)',
    'order_otp': 'VARCHAR',
    'status': 'VARCHAR NOT NULL',
    'paid': 'BOOLEAN NOT NULL',
    'total': 'INTEGER NOT NULL',
    'created_at': 'TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP',
    'updated_at': 'TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP'
}

table_name = 'order_items'
attributes = {
    'id': 'UUID PRIMARY KEY',
    'order_id': 'UUID NOT NULL REFERENCES orders(id)',
    'product_id': 'INTEGER NOT NULL REFERENCES products(id)',
    'qty': 'INTEGER NOT NULL',
    'created_at': 'TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP',
    'updated_at': 'TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP'
}
# product_qty = int(read_column('products', 'qty', conditions={'id': 1})[0])
# update_record('products', attributes=['qty'], values=[f"{product_qty-1}"], conditions={'id': 1})

# alter_table(table_name='orders', action='DROP', column_name='line_items')

# user = read_record('store_users', conditions={'email': 'red.emp1@gmail.com'})
# delete_record('roles', conditions={'id': user.get('id')})
# delete_record('passwords', conditions={'id': user.get('id')})
# delete_record('store_users', conditions={'email': 'red.emp1@gmail.com'})

# create_table(table_name, attributes)
# print("Table Name:", table_name)

# drop_table('orders')

# alter_table(table_name='products', action='ADD', column_name='qty', column_type='INTEGER NOT NULL DEFAULT 1')

# print("Added column 'qty' to the 'products' table")

# delete_all_records('customer_passwords')
# delete_all_records('order_items')
# delete_all_records('orders')
# delete_all_records('customer_addresses')
# delete_all_records('customers')


# drop_table('products')
# create_table(table_name, attributes)

# attributes = [
#         "store_users.id AS user_id", 
#         "store_users.email", 
#         "store_users.name AS user_name", 
#         "stores.id AS store_id", 
#         "stores.name AS store_name", 
#         "stores.description", 
#         "stores.city", 
#         "stores.location"
#     ]
# tables = ["store_users", "stores", "roles"]
# join_conditions = ["store_users.store_id = stores.id", "store_users.id = roles.id"]
# conditions = {"roles.role": "STORE_ADMIN"}

# system_admins_with_stores = read_joined_records(tables, join_conditions, attributes, conditions)
# print(system_admins_with_stores)

# delete_all_records("products")
# delete_all_records("categories")
# delete_all_records("images")
# delete_all_records("orders")
# # delete_all_records("passwords")
# delete_all_records("roles")
# delete_all_records("store_users")
# delete_all_records("stores")

# alter_table(table_name='products', action='ADD', column_name='store_id', column_type='UUID REFERENCES stores(id)')
# alter_table(table_name='products', action='ADD', column_name='barcode', column_type='VARCHAR')
# alter_table(table_name='products', action='ADD', column_name='carbon_savings', column_type='VARCHAR(127)')
# alter_table(table_name='products', action='ADD', column_name='status', column_type='BOOLEAN')
# print("Table Name:", table_name)

# drop_table('stores')

# csv_file_path = 'data/fi.csv'
# cities_data = pd.read_csv(csv_file_path)

# # Insert data into the cities table
# for index, row in cities_data.iterrows():
#     city = row['city']
#     lat = row['lat']
#     lng = row['lng']
#     insert_record(
#         table_name,
#         attributes=['city', 'lat', 'lng'],
#         values=[city, lat, lng]
#     )

# print("Inserted data from CSV into cities table")

# record_id = str(uuid.uuid4())
# name = 'Md Hamidur Rahman Khan'
# email = 'hrk.admin@sc.com'
# password = encode_password('test1234')  
# phone_number = '1234567890'

# insert_record(
#     table_name,
#     attributes=['id', 'name', 'email', 'password', 'phone_number'],
#     values=[record_id, name, email, password, phone_number]
# )

# print(f"Inserted test entry with ID: {record_id}")

# Insert a record
# record_id = str(uuid.uuid4())
# email = 'hamidurrk@gmail.com'
# role = 'STORE_ADMIN'

# insert_record(
#     table_name,
#     attributes=['id', 'email', 'role'],
#     values=[record_id, email, role]
# )

# print(f"Inserted record with ID: {record_id}")
# existing_user = read_record('roles', conditions={'email': "hamidurrk@gmail.com"})
# print(existing_user.get('role'))

# # Insert a record into the categories table
# category_name = 'Uncategorized'
# parent_category = None  # Assuming this is a top-level category
# properties = properties = {
# }  # Assuming no additional properties

# # Convert properties dictionary to JSON string
# properties_json = json.dumps(properties)

# insert_record(
#     'categories',
#     attributes=['name', 'parent', 'properties'],
#     values=[category_name, parent_category, properties_json]
# )

# print("Inserted category with name:", category_name)

# # Insert a record into the products table
# title = 'Sample Product'
# description = 'This is a sample product description.'
# price = 19.99
# images = ['image1.jpg', 'image2.jpg']
# category = 1  # Assuming category with id 1 exists
# properties = {'color': 'red', 'size': 'M'}

# # Convert properties dictionary to JSON string
# properties_json = json.dumps(properties)

# insert_record(
#     'products',
#     attributes=['title', 'description', 'price', 'images', 'category', 'properties'],
#     values=[title, description, price, images, category, properties_json]
# )

# print("Inserted product with title:", title)

# delete_record('categories', conditions={'id': 1})
# print("Deleted category with ID: 1")

# def get_all_cities():
#     cities = read_column(table_name='cities', column_name='city')
#     return cities

# print(get_all_cities())

# def get_orders_response():
#     query = "SELECT * FROM order_response_view"
#     result = execute_query(query)
#     print(result)
#     orders = []
#     for row in result:
#         order = Order(
#             _id=row[0],
#             createdAt=row[1],
#             paid=row[2],
#             name=row[3],
#             email=row[4],
#             city=row[5],
#             postalCode=row[6],
#             country=row[7],
#             streetAddress=row[8],
#             customer_id=row[9],
#             store_id=row[10],
#             delivery=row[11],
#             delivery_address_id=row[12],
#             order_otp=row[13],
#             status=row[14],
#             total=row[15],
#             line_items=[LineItem(**item) for item in row[16]]
#         )
#         orders.append(order)
#     return OrdersResponse(orders=orders)


# Example usage
# orders_response = read_records('order_response_view')
# print(orders_response)

print(get_products_by_title("Saucony Men's Kinvara 17 Running Shoes"))