export interface ProductPriceDTO {
  priceId: number;
  productId: number;
  productName: string;
  basePrice: number;
  taxPercentage: number;
  discountCategory: "SENIOR" | "PWD" | "STUDENT" | "PROMO" | "NONE";
  discountPercentage?: number | null;
  effectiveDate: string;
}

export interface ProductPrice {
  priceId: number;
  productId: number;
  productName: string;
  basePrice: number;
  taxPercentage: number;
  discountCategory: string;
  discountPercentage: number;
  effectiveDate: string;
}
