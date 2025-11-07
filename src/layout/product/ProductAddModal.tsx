import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Label, TextInput, Select } from "flowbite-react";
import type { Product } from "../../types/types";
import { useState } from "react";

interface ProductAddModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (p: Product) => void;
}

export default function ProductAddModal({ show, onClose, onSubmit }: ProductAddModalProps) {
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

  const [newProduct, setNewProduct] = useState<Product>(emptyProduct);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewProduct({ ...newProduct, image: file as any }); // store file object
      setPreview(URL.createObjectURL(file)); // temporary preview
    }
  };

  const handleSubmit = () => {
    onSubmit(newProduct);
    setNewProduct(emptyProduct);
    setPreview(null);
    onClose();
  };

  return (
    <Modal show={show} onClose={onClose}>
      <ModalHeader>Add New Product</ModalHeader>
      <ModalBody>
        <div className="grid grid-cols-1 gap-3">

          {/* ✅ Replace text input with file input */}
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

          {/* Other fields remain the same */}
          {[
            { id: "code", label: "Product Code", type: "text" },
            { id: "name", label: "Product Name", type: "text" },
            { id: "description", label: "Description", type: "text" },
            { id: "size", label: "Size", type: "text" },
            { id: "stock", label: "Stocks", type: "number" },
          ].map((f) => (
            <div key={f.id}>
              <Label htmlFor={f.id}>{f.label}</Label>
              <TextInput
                id={f.id}
                type={f.type}
                value={(newProduct as any)[f.id]}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    [f.id]: f.type === "number" ? parseInt(e.target.value || "0") : e.target.value,
                  })
                }
              />
            </div>
          ))}

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={newProduct.status}
              onChange={(e) =>
                setNewProduct({ ...newProduct, status: e.target.value as Product["status"] })
              }
            >
              <option>Available</option>
              <option>Not Available</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <TextInput
              id="expiryDate"
              type="date"
              value={newProduct.expiryDate ?? ""}
              onChange={(e) => setNewProduct({ ...newProduct, expiryDate: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="inDate">In Date</Label>
            <TextInput
              id="inDate"
              type="date"
              value={newProduct.inDate ?? ""}
              onChange={(e) => setNewProduct({ ...newProduct, inDate: e.target.value })}
            />
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="success" onClick={handleSubmit}>
          Add Product
        </Button>
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}
