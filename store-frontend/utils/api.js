import axiosInstance from "@/components/AxiosInstance";

// Fetch store data from stores table by store_id
export async function fetchStoreData() {
  try {
    const response = await axiosInstance.get('/store');
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching store data:', error);
  }
}

// Fetch image url by image_id
export async function fetchImageURL(image_id) {
  try {
      const response = await axiosInstance.get(`/image/${image_id}`);
      // console.log(response.data);
      return response.data;
  } catch (error) {
      console.error('Error fetching image:', error);
  }
}

// Fetch all products
export async function fetchProducts() {
  try {
    const response = await axiosInstance.get('/store/products');
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

// Fetch a single product
export async function fetchProductById(id) {
    try {
      const response = await axiosInstance.get(`/store/products/${id}`);
    //   console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  }

// Fetch all categories
export async function fetchCategories() {
  try {
    const response = await axiosInstance.get('/store/categories');
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
}

// Delete a product by id
export async function deleteProductById(id) {
  try {
    const response = await axiosInstance.delete(`/store/products/${id}`);
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error);
  }
}

// Update a category by id
export async function updateCategoryById(id, data) {
  try {
    const response = await axiosInstance.put(`/store/categories/${id}`, data);
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
  }
}

// Delete a category by id
export async function deleteCategoryById(id) {
  try {
    const response = await axiosInstance.delete(`/store/categories/${id}`);
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting category:', error);
  }
}

// Insert a category
export async function insertCategory(data) {
  try {
    const response = await axiosInstance.post('/store/categories', data);
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error inserting category:', error);
  }
}

