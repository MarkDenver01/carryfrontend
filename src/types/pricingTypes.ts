export interface ProductPriceDTO {
  priceId: number;
  productId: number;
  basePrice: number;
  effectiveDate: string;

  productName: string;
  productCode: string;
  productSize: string;
  productImgUrl: string;
  stocks: number;
  categoryName: string;
}

export interface ProductPrice {
  priceId: number;
  productId: number;
  basePrice: number;
  effectiveDate: string;

  productName: string;
  productCode: string;
  productSize: string;
  productImgUrl: string;
  stocks: number;
  categoryName: string;
}
