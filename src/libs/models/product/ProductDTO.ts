import type { ProductRecommendedDTO } from './ProductRecommendedDTO';

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
