import api from './api';
import type { LoginRequest, LoginResponse } from './models/login';

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
