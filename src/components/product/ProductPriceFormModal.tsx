import { useEffect, useState, useMemo } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  Label,
  Select,
  TextInput,
} from "flowbite-react";
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

  /* ===========================================
     CATEGORY LIST (REAL VALUES ONLY, TYPE-SAFE)
  ============================================ */
  const categories = useMemo(() => {
    const set = new Set<string>();

    products.forEach((p) => {
      const cat = p.categoryName;
      if (typeof cat === "string" && cat.trim() !== "") {
        set.add(cat);
      }
    });

    return Array.from(set); // string[]
  }, [products]);

  /* ===========================================
     FORM STATE
  ============================================ */
  const [selectedCategory, setSelectedCategory] = useState("");
  const [formData, setFormData] = useState({
    productId: 0,
    basePrice: 0,
    effectiveDate: "",
  });

  /* ===========================================
     PREFILL DATA WHEN UPDATING
  ============================================ */
  useEffect(() => {
    if (price) {
      const prod = products.find((p) => p.id === price.productId);

      setSelectedCategory(
        typeof prod?.categoryName === "string" ? prod.categoryName : ""
      );

      setFormData({
        productId: price.productId,
        basePrice: price.basePrice,
        effectiveDate: price.effectiveDate,
      });
    } else {
      setSelectedCategory("");
      setFormData({ productId: 0, basePrice: 0, effectiveDate: "" });
    }
  }, [price, products]);

  /* ===========================================
     FILTER PRODUCTS BY SELECTED CATEGORY
  ============================================ */
  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return [];
    return products.filter((p) => p.categoryName === selectedCategory);
  }, [selectedCategory, products]);

  /* ===========================================
     FORM SUBMISSION
  ============================================ */
  const handleSubmit = async () => {
    if (
      !selectedCategory ||
      !formData.productId ||
      !formData.basePrice ||
      !formData.effectiveDate
    ) {
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
        <h3
          className="
            text-xl font-extrabold text-center mb-6
            bg-gradient-to-r from-emerald-500 via-emerald-600 to-cyan-500
            text-transparent bg-clip-text
          "
        >
          {price ? "Update Product Price" : "Add Product Price"}
        </h3>

        <div className="space-y-5">
          {/* CATEGORY DROPDOWN */}
          <div className="space-y-1">
            <Label className="font-semibold text-slate-700">Category</Label>
            <div className="rounded-2xl border border-emerald-300/60 bg-white/90 px-3 py-2 shadow-sm">
              <Select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  // reset product pag nagpalit ng category
                  setFormData({ ...formData, productId: 0 });
                }}
                className="focus:ring-emerald-500"
              >
                <option value="">Select Category</option>

                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* PRODUCT DROPDOWN */}
          <div className="space-y-1">
            <Label className="font-semibold text-slate-700">Product</Label>
            <div className="rounded-2xl border border-emerald-300/60 bg-white/90 px-3 py-2 shadow-sm">
              <Select
                value={formData.productId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    productId: Number(e.target.value),
                  })
                }
                disabled={!selectedCategory}
                className="focus:ring-emerald-500"
              >
                <option value="">Select Product</option>

                {filteredProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* BASE PRICE */}
          <div className="space-y-1">
            <Label className="font-semibold text-slate-700">
              Base Price (₱)
            </Label>
            <div className="rounded-2xl border border-emerald-300/60 bg-white/90 px-3 py-2 shadow-sm">
              <TextInput
                type="number"
                value={formData.basePrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    basePrice: Number(e.target.value),
                  })
                }
                className="focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* EFFECTIVE DATE */}
          <div className="space-y-1">
            <Label className="font-semibold text-slate-700">
              Effective Date
            </Label>
            <div className="rounded-2xl border border-cyan-300/60 bg-white/90 px-3 py-2 shadow-sm">
              <TextInput
                type="date"
                value={formData.effectiveDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    effectiveDate: e.target.value,
                  })
                }
                className="focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              color="gray"
              onClick={onClose}
              className="rounded-full px-5 py-2"
            >
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              className="
                rounded-full px-5 py-2 font-semibold text-white
                bg-gradient-to-r from-emerald-600 to-cyan-500
              "
            >
              {price ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
