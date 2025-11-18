import { useEffect, useState } from "react";
import { Button, Modal, ModalBody, ModalHeader, Label, Select, TextInput } from "flowbite-react";
import Swal from "sweetalert2";
import { usePricesContext } from "../../context/PricesContext";
import { useProductsContext } from "../../context/ProductsContext";
import type { ProductPrice } from "../../types/pricingTypes";

interface Props {
  show: boolean;
  onClose: () => void;
  price: ProductPrice | null;
}

export default function ProductPriceFormModal({ show, onClose, price }: Props) {
  const { addPrice, updatePrice } = usePricesContext();
  const { products } = useProductsContext();

  const [formData, setFormData] = useState({
    productId: 0,
    basePrice: 0,
    effectiveDate: "",
  });

  useEffect(() => {
    if (price) {
      setFormData({
        productId: price.productId,
        basePrice: price.basePrice,
        effectiveDate: price.effectiveDate,
      });
    } else {
      setFormData({ productId: 0, basePrice: 0, effectiveDate: "" });
    }
  }, [price]);

  const handleSubmit = async () => {
    if (!formData.productId || !formData.basePrice) {
      Swal.fire("Validation Error", "All fields are required.", "warning");
      return;
    }

    try {
      if (price) {
        await updatePrice({ ...price, ...formData });
        Swal.fire("Updated!", "Price updated successfully.", "success");
      } else {
        await addPrice(formData as any);
        Swal.fire("Added!", "Price added successfully.", "success");
      }
      onClose();
    } catch (err: any) {
      Swal.fire("Error", err.message || "Something went wrong", "error");
    }
  };

  return (
    <Modal show={show} size="md" popup onClose={onClose}>
      <ModalHeader />
      <ModalBody>
        <h3 className="text-lg font-bold mb-4">
          {price ? "Edit Product Price" : "Add Product Price"}
        </h3>

        <div className="mb-3">
          <Label>Product</Label>
          <Select
            value={formData.productId || ""}
            onChange={(e) =>
              setFormData({ ...formData, productId: Number(e.target.value) })
            }
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="mb-3">
          <Label>Base Price (₱)</Label>
          <TextInput
            type="number"
            value={formData.basePrice}
            onChange={(e) =>
              setFormData({ ...formData, basePrice: Number(e.target.value) })
            }
          />
        </div>

        <div className="mb-3">
          <Label>Effective Date</Label>
          <TextInput
            type="date"
            value={formData.effectiveDate}
            onChange={(e) =>
              setFormData({ ...formData, effectiveDate: e.target.value })
            }
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button color="blue" onClick={handleSubmit}>
            {price ? "Update" : "Add"}
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
}
