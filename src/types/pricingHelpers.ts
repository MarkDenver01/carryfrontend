import type { ProductPriceDTO, ProductPrice } from "./pricingTypes";

export const mapPriceDTO = (dto: ProductPriceDTO): ProductPrice => ({
  priceId: dto.priceId,
  productId: dto.productId,
  productName: dto.productName,
  basePrice: dto.basePrice,
  taxPercentage: dto.taxPercentage,
  discountCategory: dto.discountCategory,
  discountPercentage: dto.discountPercentage ?? 0,
  effectiveDate: dto.effectiveDate?.split("T")[0] ?? "",
});
