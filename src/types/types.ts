import { type RecommendationRuleDTO } from "../libs/models/product/RecommendedRule";
export interface Product {
  productId?: number;   // backend ID
  id?: number;          // frontend compatibility
  imageFile?: File | null;
  imageUrl?: string | null;

  code: string;
  name: string;
  productDescription: string;
  size: string;
  stock: number;

  expiryDate?: string | null;
  inDate?: string | null;

  status: "Available" | "Not Available" | "Out of Stock";

  categoryId?: number | null;
  categoryName?: string | null;

  recommendations?: RecommendationRuleDTO[];
}
