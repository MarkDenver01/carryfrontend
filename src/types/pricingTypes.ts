export interface ProductPriceDTO {
  priceId: number;
  productId: number;
  basePrice: number;
  effectiveDate: string;

  // Product details from relationship
  productName: string;
  productDescription: string;
  productCode: string;
  productImgUrl: string;
  productSize: string;
  stocks: number;
  categoryName: string;

  // For convenience in frontend (optional)
  recommendedProducts?: RecommendedProduct[];
}

// For frontend local state, same structure
export interface ProductPrice extends ProductPriceDTO {}

export interface RecommendedProduct {
  productId: number;
  productName: string;
  productImgUrl: string;
  productSize: string;
  price?: number;
  
}
