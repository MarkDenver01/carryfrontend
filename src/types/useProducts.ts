import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  getAllProductsWithRecommendations,
  addProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  uploadProductImage
} from "../../src/libs/ApiGatewayDatasource";
import { mapProductDTO, toProductRequest } from "../types/productHelpers";
import type { Product } from "./types";
import type { ProductDTO } from "../../src/libs/models/product/Product";

// 🧩 Helper: Client-side product validation
export function validateProduct(p: Product): string | null {
  if (!p.code?.trim()) return "Product code is required.";
  if (!p.name?.trim()) return "Product name is required.";
  if (!p.description?.trim()) return "Description is required.";
  if (p.stock == null || isNaN(Number(p.stock)) || Number(p.stock) < 0)
    return "Stocks must be 0 or greater.";
  if (!p.size?.trim()) return "Product size is required.";
  if (!p.status?.trim()) return "Product status is required.";
  if (!p.image) return "Product image is required.";
  return null;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // 🧠 Load all products
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

  // ➕ Add product
  const add = async (p: Product) => {
    const validationError = validateProduct(p);
    if (validationError) {
      Swal.fire("Validation Error", validationError, "warning");
      return;
    }

    let imageUrl = p.image;
    if (p.image && typeof p.image !== "string") {
      imageUrl = await uploadProductImage(p.image as File);
    }

    const payload = toProductRequest({ ...p, image: imageUrl });
    const added = await addProduct(payload);
    setProducts((prev) => [mapProductDTO(added), ...prev]);
  };

  // ✏️ Update product
  const update = async (p: Product) => {
    if (!p.id) return;

    const validationError = validateProduct(p);
    if (validationError) {
      Swal.fire("Validation Error", validationError, "warning");
      return;
    }

    try {
      let imageUrl = p.image;
      if (p.image && typeof p.image !== "string") {
        imageUrl = await uploadProductImage(p.image as File);
      }

      const payload = toProductRequest({ ...p, image: imageUrl });
      const updated = await updateProduct(p.id, payload);
      setProducts((prev) =>
        prev.map((x) => (x.id === p.id ? mapProductDTO(updated) : x))
      );

      Swal.fire("Updated", "Product updated successfully", "success");
    } catch (err: any) {
      Swal.fire("Error", err?.message || "Failed to update product", "error");
    }
  };

  // ❌ Delete product
  const remove = async (id: number) => {
    try {
      const confirm = await Swal.fire({
        title: "Are you sure?",
        text: "This product will be permanently deleted.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
      });
      if (!confirm.isConfirmed) return;

      await deleteProduct(id);
      setProducts((prev) => prev.filter((x) => x.id !== id));

      Swal.fire("Deleted", "Product deleted successfully", "success");
    } catch (err: any) {
      Swal.fire("Error", err?.message || "Failed to delete product", "error");
    }
  };

  // 🔁 Toggle availability or update status
  const updateStatus = async (productId: number, newStatus: string) => {
    try {
      const updated = await updateProductStatus(productId, newStatus);
      setProducts((prev) =>
        prev.map((x) =>
          x.id === productId ? mapProductDTO(updated) : x
        )
      );
    } catch (err: any) {
      Swal.fire("Error", err?.message || "Failed to update status", "error");
    }
  };

  return { products, setProducts, loading, add, update, remove, updateStatus };
}
