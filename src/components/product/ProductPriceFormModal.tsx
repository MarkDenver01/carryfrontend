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
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import type { ProductPrice } from "../../types/pricingTypes";
import { usePrices } from "../../types/usePrices";

interface Props {
  show: boolean;
  onClose: () => void;
  price: ProductPrice | null;
}

export default function ProductPriceFormModal({ show, onClose, price }: Props) {
  const { add, update } = usePrices();

  const empty = {
    priceId: 0,
    productId: 0,
    productName: "",
    basePrice: 0,
    taxPercentage: 12,
    discountCategory: "NONE",
    discountPercentage: 0,
    effectiveDate: "",
  };

  const [form, setForm] = useState<ProductPrice>(empty);
  const isEdit = !!price?.priceId;

  useEffect(() => {
    if (price) {
      setForm({ ...price });
    } else if (show) {
      setForm(empty);
    }
  }, [price, show]);

  const handleChange = (field: keyof ProductPrice, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (isEdit) {
        await update(form);
        Swal.fire("Updated!", "Product price updated successfully.", "success");
      } else {
        await add(form);
        Swal.fire("Added!", "Product price added successfully.", "success");
      }
      onClose();
    } catch (err: any) {
      Swal.fire("Error", err?.message || "Failed to save", "error");
    }
  };

  return (
    <Modal show={show} onClose={onClose}>
      <ModalHeader>{isEdit ? "Edit Price" : "Set Product Price"}</ModalHeader>

      <ModalBody>
        <div className="grid grid-cols-1 gap-3">

          {/* Base Price */}
          <div>
            <Label>Base Price</Label>
            <TextInput
              type="number"
              value={form.basePrice}
              onChange={(e) =>
                handleChange("basePrice", Number(e.target.value))
              }
            />
          </div>

          {/* Tax */}
          <div>
            <Label>Tax Percentage (%)</Label>
            <TextInput
              type="number"
              value={form.taxPercentage}
              onChange={(e) =>
                handleChange("taxPercentage", Number(e.target.value))
              }
            />
          </div>

          {/* Discount */}
          <div>
            <Label>Discount Category</Label>
            <Select
              value={form.discountCategory}
              onChange={(e) =>
                handleChange("discountCategory", e.target.value)
              }
            >
              <option value="NONE">None</option>
              <option value="SENIOR">Senior 20%</option>
              <option value="PWD">PWD 20%</option>
              <option value="STUDENT">Student</option>
              <option value="PROMO">Promo Discount</option>
            </Select>
          </div>

          {/* Promo Input */}
          {form.discountCategory === "PROMO" && (
            <div>
              <Label>Promo Discount (%)</Label>
              <TextInput
                type="number"
                value={form.discountPercentage}
                onChange={(e) =>
                  handleChange("discountPercentage", Number(e.target.value))
                }
              />
            </div>
          )}

          {/* Effective Date */}
          <div>
            <Label>Effective Date</Label>
            <TextInput
              type="date"
              value={form.effectiveDate}
              onChange={(e) => handleChange("effectiveDate", e.target.value)}
            />
          </div>

        </div>
      </ModalBody>

      <ModalFooter>
        <Button color="success" onClick={handleSubmit}>
          {isEdit ? "Update Price" : "Save Price"}
        </Button>
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}
