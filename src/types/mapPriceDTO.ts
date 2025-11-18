import type { ProductPriceDTO, ProductPrice } from "./pricingTypes";

export function mapPriceDTO(dto: ProductPriceDTO): ProductPrice {
  return {
    priceId: dto.priceId,
    productId: dto.productId,
    basePrice: dto.basePrice,
    effectiveDate: dto.effectiveDate,

    productName: dto.productName,
    productDescription: dto.productDescription,
    productCode: dto.productCode,
    productImgUrl: dto.productImgUrl,
    productSize: dto.productSize,
    stocks: dto.stocks,
    categoryName: dto.categoryName,

    recommendedProducts: dto.recommendedProducts ?? [],
  };
}
