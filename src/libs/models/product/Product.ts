import type { RecommendationRuleDTO } from "../../../libs/models/product/RecommendedRule";

export interface ProductDTO {
  productId: number;
  productCode: string;
  productName: string;
  productDescription: string;
  stocks: number;
  productSize: string;
  productStatus: string;
  productImgUrl: string;
  expiryDate: string | null;
  productInDate: string | null;
  categoryId: number | null;
  categoryName: string | null;

  // ✅ Replace old ProductRecommendedDTO[]
  recommendations: RecommendationRuleDTO[];
}

export interface ProductRequest {
  productCode: string;
  productName: string;
  productDescription: string;
  stocks: number;
  productSize: string;
  productStatus: string; // "Available" | "Not Available"
  productImgFile?: File; // multipart upload
  expiryDate: string;     // ISO string
  productInDate: string;  // ISO string
  categoryId: number | null;
}
