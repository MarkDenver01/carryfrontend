export interface ProductRecommended {
  productRecommendedId: number;
  productCode: string;
  productName: string;
  productDescription: string;
  productSize: string;
  productImgUrl: string;
  expiryDate?: string | null;
  createdDate?: string | null;
}

export interface Product {
  id?: number;
  image: string;
  code: string;
  name: string;
  description: string;
  size: string;
  stock: number;
  expiryDate?: string | null;
  inDate?: string | null;
  status: "Available" | "Not Available";
  recommendations?: ProductRecommended[];
}
