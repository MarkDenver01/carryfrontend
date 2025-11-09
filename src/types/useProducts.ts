import { useState } from "react";
import type { Product } from "./types";
import {
  getAllProductsWithRecommendations,
  addProductFormData,
  updateProductFormData,
  deleteProduct,
  updateProductStatus,
} from "../../src/libs/ApiGatewayDatasource";
import { mapProductDTO } from "./productHelpers";

/** Product hooks */
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);

  /** Load all products from backend */
  const load = async () => {
    try {
      const dtos = await getAllProductsWithRecommendations();
      const mapped = dtos.map(mapProductDTO);
      setProducts(mapped);
      return mapped;
    } catch (err: any) {
      console.error("Failed to load products", err);
      throw err;
    }
  };

  /** Add new product */
  const add = async (product: Product) => {
    try {
      // Use the helper to prepare FormData (handles imageFile if exists)
      const preparedFormData = toProductFormData(product, product.imageFile);
      const saved = await addProductFormData(preparedFormData);
      const mapped = mapProductDTO(saved);
      setProducts((prev) => [...prev, mapped]);
      return mapped;
    } catch (err: any) {
      console.error("Failed to add product", err);
      throw err;
    }
  };

  /** Update existing product */
  const update = async (product: Product) => {
    if (!product.id) throw new Error("Product ID is required for update");
    try {
      const formData = new FormData();

      // Use the helper to prepare FormData (handles imageFile if exists)
      const preparedFormData = toProductFormData(product, product.imageFile);

      const updated = await updateProductFormData(product.id, preparedFormData);
      const mapped = mapProductDTO(updated);

      setProducts((prev) =>
        prev.map((p) => (p.id === mapped.id ? mapped : p))
      );
      return mapped;
    } catch (err: any) {
      console.error("Failed to update product", err);
      throw err;
    }
  };

  /** Delete a product */
  const remove = async (productId: number) => {
    try {
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err: any) {
      console.error("Failed to delete product", err);
      throw err;
    }
  };

  /** Update product status only */
  const updateStatus = async (productId: number, status: string) => {
    try {
      const updated = await updateProductStatus(productId, status);
      const mapped = mapProductDTO(updated);
      setProducts((prev) =>
        prev.map((p) => (p.id === mapped.id ? mapped : p))
      );
      return mapped;
    } catch (err: any) {
      console.error("Failed to update product status", err);
      throw err;
    }
  };

  return {
    products,
    setProducts,
    load,
    add,
    update,
    remove,
    updateStatus,
  };
};

/** Validation helper */
export const validateProduct = (p: Product): string | null => {
  if (!p.code) return "Product code is required";
  if (!p.name) return "Product name is required";
  if (!p.description) return "Product description is required";
  if (!p.size) return "Product size is required";
  if (p.stock == null || p.stock < 0) return "Stock must be 0 or greater";
  if (!p.status) return "Status is required";
  if (!p.expiryDate) return "Expiry date is required";
  if (!p.inDate) return "In date is required";
  if (!p.imageFile && !p.imageUrl) return "Product image is required";
  return null;
};

/** FormData helper (import from productHelpers) */
import { toProductFormData } from "./productHelpers";
