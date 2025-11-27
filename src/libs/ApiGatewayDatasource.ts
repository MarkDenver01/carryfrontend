import api from "./api";

// ---- TYPES ----
import type { LoginRequest, LoginResponse } from "./models/login";
import type { ProductDTO } from "./models/product/Product";
import type { CategoryDTO } from "./models/product/Category";
import type {
  RecommendationRuleDTO,
  RecommendationRuleRequest,
} from "./models/product/RecommendedRule";

import type { ProductPriceDTO, ProductPrice } from "../types/pricingTypes";

// ===============================
//        AUTH APIs
// ===============================

/** Login */
export async function login(request: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await api.post("/user/public/login", request);
    return response.data;
  } catch (error: any) {
    console.error("Login error:", error);
    throw error.response?.data || { message: "Login failed" };
  }
}

// ===============================
//       PRODUCT APIs
// ===============================

/** Fetch ALL PRODUCTS (clean list, no recommendations) */
export async function getAllProducts(): Promise<ProductDTO[]> {
  try {
    const response = await api.get("/admin/api/product/all");
    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error("Fetch all products error:", error);
    throw error.response?.data || { message: "Failed to fetch all products" };
  }
}

/** Fetch all products WITH recommendations */
export async function getAllProductsWithRecommendations(): Promise<ProductDTO[]> {
  try {
    const response = await api.get("/admin/api/product/get_recommendations");
    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error("Fetch products error:", error);
    throw error.response?.data || { message: "Failed to fetch products" };
  }
}

