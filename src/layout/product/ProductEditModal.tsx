import { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Label, TextInput, Select } from "flowbite-react";
import type { Product } from "../../types/types";

interface ProductEditModalProps {
  show: boolean;
  onClose: () => void;
  product: Product | null;
  onSubmit: (p: Product) => void;
}

export default function ProductEditModal({ show, onClose, product, onSubmit }: ProductEditModalProps) {
  const [editable, setEditable] = useState<Product | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setEditable({ ...product });
      setPreview(typeof product.image === "string" ? product.image : null);
    }
  }, [product]);

  if (!editable) return null;

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditable((prev) => (prev ? { ...prev, image: file as any } : prev));
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <Modal show={show} onClose={onClose}>
      <ModalHeader>Update Product</ModalHeader>
      <ModalBody>
        <div className="grid grid-cols-1 gap-3">

          {/* ✅ File Upload Field */}
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

          {/* Other fields */}
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
        <Button color="warning" onClick={() => onSubmit(editable)}>
          Update
        </Button>
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}
