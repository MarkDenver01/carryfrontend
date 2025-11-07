import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  getAllProductsWithRecommendations,
  addProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus
} from "../../src/libs/ApiGatewayDatasource";
import { mapProductDTO, toProductRequest } from "../types/productHelpers";
import type { Product } from "./types";
import type { ProductDTO } from "../../src/libs/models/product/Product";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data: ProductDTO[] = await getAllProductsWithRecommendations();
        if (!mounted) return;
        setProducts(data.map(mapProductDTO));
      } catch (err: any) {
        Swal.fire("Error", err?.message || "Failed to load products", "error");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const add = async (p: Product) => {
    const payload = toProductRequest(p);
    const added = await addProduct(payload);
    setProducts((prev) => [mapProductDTO(added), ...prev]);
  };

  const update = async (p: Product) => {
    if (!p.id) return;
    const payload = toProductRequest(p);
    const updated = await updateProduct(p.id, payload);
    setProducts((prev) => prev.map((x) => (x.id === p.id ? mapProductDTO(updated) : x)));
  };

  const remove = async (id: number) => {
    await deleteProduct(id);
    setProducts((prev) => prev.filter((x) => x.id !== id));
  };

  const updateStatus = async (productId: number, newStatus: string) => {
    const updated = await updateProductStatus(productId, newStatus);
    setProducts((prev) =>
      prev.map((x) => (x.id === productId ? mapProductDTO(updated) : x))
    );
  };

  return { products, setProducts, loading, add, update, remove, updateStatus };
}