/** Add product (multipart form-data) */
export async function addProductFormData(
  formData: FormData
): Promise<ProductDTO> {
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

/** Update product (multipart form-data) */
export async function updateProductFormData(
  productId: number | string,
  formData: FormData
): Promise<ProductDTO> {
  try {
    const response = await api.put(
      `/admin/api/product/${productId}/update`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error("Update product error:", error);
    throw error.response?.data || { message: "Failed to update product" };
  }
}

/** Delete product */
export async function deleteProduct(productId: number): Promise<void> {
  try {
    await api.delete(`/admin/api/product/${productId}/delete`);
  } catch (error: any) {
    console.error("Delete product error:", error);
    throw error.response?.data || { message: "Failed to delete product" };
  }
}

/** Update product status only */
export async function updateProductStatus(
  productId: number | string,
  newStatus: string
): Promise<ProductDTO> {
  try {
    const response = await api.patch(
      `/admin/api/product/${productId}/update_status`,
      { productStatus: newStatus }
    );
    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error("Update product status error:", error);
    throw error.response?.data || { message: "Failed to update product status" };
  }
}

// ===============================
//         PRICE APIs
// ===============================

/** Fetch all product prices */
export async function getAllPrices(): Promise<ProductPriceDTO[]> {
  try {
    const response = await api.get("/user/public/api/price/all");
    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error("Fetch price list error:", error);
    throw error.response?.data || { message: "Failed to fetch prices" };
  }
}

/** Add new product price */
export async function addPriceForm(
  price: Partial<ProductPrice>
): Promise<ProductPriceDTO> {
  try {
    const response = await api.post("/user/public/api/price/add", price);
    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error("Add price error:", error);
    throw error.response?.data || { message: "Failed to add price" };
  }
}

/** Update product price */
export async function updatePriceForm(
  priceId: number,
  price: Partial<ProductPrice>
): Promise<ProductPriceDTO> {
  try {
    const response = await api.put(
      `/user/public/api/price/update/${priceId}`,
      price
    );
    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error("Update price error:", error);
    throw error.response?.data || { message: "Failed to update price" };
  }
}

/** Delete product price */
export async function deletePriceById(priceId: number): Promise<void> {
  try {
    await api.delete(`/user/public/api/price/delete/${priceId}`);
  } catch (error: any) {
    console.error("Delete price error:", error);
    throw error.response?.data || { message: "Failed to delete price" };
  }
}

// ===============================
//      CATEGORY APIs
// ===============================

/** Fetch all categories */
export async function getAllCategories(): Promise<CategoryDTO[]> {
  try {
    const response = await api.get("/admin/api/product-categories");
    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error("Fetch categories error:", error);
    throw error.response?.data || { message: "Failed to fetch categories" };
  }
}

/** Add category */
export async function addCategory(
  category: Partial<CategoryDTO>
): Promise<CategoryDTO> {
  try {
    const response = await api.post(
      "/admin/api/product-categories",
      category
    );
    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error("Add category error:", error);
    throw error.response?.data || { message: "Failed to add category" };
  }
}

/** Update category */
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

/** Delete category */
export async function deleteCategory(id: number): Promise<void> {
  try {
    await api.delete(`/admin/api/product-categories/${id}`);
  } catch (error: any) {
    console.error("Delete category error:", error);
    throw error.response?.data || { message: "Failed to delete category" };
  }
}

// ===============================
//   RECOMMENDATION RULE APIs
// ===============================

export async function fetchAllRules() {
  const response = await api.get<RecommendationRuleDTO[]>(
    "/admin/api/recommendation-rules"
  );
  return response.data;
}

export async function createRule(rule: RecommendationRuleRequest) {
  const response = await api.post<RecommendationRuleDTO>(
    "/admin/api/recommendation-rules",
    rule
  );
  return response.data;
}

export async function deleteRule(id: number) {
  await api.delete(`/admin/api/recommendation-rules/${id}`);
}

export async function updateRule(id: number, rule: RecommendationRuleRequest) {
  const response = await api.put<RecommendationRuleDTO>(
    `/admin/api/rules/${id}`,
    rule
  );
  return response.data;
}

// ===============================
//        DRIVER APIs
// ===============================

/** Register driver */
export async function registerDriver(formData: FormData) {
  try {
    const response = await api.post("/admin/api/driver/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error: any) {
    console.error("Driver registration failed:", error);
    throw error.response?.data || { message: "Failed to register driver" };
  }
}

// ===============================
//      EXPIRY ANALYTICS API
// ===============================

export interface ExpiryAnalyticsDTO {
  freshItems: number;
  moderateItems: number;
  nearExpiryItems: number;
  expiringOrExpiredItems: number;
}

/** Fetch expiry analytics */
export async function getExpiryAnalytics(): Promise<ExpiryAnalyticsDTO> {
  try {
    const response = await api.get("/admin/api/product/expiry-analytics");
    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error("Fetch expiry analytics error:", error);
    throw error.response?.data || { message: "Failed to fetch expiry analytics" };
  }
}
export interface InventoryAlertsDTO {
  lowStockItems: number;
  outOfStockItems: number;
  expiringSoonItems: number;
}

export async function getInventoryAlerts(): Promise<InventoryAlertsDTO> {
  try {
    const response = await api.get("/admin/api/product/inventory-alerts");
    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error("Fetch inventory alerts error:", error);
    throw error.response?.data || { message: "Failed to fetch inventory alerts" };
  }
}
export async function getTotalSales() {
  const response = await api.get("/user/public/api/orders/total-orders-sales");
  return response.data.totalSales;
}

export async function getTotalOrders() {
  const response = await api.get("/user/public/api/orders/total-orders");
  return response.data.totalOrders;
}

export async function getTotalCustomers() {
  const response = await api.get("/user/public/customers/total");
  return response.data.totalCustomers;
}

export async function fetchAllOrders(): Promise<any[]> {
  try {
    const res = await api.get("/user/public/api/orders/all");
    return res.data;
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    return [];
  }
}

export async function fetchOrdersByCustomer(customerId: number) {
  return api.get(`/user/public/api/orders/customer/${customerId}`);
}

export async function fetchOrder(orderId: number) {
  return api.get(`/user/public/api/orders/${orderId}`);
}

export async function checkoutOrder(payload: any) {
  return api.post(`/user/public/api/orders/checkout`, payload);
}



