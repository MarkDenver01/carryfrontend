// src/layout/product/ProductRecommendedRule.tsx

import { useState, useMemo } from "react";
import {
  Modal,
  Button,
  Label,
  TextInput,
  Select,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Dropdown,
  DropdownItem,
  Pagination,
} from "flowbite-react";
import {
  Pencil,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Search,
  ChevronDown,
} from "lucide-react";
import Swal from "sweetalert2";

import { useProductsContext } from "../../context/ProductsContext";
import { useRecommendationRulesContext } from "../../context/RecommendationRulesContext";

import type {
  RecommendationRule,
  RecommendationRulePayload,
} from "../../types/recommendationTypes";

type SortField = "product" | "category" | "effectiveDate";

interface RuleFormState {
  // NOTE: form state can use null, pero payload will ALWAYS send number (Option A)
  baseProductId: number | null;
  recommendedProductIds: number[];
  effectiveDate: string;
  expiryDate: string;
}

const initialForm: RuleFormState = {
  baseProductId: null,
  recommendedProductIds: [],
  effectiveDate: "",
  expiryDate: "",
};

export default function ProductRecommendedRule() {
  const { products } = useProductsContext();
  const {
    rules,
    createRule,
    editRule,
    removeRule,
    toggleStatus,
  } = useRecommendationRulesContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<RuleFormState>(initialForm);
  const [editingRule, setEditingRule] = useState<RecommendationRule | null>(
    null
  );

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortField, setSortField] = useState<SortField>("product");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);

  // ==============================
  // CATEGORY OPTIONS
  // ==============================
  const uniqueCategories = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .map((p) => p.categoryName)
            .filter((x): x is string => !!x && x.trim() !== "")
        )
      ),
    [products]
  );

  // ==============================
  // SORT ICON
  // ==============================
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <ArrowUpDown className="w-4 h-4 inline opacity-50" />;
    if (sortOrder === "asc") return <ArrowUp className="w-4 h-4 inline" />;
    return <ArrowDown className="w-4 h-4 inline" />;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // ==============================
  // OPEN / CLOSE MODAL
  // ==============================
  const openAddModal = () => {
    setEditingRule(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (rule: RecommendationRule) => {
    setEditingRule(rule);
    setForm({
      baseProductId: rule.baseProductId,
      recommendedProductIds:
        rule.recommendedProducts?.map((r) => r.productId) ?? [],
      effectiveDate: rule.effectiveDate,
      expiryDate: rule.expiryDate,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRule(null);
    setForm(initialForm);
  };

  // ==============================
  // FORM HANDLERS
  // ==============================
  const handleFormChange = (
    field: keyof RuleFormState,
    value: string | number | string[]
  ) => {
    if (field === "baseProductId") {
      const strVal = value as string;
      setForm((prev) => ({
        ...prev,
        baseProductId: strVal === "" ? null : Number(strVal),
        // reset recommended when changing base product
        recommendedProductIds: [],
      }));
      return;
    }

    if (field === "recommendedProductIds") {
      const values = (value as string[])
        .map((v) => Number(v))
        .filter((n) => !Number.isNaN(n));
      setForm((prev) => ({
        ...prev,
        recommendedProductIds: values,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Recommended options: optionally same category as base product
  const baseProduct = useMemo(
    () =>
      form.baseProductId == null
        ? undefined
        : products.find((p) => p.id === form.baseProductId),
    [products, form.baseProductId]
  );

  const recommendedOptions = useMemo(() => {
    if (!baseProduct) return products;
    // filter by same category and exclude self
    return products.filter(
      (p) =>
        p.id !== baseProduct.id &&
        (!baseProduct.categoryName ||
          p.categoryName === baseProduct.categoryName)
    );
  }, [products, baseProduct]);

  // ==============================
  // VALIDATION
  // ==============================
  const validateForm = (): string | null => {
    if (!form.baseProductId) return "Please select a base product.";
    if (!form.effectiveDate) return "Effective date is required.";
    if (!form.expiryDate) return "Expiry date is required.";
    if (form.recommendedProductIds.length === 0)
      return "Please select at least one recommended product.";
    if (form.expiryDate < form.effectiveDate)
      return "Expiry date cannot be earlier than effective date.";
    return null;
  };

  // ==============================
  // SAVE RULE (CREATE / UPDATE)
  // ==============================
  const handleSaveRule = async () => {
    const validationError = validateForm();
    if (validationError) {
      await Swal.fire("Validation", validationError, "warning");
      return;
    }

    // Extra defensive filter para walang null/NaN na pumalo sa backend
    const cleanRecommendedIds = form.recommendedProductIds.filter(
      (id) => typeof id === "number" && !Number.isNaN(id)
    );

    if (!form.baseProductId) {
      await Swal.fire("Validation", "Base product is required.", "warning");
      return;
    }

    if (cleanRecommendedIds.length === 0) {
      await Swal.fire(
        "Validation",
        "Please select at least one valid recommended product.",
        "warning"
      );
      return;
    }

    const payload: RecommendationRulePayload = {
      // Option A: backend ALWAYS expects a number here
      baseProductId: form.baseProductId as number,
      recommendedProductIds: cleanRecommendedIds,
      effectiveDate: form.effectiveDate,
      expiryDate: form.expiryDate,
    };

    try {
      if (editingRule) {
        await editRule(editingRule.id, payload);
        await Swal.fire("Updated", "Recommendation rule updated.", "success");
      } else {
        await createRule(payload);
        await Swal.fire("Created", "Recommendation rule created.", "success");
      }
      closeModal();
    } catch (err: any) {
      await Swal.fire(
        "Error",
        err?.message || "Failed to save recommendation rule",
        "error"
      );
    }
  };

  // ==============================
  // DELETE / TOGGLE STATUS
  // ==============================
  const handleDelete = async (rule: RecommendationRule) => {
    const result = await Swal.fire({
      title: "Delete Rule?",
      text: `Delete recommendation rule for "${rule.baseProductName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;
    try {
      await removeRule(rule.id);
      await Swal.fire("Deleted", "Rule has been removed.", "success");
    } catch (err: any) {
      await Swal.fire(
        "Error",
        err?.message || "Failed to delete recommendation rule",
        "error"
      );
    }
  };

  const handleToggleStatus = async (rule: RecommendationRule) => {
    try {
      await toggleStatus(rule.id);
    } catch (err: any) {
      await Swal.fire(
        "Error",
        err?.message || "Failed to update rule status",
        "error"
      );
    }
  };

  // ==============================
  // FILTER + SORT + PAGINATION
  // ==============================
  const filtered = useMemo(() => {
    return rules.filter((r) => {
      const matchSearch = r.baseProductName
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchCategory =
        selectedCategory === "" ||
        r.baseProductCategoryName === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [rules, search, selectedCategory]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let aVal = "";
      let bVal = "";

      if (sortField === "product") {
        aVal = a.baseProductName.toLowerCase();
        bVal = b.baseProductName.toLowerCase();
      } else if (sortField === "category") {
        aVal = (a.baseProductCategoryName ?? "").toLowerCase();
        bVal = (b.baseProductCategoryName ?? "").toLowerCase();
      } else if (sortField === "effectiveDate") {
        aVal = a.effectiveDate;
        bVal = b.effectiveDate;
      }

      return sortOrder === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  }, [filtered, sortField, sortOrder]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = sorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ==============================
  // RENDER
  // ==============================
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Product Recommendation Rules
        </h2>

        <Button
          onClick={openAddModal}
          className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Rule
        </Button>
      </div>

      {/* SEARCH + FILTER (same feel as ProductInventoryTable) */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Search base product..."
            className="w-full border border-emerald-300 rounded-full px-4 py-2 pl-10 shadow-sm 
                       focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
        </div>

        {/* Category filter (Dropdown style) */}
        <Dropdown
          dismissOnClick={true}
          label=""
          renderTrigger={() => (
            <button
              className="flex items-center gap-2 border border-emerald-500 bg-emerald-100 
                         text-emerald-900 font-semibold text-sm px-4 py-1 rounded-full shadow 
                         hover:shadow-md transition"
            >
              {`Category: ${
                selectedCategory === "" ? "All" : selectedCategory
              }`}
              <ChevronDown className="w-4 h-4 text-emerald-900" />
            </button>
          )}
        >
          <DropdownItem
            onClick={() => {
              setSelectedCategory("");
              setCurrentPage(1);
            }}
          >
            All Categories
          </DropdownItem>

          {uniqueCategories.map((cat) => (
            <DropdownItem
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
            >
              {cat}
            </DropdownItem>
          ))}
        </Dropdown>
      </div>

      {/* TABLE */}
      <div className="w-full overflow-x-auto pb-2">
        <table className="min-w-full border border-gray-200 text-sm text-left text-gray-700">
          <thead className="bg-emerald-600 text-white">
            <tr>
              <th className="p-3 border font-medium">Status</th>

              <th
                className="p-3 border font-medium cursor-pointer select-none"
                onClick={() => handleSort("product")}
              >
                Product <SortIcon field="product" />
              </th>

              <th className="p-3 border font-medium">Recommended</th>

              <th
                className="p-3 border font-medium cursor-pointer select-none"
                onClick={() => handleSort("effectiveDate")}
              >
                Date Range <SortIcon field="effectiveDate" />
              </th>

              <th
                className="p-3 border font-medium cursor-pointer select-none"
                onClick={() => handleSort("category")}
              >
                Category <SortIcon field="category" />
              </th>

              <th className="p-3 border font-medium text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.length > 0 ? (
              paginated.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-100">
                  {/* STATUS PILL */}
                  <td className="p-3 border">
                    <button
                      onClick={() => handleToggleStatus(rule)}
                      className={`px-2 py-1 text-xs font-semibold rounded-full border ${
                        rule.status === "ACTIVE"
                          ? "bg-green-100 text-green-700 border-green-300"
                          : "bg-gray-100 text-gray-700 border-gray-300"
                      }`}
                    >
                      {rule.status === "ACTIVE" ? "Active" : "Inactive"}
                    </button>
                  </td>

                  {/* PRODUCT NAME */}
                  <td className="p-3 border font-medium">
                    {rule.baseProductName}
                  </td>

                  {/* RECOMMENDED LIST */}
                  <td className="p-3 border">
                    {rule.recommendedProducts.length > 0
                      ? rule.recommendedProducts
                          .map((r) => r.productName)
                          .join(", ")
                      : "—"}
                  </td>

                  {/* DATE RANGE */}
                  <td className="p-3 border">
                    {rule.effectiveDate} → {rule.expiryDate}
                  </td>

                  {/* CATEGORY */}
                  <td className="p-3 border">
                    {rule.baseProductCategoryName ?? "—"}
                  </td>

                  {/* ACTIONS */}
                  <td className="p-3 border">
                    <div className="flex justify-center gap-2">
                      <Button
                        size="xs"
                        color="warning"
                        onClick={() => openEditModal(rule)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>

                      <Button
                        size="xs"
                        color="failure"
                        onClick={() => handleDelete(rule)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center p-4 text-gray-500 border"
                >
                  No rules found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-6 text-sm text-gray-600">
          <span>
            Showing{" "}
            <span className="font-semibold text-gray-800">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-800">
              {Math.min(currentPage * itemsPerPage, sorted.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-800">
              {sorted.length}
            </span>{" "}
            entries
          </span>

          <div className="flex overflow-x-auto sm:justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              showIcons
            />
          </div>
        </div>
      )}

      {/* MODAL */}
      <Modal show={isModalOpen} onClose={closeModal}>
        <ModalHeader>
          {editingRule
            ? "Edit Recommendation Rule"
            : "Add New Recommendation Rule"}
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            {/* PRODUCT */}
            <div>
              <Label htmlFor="product">When Product</Label>
              <Select
                id="product"
                value={form.baseProductId == null ? "" : String(form.baseProductId)}
                onChange={(e) =>
                  handleFormChange("baseProductId", e.target.value)
                }
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </Select>
            </div>

            {/* RECOMMENDED MULTI SELECT */}
            <div>
              <Label htmlFor="recommended">Show Recommended Product(s)</Label>
              <Select
                id="recommended"
                multiple
                value={form.recommendedProductIds.map(String)}
                onChange={(e) =>
                  handleFormChange(
                    "recommendedProductIds",
                    Array.from(e.target.selectedOptions, (o) => o.value)
                  )
                }
              >
                {recommendedOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </Select>
            </div>

            {/* EFFECTIVE DATE */}
            <div>
              <Label>Effective Date</Label>
              <TextInput
                type="date"
                value={form.effectiveDate}
                onChange={(e) =>
                  handleFormChange("effectiveDate", e.target.value)
                }
              />
            </div>

            {/* EXPIRY DATE */}
            <div>
              <Label>Expiry Date</Label>
              <TextInput
                type="date"
                value={form.expiryDate}
                onChange={(e) =>
                  handleFormChange("expiryDate", e.target.value)
                }
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleSaveRule}
          >
            {editingRule ? "Update Rule" : "Add Rule"}
          </Button>

          <Button color="gray" onClick={closeModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
