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
import { useProducts, validateProduct } from "../../types/useProducts";

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
  const { add, update } = useProducts();

  const emptyProduct: Product = {
    image: "",
    code: "",
    name: "",
    description: "",
    size: "",
    stock: 0,
    expiryDate: "",
    inDate: "",
    status: "Available",
  };

  const [form, setForm] = useState<Product>(emptyProduct);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const isEdit = !!product?.id;

  // Load product data when editing
  useEffect(() => {
    if (product) {
      setForm({ ...product });
      setPreview(product.image ?? null);
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
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    const validationError = validateProduct(form);
    if (validationError) {
      Swal.fire("Validation Error", validationError, "warning");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await update(form, imageFile ?? undefined);
        Swal.fire("Success", "Product updated successfully!", "success");
      } else {
        await add(form, imageFile ?? undefined);
        Swal.fire("Success", "Product added successfully!", "success");
      }
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
          {/* Image Upload */}
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

          {/* Text Fields */}
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

          <div>
            <Label htmlFor="stock">Stocks</Label>
            <TextInput
              id="stock"
              type="number"
              value={form.stock ?? 0}
              onChange={(e) => handleChange("stock", e.target.value)}
            />
          </div>

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

          <div>
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <TextInput
              id="expiryDate"
              type="date"
              value={form.expiryDate ?? ""}
              onChange={(e) => handleChange("expiryDate", e.target.value)}
            />
          </div>

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
