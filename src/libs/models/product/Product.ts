
export interface ProductDTO {
  productId: number;
  productCode: string;
  productName: string;
  productDescription: string;
  stocks: number;
  productSize: string;
  productStatus: string;
  productImgUrl: string;
  expiryDate?: string | null;
  productInDate?: string | null;
  recommendations: ProductRecommendedDTO[];
}

export interface ProductRecommendedDTO {
  productRecommendedId: number;
  productCode: string;
  productName: string;
  productDescription: string;
  productSize: string;
  productImgUrl: string;
  expiryDate?: string | null;
  createdDate?: string | null;
}

export interface ProductRequest {
  productCode: string;
  productName: string;
  productDescription: string;
  stocks: number;
  productSize: string;
  productStatus: string; // "Available" | "Not Available" or other statuses
  productImgUrl: string;
  expiryDate?: string | null;     // ISO string
  productInDate?: string | null;  // ISO string
}