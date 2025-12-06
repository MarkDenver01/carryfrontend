import { type RecommendationRuleDTO } from "../libs/models/product/RecommendedRule";

export interface Product {
  productId?: number;         // ✔ actual backend ID
  imageFile?: File | null;    // ✔ for uploads
  imageUrl?: string | null;   // ✔ backend display URL

  code: string;
  name: string;
  productDescription: string;
  size: string;
  stock: number;

  expiryDate?: string | null;
  inDate?: string | null;

  status: "Available" | "Not Available" | "Out of Stock"; // add if needed

  categoryId?: number | null;
  categoryName?: string | null;

  recommendations?: RecommendationRuleDTO[];
}
