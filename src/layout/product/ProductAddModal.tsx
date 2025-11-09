import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Label, TextInput, Select } from "flowbite-react";
import type { Product } from "../../types/types";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { uploadProductImage } from "../../../src/libs/ApiGatewayDatasource";

interface ProductAddModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (p: Product) => Promise<void>;
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
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!show) {
      setNewProduct(emptyProduct);
      setPreview(null);
      setImageFile(null);
    }
  }, [show]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);

      let imageUrl = newProduct.image;
      if (imageFile) {
        imageUrl = await uploadProductImage(imageFile);
      }

      const productToSave = { ...newProduct, image: imageUrl };

      await onSubmit(productToSave);

      Swal.fire("Success!", "Product added successfully!", "success");
      onClose();
    } catch (error: any) {
      Swal.fire("Error", error?.message || "Failed to add product.", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose}>
      <ModalHeader>Add New Product</ModalHeader>
      <ModalBody>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label htmlFor="image">Product Image</Label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
            />
            {preview && <img src={preview} alt="Preview" className="w-24 h-24 mt-2 object-cover rounded" />}
          </div>

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
                    [f.id]:
                      f.type === "number"
                        ? parseInt(e.target.value || "0")
                        : e.target.value,
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
        <Button color="success" onClick={handleSubmit} disabled={uploading}>
          {uploading ? "Uploading..." : "Add Product"}
        </Button>
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}
