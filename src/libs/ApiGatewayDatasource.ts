import api from './api';
import type { LoginRequest, LoginResponse } from './models/login';
import type { ProductDTO, ProductRequest } from './models/product/Product';
/**
 * Login.
 */
export async function login(request: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await api.post('/user/public/login', request);
    return response.data;
  } catch (error: any) {
    console.error('Login error:', error);
    throw error.response?.data || { message: 'Login failed' };
  }
}

/**
 * Fetch all products with recommendations
 */
export async function getAllProductsWithRecommendations(): Promise<ProductDTO[]> {
  try {
    const response = await api.get('/api/product/get_recommendations');
    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error('Fetch products error:', error);
    throw error.response?.data || { message: 'Failed to fetch products' };
  }
}

/**
 * Add new product
 */
export async function addProduct(request: ProductRequest): Promise<ProductDTO> {
  try {
    const response = await api.post('/api/product/add', request);
    // backend returns { success, message, data } so unwrap if needed
    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error('Add product error:', error);
    throw error.response?.data || { message: 'Failed to add product' };
  }
}

/**
 * Update existing product
 */
export async function updateProduct(productId: number | string, request: ProductRequest): Promise<ProductDTO> {
  try {
    const response = await api.put(`/api/product/${productId}/update`, request);
    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error('Update product error:', error);
    throw error.response?.data || { message: 'Failed to update product' };
  }
}

/**
 * Delete product
 * @param productId product id
 */
export async function deleteProduct(productId: number): Promise<void> {
  try {
    await api.delete(`/api/product/${productId}/delete`);
  } catch (error: any) {
    console.error("Delete product error:", error);
    throw error.response?.data || { message: "Failed to delete product" };
  }
}

/**
 * Update product status only
 */
export async function updateProductStatus(
  productId: number | string,
  newStatus: string
): Promise<ProductDTO> {
  try {
    const response = await api.patch(`/api/product/${productId}/update_status`, {
      productStatus: newStatus,
    });
    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error("Update product status error:", error);
    throw error.response?.data || { message: "Failed to update product status" };
  }
}

