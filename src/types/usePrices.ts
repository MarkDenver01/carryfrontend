import type { ProductPrice } from "./pricingTypes";
import { useState } from "react";
import {
  getAllPrices,
  addPriceForm,
  updatePriceForm,
  deletePriceById,
} from "../libs/ApiGatewayDatasource";
import { mapPriceDTO } from "../types/pricingHelpers";

export const usePrices = () => {
  const [prices, setPrices] = useState<ProductPrice[]>([]);

  const load = async () => {
    const dtos = await getAllPrices();
    const mapped = dtos.map(mapPriceDTO);
    setPrices(mapped);
    return mapped;
  };

  const add = async (price: ProductPrice) => {
    const dto = await addPriceForm(price);
    const mapped = mapPriceDTO(dto);
    setPrices((prev) => [...prev, mapped]);
    return mapped;
  };

  const update = async (price: ProductPrice) => {
    const dto = await updatePriceForm(price.priceId, price);
    const mapped = mapPriceDTO(dto);
    setPrices((prev) =>
      prev.map((p) => (p.priceId === mapped.priceId ? mapped : p))
    );
    return mapped;
  };

  const remove = async (id: number) => {
    await deletePriceById(id);
    setPrices((prev) => prev.filter((p) => p.priceId !== id));
  };

  return { prices, load, add, update, remove };
};
