# Second Chance System

Second Chance is an end-to-end second-hand/thrift store management and sales system. It is designed to streamline the process of managing and selling second-hand items, providing a seamless experience for both store administrators and customers. The system is divided into four main repositories, each serving a specific role in the overall architecture.


**_Each directory has detailed documentation available within its respective folder, providing more in-depth information about its setup, usage, and development guidelines._**

## Repositories

## 1. Admin Frontend
The admin-frontend directory contains the code for the admin interface of the Second Chance system. It is used by store administrators to manage the stores and their administrators. Key features include:

- Store management
- Administrator management

## 2. Store Frontend
The store-frontend directory contains the code for the store interface of the Second Chance system. Both `store-admin` and `store-employee` can use this. Role Based Access Control using JWT is used for authentication and authorization.

### `store-admin` Role
They can manage inventory, process sales, and perform other administrative tasks. Key features include:

- Inventory management
- Category management
- Sales processing
- Order view
- Employee management (Create new or remove employees)

### `store-employee` Role
 This interface is used by store employees to interact with customers, manage point-of-sale transactions, and handle customer inquiries. Key features include:

- Point-of-sale system
- Customer management
- Transaction processing
- Real-time inventory updates

## 3. Public Frontend

The public-frontend directory contains the code for the public-facing website of the Second Chance system. This website allows customers to browse available items, make purchases online, and learn more about the store. Key features include:

- Online catalog of items
- Shopping cart and checkout
- Card payment processing using Stripe API

## 4. Backend

The backend directory contains the server-side code for the Second Chance system. It handles data storage, business logic, and communication between the different frontends. Key features include:

- RESTful FastAPI for frontend communication
- Database management
- Authentication and authorization
- Business logic implementation


