# Store Frontend - Second Chance

This repository contains the frontend code for the Store application. The application is built using Next.js and React, and it includes various components and pages to manage products, categories, orders, and settings.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Components](#components)
- [Pages](#pages)
- [API Integration](#api-integration)
- [Contributing](#contributing)
- [License](#license)

## Installation

To get started with the project, clone the repository and install the dependencies:

```bash
git clone https://github.com/BoDS-Group/store-frontend.git
cd store-frontend
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
store-frontend/
├── components/
│   ├── AddEmployeeForm.js
│   ├── AxiosInstance.js
│   ├── Button.js
│   ├── DownloadBarcodeButton.js
│   ├── Layout.js
│   ├── LoginForm.js
│   ├── Logo.js
│   ├── Nav.js
│   ├── ProductForm.js
│   ├── Spinner.js
│   ├── Table.js
│   └── UserContext.js
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── google.js
│   │   │   └── google/callback.js
│   ├── categories.js
│   ├── employees.js
│   ├── index.js
│   ├── orders.js
│   ├── products/
│   │   ├── delete/[...id].js
│   │   ├── edit/[...id].js
│   │   ├── new.js
│   ├── sales.js
│   ├── settings.js
│   ├── _app.js
│   ├── _document.js
├── public/
│   ├── images/
│   └── styles/
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
├── README.md
└── tailwind.config.js
```

## Components

#### AddEmployeeForm.js

Form to add a new employee.

#### AxiosInstance.js

Axios instance configured with base URL and interceptors for handling requests and responses.

#### Button.js

Styled button component.

#### DownloadBarcodeButton.js

Button to download the barcode of a product.

#### Layout.js

Layout component that includes navigation and user authentication handling.

#### LoginForm.js

Form for user login.

#### Logo.js

Component to display the logo.

#### Nav.js

Component to render the navigation bar.

#### ProductForm.js

Form to add or edit a product.

#### Spinner.js

Component to display a loading spinner.

#### Table.js

Styled table component.

#### UserContext.js

Context to manage user state.

## Pages

#### index.js

The main landing page of the application. Displays store information and user greeting.

#### products.js

Displays a list of products with options to add, edit, delete, and download barcodes.

#### products/new.js

Form to add a new product.

#### products/edit/[...id].js

Form to edit an existing product.

#### products/delete/[...id].js

Page to confirm the deletion of a product.

#### categories.js

Displays a list of categories with options to add, edit, and delete categories.

#### orders.js

Displays a list of orders with details such as date, payment status, recipient, type, and products.

#### employees.js

Displays a list of employees with options to add and delete employees.

#### sales.js

Page to handle sales entry by scanning product barcodes and submitting orders.

#### settings.js

Page to manage settings, including adding new employees.

#### api/auth/google.js

API route to handle Google OAuth authentication. (Currently not in use)

#### api/auth/google/callback.js

API route to handle the callback from Google OAuth authentication. (Currently not in use)

#### _app.js

Custom App component to initialize the UserProvider context.

#### _document.js

Custom Document component to set up the HTML structure.

## API Integration

The application uses Axios for API calls. The `AxiosInstance.js` file sets up an Axios instance with a base URL and interceptors for handling requests and responses.

### Fetch Store Data

```js
import { fetchStoreData } from "@/utils/api";

useEffect(() => {
  async function fetchData() {
    const storeData = await fetchStoreData();
    setStore(storeData);
  }
  fetchData();
}, []);
```

### Fetch Products

```js
import { fetchProducts } from "@/utils/api";

useEffect(() => {
  async function fetchData() {
    const productsData = await fetchProducts();
    setProducts(productsData);
  }
  fetchData();
}, []);
```

### Fetch Categories

```js
import { fetchCategories } from "@/utils/api";

useEffect(() => {
  async function fetchData() {
    const categoriesData = await fetchCategories();
    setCategories(categoriesData);
  }
  fetchData();
}, []);
```

### Fetch Product by ID

```js
import { fetchProductById } from "@/utils/api";

useEffect(() => {
  async function fetchData() {
    const productData = await fetchProductById(id);
    setProductInfo(productData);
  }
  fetchData();
}, [id]);
```

### Delete Product by ID

```js
import { deleteProductById } from "@/utils/api";

async function deleteProduct() {
  await deleteProductById(id);
  router.push('/products');
}
```

### Update Category by ID

```js
import { updateCategoryById } from "@/utils/api";

async function saveCategory() {
  await updateCategoryById(editedCategory.id, data);
}
```

### Delete Category by ID

```js
import { deleteCategoryById } from "@/utils/api";

async function deleteCategory(id) {
  await deleteCategoryById(id);
}
```

### Insert Category

```js
import { insertCategory } from "@/utils/api";

async function saveCategory() {
  await insertCategory(data);
}
```