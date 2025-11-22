import { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Label,
  TextInput,
  Select,
} from "flowbite-react";
import Swal from "sweetalert2";
import { Sparkles } from "lucide-react";

import type { Product } from "../../types/types";
import { validateProduct } from "../../types/useProducts";

import { useProductsContext } from "../../context/ProductsContext";
import { useCategoryContext } from "../../context/CategoryContext";

interface ProductFormModalProps {
  show: boolean;
  onClose: () => void;
  product?: Product | null;
}

export default function ProductFormModal({
  show,
  onClose,
  product = null,
}: ProductFormModalProps) {
  // ⬇️ Use global shared context (ALL FUNCTIONS AVAILABLE)
  const { addProduct, updateProduct, reloadProducts } = useProductsContext();
  const { categories } = useCategoryContext();

  const emptyProduct: Product = {
    imageUrl: "",
    code: "",
    name: "",
    description: "",
    size: "",
    stock: 0,
    expiryDate: "",
    inDate: "",
    status: "Available",
    categoryId: null,
  };

  const [form, setForm] = useState<Product>(emptyProduct);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const isEdit = !!product?.id;

  // Load data when editing or opening modal
  useEffect(() => {
    if (product) {
      setForm({ ...product });
      setPreview(product.imageUrl ?? null);
      setImageFile(null);
    } else if (show) {
      setForm(emptyProduct);
      setPreview(null);
      setImageFile(null);
    }
  }, [product, show]);

  const handleChange = (field: keyof Product, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: field === "stock" ? Number(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setPreview(file ? URL.createObjectURL(file) : form.imageUrl ?? null);
  };

  const handleSubmit = async () => {
    const productToSubmit: Product = {
      ...form,
      imageFile: imageFile ?? form.imageFile,
    };

    // Validate first
    const validationError = validateProduct(productToSubmit);
    if (validationError) {
      Swal.fire("Validation Error", validationError, "warning");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await updateProduct(productToSubmit);
        Swal.fire("Success", "Product updated successfully!", "success");
      } else {
        await addProduct(productToSubmit);
        Swal.fire("Success", "Product added successfully!", "success");
      }

      // ⬇️ IMPORTANT: refresh global product list
      await reloadProducts();

      onClose();
    } catch (err: any) {
      Swal.fire("Error", err?.message || "Failed to save product", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onClose={onClose}
      size="lg"
      popup
      className="backdrop-blur-[3px]"
    >
      <ModalHeader className="border-b border-emerald-100 bg-gradient-to-r from-white via-emerald-50 to-white">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">
            {isEdit ? "Edit Product" : "New Product"}
          </span>
          <h3 className="text-lg md:text-xl font-extrabold bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            {isEdit ? "Update Product Details" : "Add Product to Inventory"}
          </h3>
          <p className="flex items-center gap-1 text-[0.75rem] text-slate-500">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Fill in the product information and attach an image preview.
          </p>
        </div>
      </ModalHeader>

      <ModalBody className="bg-gradient-to-br from-white via-slate-50 to-emerald-50/40">
        <div className="grid gap-4 md:gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
          {/* ========== LEFT: IMAGE PANEL ========== */}
          <div className="rounded-2xl border border-emerald-100 bg-white/90 shadow-sm p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="image"
                className="text-xs font-semibold text-slate-700"
              >
                Product Image
              </Label>
              <span className="text-[0.7rem] text-slate-400">
                PNG / JPG / JPEG
              </span>
            </div>

            <label
              htmlFor="image"
              className="mt-1 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 px-3 py-4 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition"
            >
              <span className="text-xs font-medium text-emerald-700">
                Click to upload
              </span>
              <span className="text-[0.7rem] text-slate-500">
                or drag and drop
              </span>
            </label>

            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {preview && (
              <div className="mt-1 flex justify-center">
                <div className="rounded-xl border border-emerald-100 bg-white shadow-sm p-2">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ========== RIGHT: FORM FIELDS ========== */}
          <div className="rounded-2xl border border-emerald-100 bg-white/95 shadow-sm p-4 md:p-5 space-y-4">
            {/* Basic info */}
            <div className="space-y-2">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                Basic Information
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label
                    htmlFor="code"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Product Code
                  </Label>
                  <TextInput
                    id="code"
                    value={form.code ?? ""}
                    onChange={(e) => handleChange("code", e.target.value)}
                    className="mt-1 bg-white/95 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="name"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Product Name
                  </Label>
                  <TextInput
                    id="name"
                    value={form.name ?? ""}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="mt-1 bg-white/95 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="description"
                  className="text-xs font-semibold text-slate-700"
                >
                  Product Description
                </Label>
                <TextInput
                  id="description"
                  value={form.description ?? ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="mt-1 bg-white/95 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Category / Size row */}
            <div className="space-y-2">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                Classification
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label
                    htmlFor="category"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Category
                  </Label>
                  <Select
                    id="category"
                    value={form.categoryId ?? ""}
                    onChange={(e) =>
                      handleChange("categoryId", Number(e.target.value))
                    }
                    className="mt-1 bg-white/95 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl text-sm"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.categoryId} value={cat.categoryId}>
                        {cat.categoryName}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="size"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Size
                  </Label>
                  <TextInput
                    id="size"
                    value={form.size ?? ""}
                    onChange={(e) => handleChange("size", e.target.value)}
                    className="mt-1 bg-white/95 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Stock / Status row */}
            <div className="space-y-2">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                Inventory Settings
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label
                    htmlFor="stock"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Stocks
                  </Label>
                  <TextInput
                    id="stock"
                    type="number"
                    value={form.stock ?? 0}
                    onChange={(e) => handleChange("stock", e.target.value)}
                    className="mt-1 bg-white/95 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="status"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Status
                  </Label>
                  <Select
                    id="status"
                    value={form.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="mt-1 bg-white/95 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl text-sm"
                  >
                    <option value="Available">Available</option>
                    <option value="Not Available">Not Available</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-2">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                Validity
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label
                    htmlFor="expiryDate"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Expiry Date
                  </Label>
                  <TextInput
                    id="expiryDate"
                    type="date"
                    value={form.expiryDate ?? ""}
                    onChange={(e) =>
                      handleChange("expiryDate", e.target.value)
                    }
                    className="mt-1 bg-white/95 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="inDate"
                    className="text-xs font-semibold text-slate-700"
                  >
                    In Date
                  </Label>
                  <TextInput
                    id="inDate"
                    type="date"
                    value={form.inDate ?? ""}
                    onChange={(e) => handleChange("inDate", e.target.value)}
                    className="mt-1 bg-white/95 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter className="border-t border-emerald-100 bg-white/90">
        <div className="w-full flex justify-end gap-2">
          <Button
            color="gray"
            onClick={onClose}
            className="rounded-full px-4 text-sm font-medium"
          >
            Cancel
          </Button>
          <Button
            color="success"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-full px-5 text-sm font-semibold bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-400 hover:brightness-110 border border-emerald-300/80"
          >
            {loading
              ? isEdit
                ? "Updating..."
                : "Adding..."
              : isEdit
              ? "Update Product"
              : "Add Product"}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
