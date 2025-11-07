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

  const handleSubmit = () => {
    onSubmit(newProduct);
    setNewProduct(emptyProduct);
    onClose();
  };

  return (
    <Modal show={show} onClose={onClose}>
      <ModalHeader>Add New Product</ModalHeader>
      <ModalBody>
        <div className="grid grid-cols-1 gap-3">
          {[
            { id: "image", label: "Image URL", type: "text" },
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
              onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value as Product["status"] })}
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
