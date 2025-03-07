import axiosInstance from "@/components/AxiosInstance";

// Fetch all products
export async function fetchRecentProducts(page) {
  try {
    const response = await axiosInstance.get(`/products/recent/${page}`);
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

export async function searchProducts(searchTitle) {
  try {
    const response = await axiosInstance.post(`/products/search`, { title: searchTitle });
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

export async function fetchImageURL(image_id) {
    try {
        const response = await axiosInstance.get(`/image/${image_id}`);
        // console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching image:', error);
    }
}

// Fetch a single product
export async function fetchProductById(id) {
    try {
      const response = await axiosInstance.get(`/products/${id}`);
    //   console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  }

// Fetch products by a list of ids
export async function fetchProductsByIds(ids) {
  try {
    const requestBody = { ids: ids };
    // console.log(requestBody);
    const response = await axiosInstance.post('/products/ids', { "ids": ids });
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

export async function fetchProductsByIdsX(ids) {
  try {
    const requestBody = { ids: ids };
    // console.log(requestBody);
    const response = await axiosInstance.post('/products/ids', requestBody);
    const products = response.data;

    // Fetch and replace image URLs
    const updatedProducts = await Promise.all(products.map(async (product) => {
      if (product.images && product.images.length > 0) {
        const imageId = product.images[0];
        const imageUrlResponse = await fetchImageURL(imageId);
        product.images = [imageUrlResponse.image_url];
      }
      return product;
    }));

    return updatedProducts;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

// Fetch all categories
export async function fetchCategories() {
  try {
    const response = await axiosInstance.get('/categories');
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
}

// Delete a product by id
export async function deleteProductById(id) {
  try {
    const response = await axiosInstance.delete(`/products/${id}`);
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error);
  }
}

// Update a category by id
export async function updateCategoryById(id, data) {
  try {
    const response = await axiosInstance.put(`/categories/${id}`, data);
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
  }
}

// Delete a category by id
export async function deleteCategoryById(id) {
  try {
    const response = await axiosInstance.delete(`/categories/${id}`);
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting category:', error);
  }
}

// Insert a category
export async function insertCategory(data) {
  try {
    const response = await axiosInstance.post('/categories', data);
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error inserting category:', error);
  }
}