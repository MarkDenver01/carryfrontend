import { useState, useEffect, useMemo } from "react";
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
import dayjs from "dayjs";
import { motion } from "framer-motion";

import type { Product } from "../../types/types";
import { validateProduct } from "../../types/useProducts";

import { useProductsContext } from "../../context/ProductsContext";
import { useCategoryContext } from "../../context/CategoryContext";

import {
  updateProductFormData,
  addProductFormData,
} from "../../libs/ApiGatewayDatasource";

interface ProductFormModalProps {
  show: boolean;
  onClose: () => void;
  product?: Product | null;
}

export default function ProductFormModalV4({
  show,
  onClose,
  product = null,
}: ProductFormModalProps) {
  const { reloadProducts } = useProductsContext();
  const { categories } = useCategoryContext();

  const emptyProduct: Product = {
    imageUrl: "",
    code: "",
    name: "",
    productDescription: "",
    size: "",
    stock: 0,
    expiryDate: "",
    inDate: "",
    status: "Available",
    categoryId: null,
  };

  const [form, setForm] = useState<Product>(emptyProduct);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(product?.productId);

  // ======================================
  // LOAD PRODUCT ON EDIT OR ADD
  // ======================================
  useEffect(() => {
    if (show && product) {
      setForm({ ...product });
      setPreview(product.imageUrl ?? null);
      setImageFile(null);
      setTouched({});
    } else if (show) {
      setForm(emptyProduct);
      setPreview(null);
      setImageFile(null);
      setTouched({});
    }
  }, [show, product]);

  // ======================================
  // VALIDATION HANDLING
  // ======================================
  const validationMessage = useMemo(() => validateProduct(form), [form]);
  const formIsValid =
    !validationMessage &&
    form.categoryId !== null &&
    form.stock >= 0 &&
    form.code &&
    form.name;

  const setField = (key: keyof Product, value: any) => {
    setTouched((t) => ({ ...t, [key]: true }));
    setForm((prev) => ({
      ...prev,
      [key]: key === "stock" ? Number(value) : value,
    }));
  };

  // ======================================
  // IMAGE UPLOADER (DRAG, DROP & CLICK)
  // ======================================
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleBrowseFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setPreview(file ? URL.createObjectURL(file) : form.imageUrl ?? null);
  };

  // ======================================
  // EXPIRY STATUS INDICATOR
  // ======================================
  const expiryStatus = useMemo(() => {
    if (!form.expiryDate) return null;
    const daysLeft = dayjs(form.expiryDate).diff(dayjs(), "day");

    if (daysLeft < 0) return "Expired";
    if (daysLeft <= 7) return "Near Expiry";
    return null;
  }, [form.expiryDate]);

  // ======================================
  // SUBMIT HANDLER
  // ======================================
  const handleSubmit = async () => {
    if (!formIsValid) {
      Swal.fire("Invalid Form", validationMessage || "Please complete fields.", "warning");
      return;
    }

    const expiry = form.expiryDate ? `${form.expiryDate}T00:00:00` : null;
    const inDate = form.inDate ? `${form.inDate}T00:00:00` : null;

    const payload = {
      productCode: form.code,
      productName: form.name,
      productDescription: form.productDescription,
      productSize: form.size,
      stocks: form.stock,
      productStatus: form.status,
      expiryDate: expiry,
      productInDate: inDate,
      categoryId: form.categoryId,
      productImgUrl: form.imageUrl,
    };

    const formData = new FormData();
    formData.append("product", JSON.stringify(payload));
    if (imageFile) formData.append("file", imageFile);

    setLoading(true);

    try {
      if (isEdit) {
        await updateProductFormData(form.productId!, formData);
        Swal.fire("Success", "Product updated successfully!", "success");
      } else {
        await addProductFormData(formData);
        Swal.fire("Success", "Product added successfully!", "success");
      }

      await reloadProducts();
      onClose();
    } catch (err: any) {
      Swal.fire("Error", err?.message || "Failed to save product", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} size="lg" popup onClose={onClose}>
      <ModalHeader />

      <ModalBody>
        <motion.h3
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-extrabold mb-4 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-400 bg-clip-text text-transparent"
        >
          {isEdit ? "Edit Product" : "Add New Product"}
        </motion.h3>

        <div className="p-4 rounded-2xl bg-white/70 border border-emerald-200 shadow-xl backdrop-blur-xl space-y-6">

          {/* DRAG + DROP + CLICK IMAGE UPLOADER */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById("image-upload")?.click()}
            className="border-2 border-dashed border-emerald-300 rounded-xl p-4 text-center cursor-pointer bg-white/70"
          >
            <Label className="font-semibold text-slate-700">Product Image</Label>

            {preview ? (
              <img
                src={preview}
                className="w-24 h-24 mx-auto mt-3 object-cover rounded-lg border shadow"
              />
            ) : (
              <p className="text-sm text-gray-500 mt-2">
                Drag & Drop or Click to Upload
              </p>
            )}

            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleBrowseFile}
              className="hidden"
            />
          </div>

          {/* EXPIRY INDICATOR */}
          {expiryStatus && (
            <p
              className={
                expiryStatus === "Expired"
                  ? "text-red-600 font-semibold"
                  : "text-amber-500 font-semibold"
              }
            >
              ⚠ {expiryStatus}
            </p>
          )}

          {/* INPUT FIELDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Code" value={form.code} onChange={(v) => setField("code", v)}
              touched={touched.code} error={!form.code && touched.code ? "Required" : ""} />

            <Field label="Name" value={form.name} onChange={(v) => setField("name", v)}
              touched={touched.name} error={!form.name && touched.name ? "Required" : ""} />

            <Field label="Description" value={form.productDescription}
              onChange={(v) => setField("productDescription", v)} />

            <Field label="Size" value={form.size}
              onChange={(v) => setField("size", v)} />
          </div>

          {/* CATEGORY */}
          <div>
            <Label className="font-semibold text-slate-700">Category</Label>
            <Select
              value={form.categoryId ?? ""}
              onChange={(e) =>
                setField("categoryId", e.target.value ? Number(e.target.value) : null)
              }
              className={
                touched.categoryId && form.categoryId === null ? "border-red-500" : ""
              }
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.categoryName}
                </option>
              ))}
            </Select>

            {touched.categoryId && form.categoryId === null && (
              <p className="text-red-600 text-xs mt-1">Category is required</p>
            )}
          </div>

          {/* STOCK + STATUS */}
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Stock"
              type="number"
              value={form.stock}
              onChange={(v) => setField("stock", v)}
              touched={touched.stock}
              error={form.stock < 0 && touched.stock ? "Invalid stock" : ""}
            />

            <div>
              <Label className="font-semibold text-slate-700">Status</Label>
              <Select
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
              >
                <option value="Available">Available</option>
                <option value="Not Available">Not Available</option>
                <option value="Out of Stock">Out of Stock</option>
              </Select>
            </div>
          </div>

          {/* DATE FIELDS */}
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Expiry Date"
              type="date"
              value={form.expiryDate ?? ""}
              onChange={(v) => setField("expiryDate", v)}
            />

            <Field
              label="In Date"
              type="date"
              value={form.inDate ?? ""}
              onChange={(v) => setField("inDate", v)}
            />
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button
          color="success"
          onClick={handleSubmit}
          disabled={!formIsValid || loading}
          className="rounded-full px-5 shadow-lg disabled:opacity-50"
        >
          {loading
            ? isEdit
              ? "Updating..."
              : "Adding..."
            : isEdit
            ? "Update Product"
            : "Add Product"}
        </Button>

        <Button color="gray" className="rounded-full" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}

/* ==========================================================
   REUSABLE FIELD COMPONENT
========================================================== */
function Field({
  label,
  value,
  type = "text",
  onChange,
  error,
  touched,
}: {
  label: string;
  value: any;
  type?: string;
  onChange: (val: any) => void;
  error?: string;
  touched?: boolean;
}) {
  const hasError = Boolean(error && touched);

  return (
    <div>
      <Label className="font-semibold text-slate-700">{label}</Label>

      <TextInput
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        color={hasError ? "failure" : undefined}
        className={hasError ? "border-red-500" : ""}
      />

      {hasError && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}
