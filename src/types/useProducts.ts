import { useState } from "react";
import type { Product } from "./types";
import {
  getAllProductsWithRecommendations,
  addProductFormData,
  updateProductFormData,
  deleteProduct,
  updateProductStatus,
} from "../../src/libs/ApiGatewayDatasource";
import { mapProductDTO, toProductFormData } from "./productHelpers";

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
      const preparedFormData = toProductFormData(product, product.imageFile);
      const updated = await updateProductFormData(product.id, preparedFormData);
      const mapped = mapProductDTO(updated);
      setProducts((prev) => prev.map((p) => (p.id === mapped.id ? mapped : p)));
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
      setProducts((prev) => prev.map((p) => (p.id === mapped.id ? mapped : p)));
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
/** Validation helper matching backend ProductRequest constraints */
export const validateProduct = (p: Product): string | null => {
  if (!p.code?.trim()) return "Product code is required (max 50 characters)";
  if (p.code.length > 50) return "Product code cannot exceed 50 characters";

  if (!p.name?.trim()) return "Product name is required (max 255 characters)";
  if (p.name.length > 255) return "Product name cannot exceed 255 characters";

  if (!p.description?.trim()) return "Product description is required (max 255 characters)";
  if (p.description.length > 255) return "Product description cannot exceed 255 characters";

  if (!p.size?.trim()) return "Product size is required (max 50 characters)";
  if (p.size.length > 50) return "Product size cannot exceed 50 characters";

  if (p.stock == null || p.stock < 0) return "Stock must be 0 or greater";

  if (!p.status?.trim()) return "Product status is required";

  if (!p.expiryDate?.trim()) return "Expiry date is required";
  if (!p.inDate?.trim()) return "In date is required";

  if (!p.imageFile && !p.imageUrl?.trim()) return "Product image is required";

  return null;
};

