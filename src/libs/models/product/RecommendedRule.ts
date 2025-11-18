export interface RecommendationRuleRequest {
  baseProductId: number;
  recommendedProductIds: number[];
  effectiveDate: string; // ISO date string
  expiryDate: string; // ISO date string
}

export interface RecommendationRuleDTO {
  id: number;
  productId: number;
  productName: string;
  categoryName: string;
  recommendedNames: string[];
  effectiveDate: string;
  expiryDate: string;
  active: boolean;
}