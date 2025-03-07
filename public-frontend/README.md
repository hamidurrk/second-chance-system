# Second Chance Frontend (Public)

This repository is a frontend for the Second Chance e-commerce platform. It is built using Next.js and styled-components. Below is a detailed documentation of the pages, their functionalities, and how APIs are called and used to populate the website or send data.

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
git clone https://github.com/BoDS-Group/public-frontend.git
cd public-frontend
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
second-chance-frontend/
├── components/
│   ├── AxiosInstance.js
│   ├── Button.js
│   ├── ButtonLink.js
│   ├── CartContext.js
│   ├── Center.js
│   ├── Featured.js
│   ├── Header.js
│   ├── Input.js
│   ├── NewProducts.js
│   ├── ProductBox.js
│   ├── ProductImages.js
│   ├── ProductsGrid.js
│   ├── Table.js
│   ├── Title.js
│   ├── WhiteBox.js
│   ├── icons/
│   │   ├── Bars.js
│   │   └── CartIcon.js
├── pages/
│   ├── api/
│   ├── cart.js
│   ├── index.js
│   ├── product/
│   │   └── [id].js
│   ├── products.js
│   ├── _app.js
│   └── _document.js
├── public/
├── styles/
│   └── globals.css
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

### AxiosInstance.js
This component sets up an Axios instance with a base URL and default headers. It also includes an interceptor to add the authorization token to each request.

### Button.js
This component renders a styled button.

### ButtonLink.js
This component renders a styled link that looks like a button.

### CartContext.js
This component provides context for managing the cart state across the application.

### Center.js
This component provides a wrapper that centers its children.

### Featured.js
This component displays a featured product.

### Header.js
This component renders the navigation bar with links to various pages and the cart.

### Input.js
This component renders a styled input field.

### NewProducts.js
This component displays a list of new products.

### ProductBox.js
This component renders a box with product information.

### ProductImages.js
This component displays a gallery of product images.

### ProductsGrid.js
This component displays a grid of products.

### Table.js
This component renders a styled table.

### Title.js
This component renders a styled title.

### WhiteBox.js
This component renders a styled container with a white background.

### Icons
- **Bars.js**: Renders a bars icon.
- **CartIcon.js**: Renders a cart icon.

## Pages

### Home Page (`/`)
- **Components Used**: `Header`, `NewProducts`
- **Functionality**: Displays the header and a list of new products.
- **API Calls**: 
  - `fetchRecentProducts(page)`: Fetches recent products to display on the homepage.

### Product Page (`/product/[id]`)
- **Components Used**: `Header`, `Center`, `WhiteBox`, `ProductImages`, `Title`, `Button`, `CartIcon`
- **Functionality**: Displays detailed information about a specific product, including images, title, price, and description. Allows users to add the product to the cart.
- **API Calls**: 
  - `fetchProductById(id)`: Fetches product details by ID.
  - `fetchImageURL(imageId)`: Fetches image URLs for the product.

### Cart Page (`/cart`)
- **Components Used**: `Header`, `Center`, `Button`, `Table`, `Input`, `Modal`
- **Functionality**: Displays the products added to the cart, allows users to update quantities, remove products, and proceed to checkout. Handles user information and order submission.
- **API Calls**: 
  - `fetchProductsByIdsX(ids)`: Fetches product details for the products in the cart.
  - `axiosInstance.post('/orders/checkout-offline', payload)`: Submits the order for store pickup.
  - `axiosInstance.post('/orders/checkout-online', payload)`: Submits the order for home delivery.
  - `axiosInstance.post('/orders/create-checkout-session', { cart_items })`: Creates a Stripe checkout session.

### Products Page (`/products`)
- **Components Used**: `Header`, `Center`, `ProductsGrid`
- **Functionality**: Displays a list of all products with infinite scrolling and search functionality.
- **API Calls**: 
  - `fetchRecentProducts(page)`: Fetches recent products for the current page.
  - `searchProducts(searchTitle)`: Searches for products by title.

### _app.js
This file customizes the default App component to include the CartContextProvider for managing cart state.

### _document.js
This file customizes the default Document component to include additional HTML and body tags.

## API Integration

### Fetching Data
The application uses Axios to fetch data from the backend API. The `AxiosInstance.js` component sets up the Axios instance with a base URL and default headers.

### API Functions
The `utils/api.js` file contains functions for making API requests:

- `fetchRecentProducts(page)`: Fetches recent products.
- `fetchProductById(id)`: Fetches a product by its ID.
- `fetchImageURL(image_id)`: Fetches an image URL by its ID.
- `searchProducts(searchTitle)`: Searches for products by title.
- `fetchProductsByIdsX(ids)`: Fetches products by their IDs.

