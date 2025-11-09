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
  id: p.productId as number,
  imageUrl: p.productImgUrl ?? "",
  code: p.productCode ?? "",
  name: p.productName ?? "",
  description: p.productDescription ?? "",
  size: p.productSize ?? "",
  stock: p.stocks ?? 0,
  expiryDate: p.expiryDate ? formatDate(p.expiryDate) : "",
  inDate: p.productInDate ? formatDate(p.productInDate) : "",
  status:
    (p.productStatus ?? "").toLowerCase() === "available"
      ? "Available"
      : "Not Available",
  recommendations: (p.recommendations ?? []).map(mapRecommendationDTO),
});

/** Clean up text fields */
const clean = (val?: string | null) =>
  val && val.trim().length > 0 ? val.trim() : "";

/** Format date for backend (append T00:00:00 if not included) */
const formatDateForBackend = (d?: string | null) => {
  if (!d) return null;
  return d.includes("T") ? d : `${d}T00:00:00`;
};

/**
 * Converts Product → ProductRequest (JSON-friendly object)
 * Used for PUT / PATCH requests without file upload
 */
export const toProductRequest = (p: Product): ProductRequest => ({
  productCode: clean(p.code),
  productName: clean(p.name),
  productDescription: clean(p.description),
  stocks: Number(p.stock ?? 0),
  productSize: clean(p.size),
  productStatus: clean(p.status),
  productImgUrl: clean(typeof p.imageUrl === "string" ? p.imageUrl : ""),
  expiryDate: formatDateForBackend(p.expiryDate),
  productInDate: formatDateForBackend(p.inDate),
});

/** Converts Product + optional imageFile → FormData (MATCHES BACKEND) */
export const toProductFormData = (p: Product, imageFile?: File): FormData => {
  const formData = new FormData();

  // Product JSON
  const productJson = {
    productCode: p.code?.trim() ?? "",
    productName: p.name?.trim() ?? "",
    productDescription: p.description?.trim() ?? "",
    stocks: Number(p.stock ?? 0),
    productSize: p.size?.trim() ?? "",
    productStatus: p.status?.trim() ?? "",
    productImgUrl: typeof p.imageUrl === "string" ? p.imageUrl : "",
    expiryDate: p.expiryDate ? `${p.expiryDate}T00:00:00` : null,
    productInDate: p.inDate ? `${p.inDate}T00:00:00` : null,
  };

  // ✅ Wrap JSON inside "product" part
  formData.append("product", new Blob([JSON.stringify(productJson)], { type: "application/json" }));

  if (imageFile) {
    // ✅ Matches backend @RequestPart(value="file")
    formData.append("file", imageFile);
  }

  return formData;
};

