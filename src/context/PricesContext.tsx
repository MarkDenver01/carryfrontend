import React, { createContext, useContext, useState, useEffect } from "react";
import type { ProductPrice } from "../types/pricingTypes";
import {
  getAllPrices,
  addPriceForm,
  updatePriceForm,
  deletePriceById,
} from "../libs/ApiGatewayDatasource";
import { mapPriceDTO } from "../types/pricingHelpers";

interface PricesContextProps {
  prices: ProductPrice[];
  loadPrices: () => Promise<void>;
  addPrice: (price: ProductPrice) => Promise<ProductPrice>;
  updatePrice: (price: ProductPrice) => Promise<ProductPrice>;
  removePrice: (id: number) => Promise<void>;
}

const PricesContext = createContext<PricesContextProps | undefined>(undefined);

export const PricesProvider = ({ children }: { children: React.ReactNode }) => {
  const [prices, setPrices] = useState<ProductPrice[]>([]);

  // Load all prices
  const loadPrices = async () => {
    try {
      const dtos = await getAllPrices();
      const mapped = dtos.map(mapPriceDTO);
      setPrices(mapped);
    } catch (err) {
      console.error("Failed to load prices", err);
    }
  };

  // Add
  const addPrice = async (price: ProductPrice) => {
    const dto = await addPriceForm(price);
    const mapped = mapPriceDTO(dto);
    setPrices((prev) => [...prev, mapped]);
    return mapped;
  };

  // Update
  const updatePrice = async (price: ProductPrice) => {
    const dto = await updatePriceForm(price.priceId, price);
    const mapped = mapPriceDTO(dto);
    setPrices((prev) =>
      prev.map((p) => (p.priceId === mapped.priceId ? mapped : p))
    );
    return mapped;
  };

  // Delete
  const removePrice = async (id: number) => {
    await deletePriceById(id);
    setPrices((prev) => prev.filter((p) => p.priceId !== id));
  };

  useEffect(() => {
    loadPrices();
  }, []);

  return (
    <PricesContext.Provider
      value={{
        prices,
        loadPrices,
        addPrice,
        updatePrice,
        removePrice,
      }}
    >
      {children}
    </PricesContext.Provider>
  );
};

export const usePricesContext = () => {
  const ctx = useContext(PricesContext);
  if (!ctx) throw new Error("usePricesContext must be used inside PricesProvider");
  return ctx;
};
