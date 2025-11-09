import type { Product, ProductRecommended } from "./types";
import type {
  ProductDTO,
  ProductRecommendedDTO,
  ProductRequest,
} from "../../src/libs/models/product/Product";

export const formatDate = (d?: string | null) => {
  if (!d) return "";
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return d;
  return parsed.toISOString().split("T")[0];
};

export const mapRecommendationDTO = (r: ProductRecommendedDTO): ProductRecommended => ({
  productRecommendedId: r.productRecommendedId,
  productCode: r.productCode,
  productName: r.productName,
  productDescription: r.productDescription,
  productSize: r.productSize,
  productImgUrl: r.productImgUrl,
  expiryDate: r.expiryDate ? formatDate(r.expiryDate) : "",
  createdDate: r.createdDate ? formatDate(r.createdDate) : "",
});

export const mapProductDTO = (p: ProductDTO): Product => ({
  id: p.productId as number,
  image: p.productImgUrl ?? "",
  code: p.productCode ?? "",
  name: p.productName ?? "",
  description: p.productDescription ?? "",
  size: p.productSize ?? "",
  stock: p.stocks ?? 0,
  expiryDate: p.expiryDate ? formatDate(p.expiryDate) : "",
  inDate: p.productInDate ? formatDate(p.productInDate) : "",
  status: (p.productStatus ?? "").toLowerCase() === "available" ? "Available" : "Not Available",
  recommendations: (p.recommendations ?? []).map(mapRecommendationDTO),
});

export const toProductRequest = (p: Product): ProductRequest => {
  const clean = (val?: string | null) => (val && val.trim().length > 0 ? val.trim() : "");

  return {
    productCode: clean(p.code),
    productName: clean(p.name),
    productDescription: clean(p.description),
    stocks: Number(p.stock ?? 0),
    productSize: clean(p.size),
    productStatus: clean(p.status),
    productImgUrl: clean(typeof p.image === "string" ? p.image : ""), // must be string
    expiryDate: p.expiryDate ? new Date(p.expiryDate).toISOString() : null,
    productInDate: p.inDate ? new Date(p.inDate).toISOString() : null,
  };
};

