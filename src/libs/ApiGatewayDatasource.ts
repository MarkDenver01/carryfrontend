import api from './api';
import type { LoginRequest, LoginResponse } from './models/login';
import type { ProductDTO } from './models/product/Product';
import type { ProductPriceDTO } from "../types/pricingTypes";
import type { ProductPrice } from "../types/pricingTypes";
import type { CategoryDTO } from './models/product/Category';
import type { RecommendationRuleDTO, RecommendationRuleRequest } from './models/product/RecommendedRule';
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
    const response = await api.get('/admin/api/product/get_recommendations');
    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error('Fetch products error:', error);
    throw error.response?.data || { message: 'Failed to fetch products' };
  }
}

/**
 * Add product with FormData (supports image upload)
 */
export async function addProductFormData(formData: FormData): Promise<ProductDTO> {
  try {
    const response = await api.post("/admin/api/product/add", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error("Add product error:", error);
    throw error.response?.data || { message: "Failed to add product" };
  }
}


/**
 * Update product with FormData (supports image upload)
 */
export async function updateProductFormData(productId: number | string, formData: FormData): Promise<ProductDTO> {
  try {
    const response = await api.put(`/admin/api/product/${productId}/update`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error("Update product error:", error);
    throw error.response?.data || { message: "Failed to update product" };
  }
}


/**
 * Delete product
 * @param productId product id
 */
export async function deleteProduct(productId: number): Promise<void> {
  try {
    await api.delete(`/admin/api/product/${productId}/delete`);
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
    const response = await api.patch(`/admin/api/product/${productId}/update_status`, {
      productStatus: newStatus,
    });
    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error("Update product status error:", error);
    throw error.response?.data || { message: "Failed to update product status" };
  }
}

/** Fetch all product prices */
export async function getAllPrices(): Promise<ProductPriceDTO[]> {
  const response = await api.get("/user/public/api/price/all");
  return response.data?.data ?? response.data;
}

/** Add product price */
export async function addPriceForm(price: Partial<ProductPrice>): Promise<ProductPriceDTO> {
  const response = await api.post("/user/public/api/price/add", price);
  return response.data?.data ?? response.data;
}

/** Update product price */
export async function updatePriceForm(
  priceId: number,
  price: Partial<ProductPrice>
): Promise<ProductPriceDTO> {
  const response = await api.put(`/user/public/api/price/update/${priceId}`, price);
  return response.data?.data ?? response.data;
}

/** Delete product price */
export async function deletePriceById(priceId: number): Promise<void> {
  await api.delete(`/user/public/api/price/delete/${priceId}`);
}

/**
 * Fetch all categories
 */
export async function getAllCategories(): Promise<CategoryDTO[]> {
  try {
    const response = await api.get("/admin/api/product-categories");
    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error("Fetch categories error:", error);
    throw error.response?.data || { message: "Failed to fetch categories" };
  }
}

/**
 * Add category
 */
export async function addCategory(
  category: Partial<CategoryDTO>
): Promise<CategoryDTO> {
  try {
    const response = await api.post("/admin/api/product-categories", category);
    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error("Add category error:", error);
    throw error.response?.data || { message: "Failed to add category" };
  }
}

/**
 * Update category
 */
export async function updateCategory(
  id: number,
  category: Partial<CategoryDTO>
): Promise<CategoryDTO> {
  try {
    const response = await api.put(
      `/admin/api/product-categories/${id}`,
      category
    );
    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error("Update category error:", error);
    throw error.response?.data || { message: "Failed to update category" };
  }
}

/**
 * Delete category
 */
export async function deleteCategory(id: number): Promise<void> {
  try {
    await api.delete(`/admin/api/product-categories/${id}`);
  } catch (error: any) {
    console.error("Delete category error:", error);
    throw error.response?.data || { message: "Failed to delete category" };
  }
}

export async function fetchAllRules() {
  const res = await api.get<RecommendationRuleDTO[]>("/admin/api/recommendation-rules");
  return res.data;
}

export async function createRule(rule: RecommendationRuleRequest) {
  const res = await api.post<RecommendationRuleDTO>("/admin/api/recommendation-rules", rule);
  return res.data;
}

export async function deleteRule(id: number) {
  await api.delete(`/admin/api/recommendation-rules/${id}`);
}

export async function updateRule(id: number, rule: RecommendationRuleRequest) {
  const res = await api.put<RecommendationRuleDTO>(`/admin/api/rules/${id}`, rule);
  return res.data;
}

/**
 * Register Driver (Multipart Upload)
 */
export async function registerDriver(formData: FormData) {
  try {
    const response = await api.post("/admin/api/driver/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data; // backend returns Driver
  } catch (error: any) {
    console.error("Driver registration failed:", error);
    throw error.response?.data || { message: "Failed to register driver" };
  }
}
// types/models
export interface ExpiryAnalyticsDTO {
  freshItems: number;
  moderateItems: number;
  nearExpiryItems: number;
  expiringOrExpiredItems: number;
}

// ---- function ----
export async function getExpiryAnalytics(): Promise<ExpiryAnalyticsDTO> {
  try {
    const response = await api.get("/admin/api/product/expiry-analytics");
    // because of BaseController.ok(...)
    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error("Fetch expiry analytics error:", error);
    throw error.response?.data || { message: "Failed to fetch expiry analytics" };
  }
}

