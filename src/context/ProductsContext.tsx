import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { Product } from "../types/types";

import {
  getAllProducts,
  addProductFormData,
  updateProductFormData,
  deleteProduct,
  updateProductStatus,
  markProductOutOfStock,
} from "../../src/libs/ApiGatewayDatasource";

import { mapProductDTO, toProductFormData } from "../types/productHelpers";

interface ProductsContextValue {
  products: Product[];
  loading: boolean;

  addProduct: (p: Product) => Promise<Product>;
  updateProduct: (p: Product) => Promise<Product>;
  removeProduct: (id: number) => Promise<void>;

  updateProductStatusById: (id: number, status: string) => Promise<Product>;
  markOutOfStock: (id: number) => Promise<void>;

  reloadProducts: () => Promise<Product[]>;
}

const ProductsContext = createContext<ProductsContextValue | undefined>(
  undefined
);

export const ProductsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const reloadProducts = async () => {
    try {
      setLoading(true);
      const dtos = await getAllProducts();
      const mapped = dtos.map(mapProductDTO);
      setProducts(mapped);
      return mapped;
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (p: Product) => {
    const formData = toProductFormData(p, p.imageFile);
    const saved = await addProductFormData(formData);
    const mapped = mapProductDTO(saved);
    setProducts((prev) => [...prev, mapped]);
    return mapped;
  };

  const updateProduct = async (p: Product) => {
    if (!p.id) throw new Error("Product ID is required for update");
    const formData = toProductFormData(p, p.imageFile);
    const updated = await updateProductFormData(p.id, formData);
    const mapped = mapProductDTO(updated);

    setProducts((prev) =>
      prev.map((x) => (x.id === mapped.id ? mapped : x))
    );

    return mapped;
  };

  const removeProduct = async (id: number) => {
    await deleteProduct(id);
    setProducts((prev) => prev.filter((x) => x.id !== id));
  };

  const updateProductStatusById = async (id: number, status: string) => {
    const updated = await updateProductStatus(id, { productStatus: status });
    const mapped = mapProductDTO(updated);

    setProducts((prev) =>
      prev.map((x) => (x.id === mapped.id ? mapped : x))
    );

    return mapped;
  };

  const markOutOfStock = async (id: number) => {
    await markProductOutOfStock(id);

    setProducts((prev) => prev.filter((x) => x.id !== id));
  };

  useEffect(() => {
    reloadProducts().catch(console.error);
  }, []);

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,

        addProduct,
        updateProduct,
        removeProduct,

        updateProductStatusById,
        markOutOfStock,

        reloadProducts,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProductsContext = () => {
  const context = useContext(ProductsContext);
  if (!context)
    throw new Error("useProductsContext must be used within ProductsProvider");
  return context;
};
