// src/types/recommendationTypes.ts

export type RecommendationStatus = "ACTIVE" | "INACTIVE";

/**
 * DTO from backend
 */
export interface RecommendationRuleDTO {
  id: number;
  baseProductId: number;
  baseProductCode: string;
  baseProductName: string;
  baseProductCategoryName?: string | null;

  recommendedProducts: {
    productId: number;
    productCode: string;
    productName: string;
  }[];

  effectiveDate: string; // ISO date string: "2025-01-01"
  expiryDate: string;    // ISO date string
  status: RecommendationStatus;
}

/**
 * Payload used when creating/updating a rule
 */
export interface RecommendationRulePayload {
  baseProductId: number | null;
  recommendedProductIds: number[];
  effectiveDate: string;
  expiryDate: string;
}

/**
 * Internal app model used by React
 */
export interface RecommendationRule {
  id: number;
  baseProductId: number;
  baseProductCode: string;
  baseProductName: string;
  baseProductCategoryName?: string | null;
  recommendedProducts: {
    productId: number;
    productCode: string;
    productName: string;
  }[];
  effectiveDate: string;
  expiryDate: string;
  status: RecommendationStatus;
}
