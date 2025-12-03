import type { Product } from "./types";
import type { RecommendationRuleDTO } from "../libs/models/product/RecommendedRule";
import type {
  ProductDTO,
  ProductRequest,
} from "../libs/models/product/Product";

/** Format date as yyyy-MM-dd */
export const formatDate = (d?: string | null) => {
  if (!d) return "";
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return d;
  return parsed.toISOString().split("T")[0];
};

/** Maps a RecommendationRuleDTO → RecommendationRuleDTO */
export const mapRecommendationDTO = (
  r: RecommendationRuleDTO
): RecommendationRuleDTO => ({
  id: r.id,
  productId: r.productId,
  productName: r.productName,
  categoryName: r.categoryName,
  recommendedNames: r.recommendedNames ?? [],
  effectiveDate: r.effectiveDate,
  expiryDate: r.expiryDate,
  active: r.active,
});

/** Maps a ProductDTO → Product (frontend type) */
export const mapProductDTO = (p: ProductDTO): Product => ({
  id: p.productId,
  imageUrl: p.productImgUrl ?? "",
  imageFile: undefined,
  code: p.productCode ?? "",
  name: p.productName ?? "",
  productDescription: p.productDescription ?? "",
  size: p.productSize ?? "",
  stock: p.stocks ?? 0,
  expiryDate: p.expiryDate ? formatDate(p.expiryDate) : "",
  inDate: p.productInDate ? formatDate(p.productInDate) : "",
  status:
    (p.productStatus ?? "").toLowerCase() === "available"
      ? "Available"
      : "Not Available",

  categoryId: p.categoryId ?? null,
  categoryName: p.categoryName ?? null,

  recommendations: p.recommendations
    ? p.recommendations.map(mapRecommendationDTO)
    : [],
});

/** Clean up text fields */
const clean = (val?: string | null) => val?.trim() ?? "";

/** 
 * Format date for backend (always safe string)
 * Returns yyyy-MM-ddT00:00:00 
 */
const formatDateForBackend = (d?: string | null): string => {
  if (!d) return "";
  return d.includes("T") ? d : `${d}T00:00:00`;
};

/** Converts Product → ProductRequest */
export const toProductRequest = (p: Product): ProductRequest => ({
  productCode: clean(p.code),
  productName: clean(p.name),
  productDescription: clean(p.productDescription),
  stocks: Number(p.stock ?? 0),
  productSize: clean(p.size),
  productStatus: clean(p.status),
  expiryDate: formatDateForBackend(p.expiryDate),
  productInDate: formatDateForBackend(p.inDate),
  categoryId: p.categoryId ?? null,
});

/** Converts Product + optional imageFile → FormData */
export const toProductFormData = (p: Product, imageFile?: File): FormData => {
  const formData = new FormData();

  // If new image uploaded → backend replaces URL, so send ""
  // If no new image → keep old URL
  const finalImageUrl = imageFile || p.imageFile ? "" : p.imageUrl || "";

  const productJson = {
    productCode: clean(p.code),
    productName: clean(p.name),
    productDescription: clean(p.productDescription),
    stocks: Number(p.stock ?? 0),
    productSize: clean(p.size),
    productStatus: clean(p.status),
    productImgUrl: finalImageUrl, 
    expiryDate: p.expiryDate ? formatDateForBackend(p.expiryDate) : "",
    productInDate: p.inDate ? formatDateForBackend(p.inDate) : "",
    categoryId: p.categoryId ?? null,
  };

  formData.append("product", JSON.stringify(productJson));

  // Only upload file if selected
  const fileToUpload = imageFile ?? p.imageFile;
  if (fileToUpload) {
    formData.append("file", fileToUpload);
  }

  return formData;
};
