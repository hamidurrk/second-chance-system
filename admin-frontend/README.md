# System Admin Frontend

This repository contains the frontend code for the System Admin application. The application is built using Next.js and React, and it includes various components and pages to manage stores, products, and orders.

## Table of Contents

- Installation
- Usage
- Project Structure
- Components
- Pages
- API Integration

## Installation

To get started with the project, clone the repository and install the dependencies:

```bash
git clone https://github.com/BoDS-Group/admin-frontend.git
cd admin-frontend
npm install --legacy-peer-deps
```

### [IMPORTANT!] .env file setup
Use the `.env copy` file in your project. You need to rename it to `.env` and ensure that the environment variables are correctly set.

## Usage

To run the development server, use the following command:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Production Build
To build the project for production, use:

```bash
npm run build
```

To start the production server, use:

```bash
npm start
```

## Project Structure

The project structure is as follows:

```
admin-frontend/
├── components/
│   ├── AxiosInstance.js
│   ├── Layout.js
│   ├── LoginForm.js
│   ├── Logo.js
│   ├── Nav.js
│   ├── ProductForm.js
│   ├── Spinner.js
│   ├── StoreForm.js
│   └── UserContext.js
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── google.js
│   │   │   └── google/callback.js
│   ├── products/
│   │   ├── delete/[...id].js
│   │   ├── edit/[...id].js
│   │   └── new.js
│   ├── stores/
│   │   ├── delete/[...id].js
│   ├── add-store.js
│   ├── index.js
│   ├── orders.js
│   └── _app.js
│   └── _document.js
├── public/
├── styles/
│   ├── globals.css
│   └── Home.module.css
├── utils/
│   └── api.js
├── .env copy
├── .eslintrc.json
├── .gitignore
├── jsconfig.json
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── README.md
```

## Components

#### AxiosInstance.js
This component sets up an Axios instance with a base URL and default headers. It also includes an interceptor to add the authorization token to each request.

#### Layout.js
This component provides the layout for the application, including the navigation bar and user authentication handling.

#### LoginForm.js
This component renders the login form and handles user authentication.

#### Logo.js
This component renders the application logo.

#### Nav.js
This component renders the navigation bar with links to various pages.

#### ProductForm.js
This component renders the form for adding and editing products.

#### Spinner.js
This component renders a loading spinner.

#### StoreForm.js
This component renders the form for adding a new store.

#### UserContext.js
This component provides a context for managing user state across the application.

## Pages

#### index.js
The main landing page of the application. It displays a welcome message to the logged-in user.

#### add-store.js
This page renders the form for adding a new store.

#### orders.js
This page displays a list of orders.

#### products/new.js
Form to add a new product.

#### products/edit/[...id].js
Form to edit an existing product.

#### products/delete/[...id].js
Page to confirm the deletion of a product.

#### stores/delete/[...id].js
Page to confirm the deletion of a store.

#### api/auth/google.js
API route to initiate Google OAuth authentication. (Currently not in use)

#### api/auth/google/callback.js
API route to handle the callback from Google OAuth authentication. (Currently not in use)

#### _app.js
This file customizes the default App component to include the UserProvider for managing user state.

#### _document.js
This file customizes the default Document component to include additional HTML and body tags.

## API Integration

### Fetching Data
The application uses Axios to fetch data from the backend API. The `AxiosInstance.js` component sets up the Axios instance with a base URL and default headers.

### API Functions
The `utils/api.js` file contains functions for making API requests:

- `fetchStores()`: Fetches all stores.
- `fetchStoreById(id)`: Fetches a store by its ID.
- `deleteStoreById(id)`: Deletes a store by its ID.
- `fetchProducts()`: Fetches all products.
- `fetchProductById(id)`: Fetches a product by its ID.
- `deleteProductById(id)`: Deletes a product by its ID.
- `fetchCategories()`: Fetches all categories.
- `updateCategoryById(id, data)`: Updates a category by its ID.
- `deleteCategoryById(id)`: Deletes a category by its ID.
- `insertCategory(data)`: Inserts a new category.
- `fetchCities()`: Fetches all cities.
