import type { Product, ProductRecommended } from "./types";
import type {
  ProductDTO,
  ProductRecommendedDTO,
  ProductRequest,
} from "../../src/libs/models/product/Product";

/** Format date as yyyy-MM-dd */
export const formatDate = (d?: string | null) => {
  if (!d) return "";
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return d;
  return parsed.toISOString().split("T")[0];
};

/** Maps a ProductRecommendedDTO → ProductRecommended */
export const mapRecommendationDTO = (
  r: ProductRecommendedDTO
): ProductRecommended => ({
  productRecommendedId: r.productRecommendedId,
  productCode: r.productCode,
  productName: r.productName,
  productDescription: r.productDescription,
  productSize: r.productSize,
  productImgUrl: r.productImgUrl,
  expiryDate: r.expiryDate ? formatDate(r.expiryDate) : "",
  createdDate: r.createdDate ? formatDate(r.createdDate) : "",
});

/** Maps a ProductDTO → Product (frontend type) */
export const mapProductDTO = (p: ProductDTO): Product => ({
  id: p.productId,
  imageUrl: p.productImgUrl ?? "",
  imageFile: undefined,
  code: p.productCode ?? "",
  name: p.productName ?? "",
  description: p.productDescription ?? "",
  size: p.productSize ?? "",
  stock: p.stocks ?? 0,
  expiryDate: p.expiryDate ? formatDate(p.expiryDate) : "",
  inDate: p.productInDate ? formatDate(p.productInDate) : "",
  status: (p.productStatus ?? "").toLowerCase() === "available" ? "Available" : "Not Available",
  categoryId: p.categoryId ?? null, 
  recommendations: (p.recommendations ?? []).map(mapRecommendationDTO),
});

/** Clean up text fields */
const clean = (val?: string | null) => val?.trim() ?? "";

/** Format date for backend (append T00:00:00 if not included) */
const formatDateForBackend = (d?: string | null): string => {
  if (!d) return "";
  return d.includes("T") ? d : `${d}T00:00:00`;
};

/**
 * Converts Product → ProductRequest (JSON-friendly object)
 * Used for PUT / PATCH without file upload
 */
export const toProductRequest = (p: Product): ProductRequest => ({
  productCode: clean(p.code),
  productName: clean(p.name),
  productDescription: clean(p.description),
  stocks: Number(p.stock ?? 0),
  productSize: clean(p.size),
  productStatus: clean(p.status),
  productImgFile: p.imageFile,
  expiryDate: formatDateForBackend(p.expiryDate),
  productInDate: formatDateForBackend(p.inDate),
  categoryId: p.categoryId ?? null,
});

/**
 * Converts Product + optional imageFile → FormData (for backend multipart/form-data)
 */
export const toProductFormData = (p: Product, imageFile?: File): FormData => {
  const formData = new FormData();

  // JSON part
  const productJson = {
    productCode: clean(p.code),
    productName: clean(p.name),
    productDescription: clean(p.description),
    stocks: Number(p.stock ?? 0),
    productSize: clean(p.size),
    productStatus: clean(p.status),
    productImgUrl: p.imageUrl ?? "", // fallback if no file uploaded
    expiryDate: p.expiryDate ? formatDateForBackend(p.expiryDate) : "",
    productInDate: p.inDate ? formatDateForBackend(p.inDate) : "",
    categoryId: p.categoryId ?? null,
  };

  formData.append(
    "product",
    new Blob([JSON.stringify(productJson)], { type: "application/json" })
  );

  // File part (priority: imageFile argument > p.imageFile)
  const fileToUpload = imageFile ?? p.imageFile;
  if (fileToUpload) formData.append("file", fileToUpload);

  return formData;
};
