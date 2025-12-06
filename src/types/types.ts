import { type RecommendationRuleDTO } from "../libs/models/product/RecommendedRule";

export interface Product {
  id?: number;
  imageFile?: File;    // for uploading new image
  imageUrl?: string;   // for display from backend
  code: string;
  name: string;
  productDescription: string;
  size: string;
  stock: number;
  expiryDate?: string | null;
  productInDate?: string | null;
  status: "Available" | "Not Available";

  categoryId?: number | null;
  categoryName?: string | null;

    // 👇 replace old "ProductRecommended[]" with the new structured rules
  recommendations?: RecommendationRuleDTO[];
}
