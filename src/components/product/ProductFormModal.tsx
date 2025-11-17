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

  // ⬇️ Use global shared context (ALL FUNCTIONS AVAILABLE)
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
    <Modal show={show} onClose={onClose}>
      <ModalHeader>{isEdit ? "Edit Product" : "Add New Product"}</ModalHeader>
      <ModalBody>
        <div className="grid grid-cols-1 gap-3">

          {/* IMAGE UPLOAD */}
          <div>
            <Label htmlFor="image">Product Image</Label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-24 h-24 mt-2 object-cover rounded"
              />
            )}
          </div>

          {/* TEXT FIELDS */}
          {["code", "name", "description", "size"].map((field) => (
            <div key={field}>
              <Label htmlFor={field}>
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </Label>
              <TextInput
                id={field}
                value={(form as any)[field] ?? ""}
                onChange={(e) =>
                  handleChange(field as keyof Product, e.target.value)
                }
              />
            </div>
          ))}

          {/* CATEGORY */}
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              id="category"
              value={form.categoryId ?? ""}
              onChange={(e) =>
                handleChange("categoryId", Number(e.target.value))
              }
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.categoryName}
                </option>
              ))}
            </Select>
          </div>

          {/* STOCK */}
          <div>
            <Label htmlFor="stock">Stocks</Label>
            <TextInput
              id="stock"
              type="number"
              value={form.stock ?? 0}
              onChange={(e) => handleChange("stock", e.target.value)}
            />
          </div>

          {/* STATUS */}
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
            >
              <option value="Available">Available</option>
              <option value="Not Available">Not Available</option>
            </Select>
          </div>

          {/* EXPIRY DATE */}
          <div>
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <TextInput
              id="expiryDate"
              type="date"
              value={form.expiryDate ?? ""}
              onChange={(e) => handleChange("expiryDate", e.target.value)}
            />
          </div>

          {/* IN DATE */}
          <div>
            <Label htmlFor="inDate">In Date</Label>
            <TextInput
              id="inDate"
              type="date"
              value={form.inDate ?? ""}
              onChange={(e) => handleChange("inDate", e.target.value)}
            />
          </div>

        </div>
      </ModalBody>

      <ModalFooter>
        <Button color="success" onClick={handleSubmit} disabled={loading}>
          {loading
            ? isEdit
              ? "Updating..."
              : "Adding..."
            : isEdit
            ? "Update Product"
            : "Add Product"}
        </Button>

        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}
