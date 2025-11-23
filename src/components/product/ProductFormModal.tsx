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

  const {
    addProduct,
    updateProduct,
    reloadProducts,
  } = useProductsContext();

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
    setForm(prev => ({
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

      await reloadProducts();
      onClose();

    } catch (err: any) {
      Swal.fire("Error", err?.message || "Failed to save product", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} size="lg" popup onClose={onClose}>
      <ModalHeader />

      <ModalBody>
        {/* TITLE */}
        <h3 className="text-xl font-extrabold mb-4 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-400 bg-clip-text text-transparent">
          {isEdit ? "Edit Product" : "Add New Product"}
        </h3>

        {/* GLASS CONTAINER */}
        <div className="p-4 rounded-2xl bg-white/70 border border-emerald-200 shadow-xl backdrop-blur-xl space-y-5">

          {/* IMAGE UPLOAD */}
          <div className="space-y-1">
            <Label htmlFor="image" className="font-semibold text-slate-700">
              Product Image
            </Label>

            <div className="bg-white/80 border border-emerald-200 rounded-xl p-3 shadow-sm">
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm cursor-pointer bg-white/60 border border-gray-300 rounded-md"
              />

              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-24 h-24 mt-3 object-cover rounded-lg border border-emerald-200 shadow-md"
                />
              )}
            </div>
          </div>

          {/* TEXT INPUTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["code", "name", "description", "size"].map((field) => (
              <div key={field}>
                <Label className="font-semibold text-slate-700">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </Label>
                <TextInput
                  className="mt-1 rounded-xl border-emerald-200 focus:ring-emerald-500 focus:border-emerald-500"
                  value={(form as any)[field] ?? ""}
                  onChange={(e) =>
                    handleChange(field as keyof Product, e.target.value)
                  }
                />
              </div>
            ))}
          </div>

          {/* CATEGORY */}
          <div>
            <Label className="font-semibold text-slate-700">
              Category
            </Label>
            <Select
              className="mt-1 rounded-xl border-emerald-200 focus:ring-emerald-500 focus:border-emerald-500"
              value={form.categoryId ?? ""}
              onChange={(e) => handleChange("categoryId", Number(e.target.value))}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.categoryName}
                </option>
              ))}
            </Select>
          </div>

          {/* STOCK + STATUS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold text-slate-700">Stocks</Label>
              <TextInput
                type="number"
                className="mt-1 rounded-xl border-emerald-200 focus:ring-emerald-500"
                value={form.stock ?? 0}
                onChange={(e) => handleChange("stock", e.target.value)}
              />
            </div>

            <div>
              <Label className="font-semibold text-slate-700">Status</Label>
              <Select
                className="mt-1 rounded-xl border-emerald-200 focus:ring-emerald-500"
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="Available">Available</option>
                <option value="Not Available">Not Available</option>
              </Select>
            </div>
          </div>

          {/* DATE FIELDS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold text-slate-700">Expiry Date</Label>
              <TextInput
                type="date"
                className="mt-1 rounded-xl border-emerald-200 focus:ring-emerald-500"
                value={form.expiryDate ?? ""}
                onChange={(e) => handleChange("expiryDate", e.target.value)}
              />
            </div>

            <div>
              <Label className="font-semibold text-slate-700">In Date</Label>
              <TextInput
                type="date"
                className="mt-1 rounded-xl border-emerald-200 focus:ring-emerald-500"
                value={form.inDate ?? ""}
                onChange={(e) => handleChange("inDate", e.target.value)}
              />
            </div>
          </div>

        </div>
      </ModalBody>

      <ModalFooter>
        <Button
          color="success"
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-full px-5 shadow-lg"
        >
          {loading
            ? isEdit
              ? "Updating..."
              : "Adding..."
            : isEdit
            ? "Update Product"
            : "Add Product"}
        </Button>

        <Button color="gray" onClick={onClose} className="rounded-full">
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}
