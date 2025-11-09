import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  getAllProductsWithRecommendations,
  addProductFormData,
  updateProductFormData,
  deleteProduct,
  updateProductStatus
} from "../../src/libs/ApiGatewayDatasource";
import { mapProductDTO, toProductRequest } from "../types/productHelpers";
import type { Product } from "./types";

export function validateProduct(p: Product): string | null {
  if (!p.code?.trim()) return "Product code is required.";
  if (!p.name?.trim()) return "Product name is required.";
  if (!p.description?.trim()) return "Description is required.";
  if (p.stock == null || isNaN(Number(p.stock)) || Number(p.stock) < 0)
    return "Stocks must be 0 or greater.";
  if (!p.size?.trim()) return "Product size is required.";
  if (!p.status?.trim()) return "Product status is required.";
  if (!p.imageUrl.trim()) return "Product image is required.";
  return null;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getAllProductsWithRecommendations();
        if (!mounted) return;
        setProducts(data.map(mapProductDTO));
      } catch (err: any) {
        Swal.fire("Error", err?.message || "Failed to load products", "error");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const add = async (p: Product, imageFile?: File) => {
    const validationError = validateProduct(p);
    if (validationError) {
      Swal.fire("Validation Error", validationError, "warning");
      return;
    }

    const formData = new FormData();
    const payload = toProductRequest(p);
    Object.entries(payload).forEach(([key, value]) => {
      if (value != null) formData.append(key, value as string);
    });
    if (imageFile) formData.append("productImgFile", imageFile);

    const added = await addProductFormData(formData);
    setProducts(prev => [mapProductDTO(added), ...prev]);
  };

  const update = async (p: Product, imageFile?: File) => {
    if (!p.id) return;
    const validationError = validateProduct(p);
    if (validationError) {
      Swal.fire("Validation Error", validationError, "warning");
      return;
    }

    const formData = new FormData();
    const payload = toProductRequest(p);
    Object.entries(payload).forEach(([key, value]) => {
      if (value != null) formData.append(key, value as string);
    });
    if (imageFile) formData.append("productImgFile", imageFile);

    const updated = await updateProductFormData(p.id, formData);
    setProducts(prev =>
      prev.map(x => (x.id === p.id ? mapProductDTO(updated) : x))
    );
    Swal.fire("Updated", "Product updated successfully", "success");
  };

  const remove = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This product will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });
    if (!confirm.isConfirmed) return;

    await deleteProduct(id);
    setProducts(prev => prev.filter(x => x.id !== id));
    Swal.fire("Deleted", "Product deleted successfully", "success");
  };

  const updateStatus = async (productId: number, newStatus: string) => {
    try {
      const updated = await updateProductStatus(productId, newStatus);
      setProducts(prev => prev.map(x => (x.id === productId ? mapProductDTO(updated) : x)));
    } catch (err: any) {
      Swal.fire("Error", err?.message || "Failed to update status", "error");
    }
  };

  return { products, setProducts, loading, add, update, remove, updateStatus };
}
