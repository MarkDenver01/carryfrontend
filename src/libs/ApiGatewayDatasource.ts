import api from './api';
import type { LoginRequest, LoginResponse } from './models/login';
import type { ProductDTO } from './models/product/ProductDTO';

/**
 * Login.
 * @param request 
 * @returns Login response
 */
export async function login(request: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await api.post("/user/public/login", request);
    return response.data;
  } catch (error: any) {
    console.error("Login error:", error);
    throw error.response?.data || { message: "Login failed" };
  }
};

/**
 * Fetch all products with recommendations
 */
export async function getAllProductsWithRecommendations(): Promise<ProductDTO[]> {
  try {
    const response = await api.get('/api/product/product/get_recommendations');
    // If your backend returns { success, message, data } keep .data.data
    // If it returns data directly, change to response.data
    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error('Fetch products error:', error);
    throw error.response?.data || { message: 'Failed to fetch products' };
  }
}
