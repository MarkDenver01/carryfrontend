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
import { uploadProductImage } from "../../../src/libs/ApiGatewayDatasource";

interface ProductEditModalProps {
  show: boolean;
  onClose: () => void;
  product: Product | null;
  onSubmit: (p: Product) => Promise<void>;
}

export default function ProductEditModal({
  show,
  onClose,
  product,
  onSubmit,
}: ProductEditModalProps) {
  const [editable, setEditable] = useState<Product | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // 🧹 Auto-reset when modal closes or product changes
  useEffect(() => {
    if (product) {
      setEditable({ ...product });
      setPreview(typeof product.image === "string" ? product.image : null);
      setImageFile(null);
    } else if (!show) {
      setEditable(null);
      setPreview(null);
      setImageFile(null);
      setLoading(false);
    }
  }, [product, show]);

  if (!editable) return null;

  // 🧾 Field handler
  const handleChange = (field: keyof Product, value: string | number) => {
    setEditable((prev) =>
      prev
        ? {
            ...prev,
            [field]: field === "stock" ? parseInt(value as string || "0") : value,
          }
        : prev
    );
  };

  // 🖼️ Handle new image selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // 🔼 Upload image to backend
  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return editable?.image ?? "";
    try {
      return await uploadProductImage(imageFile);
    } catch (err: any) {
      Swal.fire("Error", err?.message || "Image upload failed", "error");
      return editable?.image ?? "";
    }
  };

  // ✅ Handle update
  const handleUpdate = async () => {
    if (!editable) return;

    try {
      setLoading(true);
      const imageUrl = await uploadImage();

      const updatedProduct: Product = {
        ...editable,
        image: imageUrl,
      };

      await onSubmit(updatedProduct);

      Swal.fire("Success", "Product updated successfully!", "success");

      // 🧹 Reset state after success
      setImageFile(null);
      onClose();
    } catch {
      Swal.fire("Error", "Failed to update product.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose}>
      <ModalHeader>Update Product</ModalHeader>
      <ModalBody>
        <div className="grid grid-cols-1 gap-3">
          {/* 🖼️ Image Upload */}
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
              <img src={preview} alt="Preview" className="w-24 h-24 mt-2 object-cover rounded" />
            )}
          </div>

          {/* 🧾 Input Fields */}
          {["code", "name", "description", "size"].map((f) => (
            <div key={f}>
              <Label htmlFor={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</Label>
              <TextInput
                id={f}
                value={(editable as any)[f] ?? ""}
                onChange={(e) => handleChange(f as keyof Product, e.target.value)}
              />
            </div>
          ))}

          <div>
            <Label htmlFor="stock">Stocks</Label>
            <TextInput
              id="stock"
              type="number"
              value={editable.stock ?? 0}
              onChange={(e) => handleChange("stock", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={editable.status}
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
              value={editable.expiryDate ?? ""}
              onChange={(e) => handleChange("expiryDate", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="inDate">In Date</Label>
            <TextInput
              id="inDate"
              type="date"
              value={editable.inDate ?? ""}
              onChange={(e) => handleChange("inDate", e.target.value)}
            />
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button color="warning" onClick={handleUpdate} disabled={loading}>
          {loading ? "Updating..." : "Update"}
        </Button>
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}
