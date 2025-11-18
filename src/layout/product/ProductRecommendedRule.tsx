import { useState, useMemo } from "react";
import { Button, Dropdown, DropdownItem, Pagination } from "flowbite-react";
import { Search, ChevronDown } from "lucide-react";
import Swal from "sweetalert2";
import { format } from "date-fns";

import { useProductsContext } from "../../context/ProductsContext";
import { useRecommendationRules } from "../../context/RecommendationRulesContext";
import type {
  RecommendationRuleRequest,
  RecommendationRuleDTO,
} from "../../libs/models/product/RecommendedRule";

export default function RecommendationRulesPage() {
  const { products } = useProductsContext();
  const { rules, addRule, updateRuleById, removeRule } = useRecommendationRules();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | "Active" | "Inactive">("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<RecommendationRuleDTO | null>(null);

  const [form, setForm] = useState<RecommendationRuleRequest>({
    baseProductId: 0,
    recommendedProductIds: [],
    effectiveDate: "",
    expiryDate: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // =============================
  // FILTER + SEARCH
  // =============================
  const filtered = useMemo(() => {
    return rules.filter(
      (r) =>
        (r.productName + r.recommendedNames.join(", "))
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        (status === "" ||
          (status === "Active" ? r.active : !r.active))
    );
  }, [rules, search, status]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // =============================
  // MODAL HANDLERS
  // =============================
  const openCreateModal = () => {
    setEditTarget(null);
    setForm({
      baseProductId: 0,
      recommendedProductIds: [],
      effectiveDate: "",
      expiryDate: "",
    });
    setShowModal(true);
  };

  const openEditModal = (rule: RecommendationRuleDTO) => {
    setEditTarget(rule);
    setForm({
      baseProductId: rule.productId,
      recommendedProductIds: [],
      effectiveDate: rule.effectiveDate,
      expiryDate: rule.expiryDate,
    });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  // =============================
  // SAVE RULE (ADD / UPDATE)
  // =============================
  const handleSaveRule = async () => {
    if (!form.baseProductId || form.recommendedProductIds.length === 0) {
      await Swal.fire("Validation", "Please fill all required fields", "warning");
      return;
    }

    try {
      if (editTarget) {
        await updateRuleById(editTarget.id, form);
        await Swal.fire("Updated", "Rule updated successfully!", "success");
      } else {
        await addRule(form);
        await Swal.fire("Created", "Rule created successfully!", "success");
      }
      closeModal();
    } catch (err: any) {
      await Swal.fire("Error", err.message || "Failed to save rule", "error");
    }
  };

  // =============================
  // DELETE RULE
  // =============================
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete Rule?",
      text: "Are you sure you want to delete this rule?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      await removeRule(id);
      Swal.fire("Deleted!", "Rule has been removed.", "success");
    }
  };

  // =============================
  // RENDER UI
  // =============================
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Recommendation Rules Management
        </h2>

        <Button
          onClick={openCreateModal}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          + Add Rule
        </Button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Search product..."
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

        {/* Status Filter */}
        <Dropdown
          dismissOnClick
          label=""
          renderTrigger={() => (
            <button
              className="flex items-center gap-2 border border-emerald-500 bg-emerald-100 
                         text-emerald-900 font-semibold text-sm px-4 py-1 rounded-full shadow 
                         hover:shadow-md transition"
            >
              {`Filter: ${status === "" ? "All" : status}`}
              <ChevronDown className="w-4 h-4 text-emerald-900" />
            </button>
          )}
        >
          <DropdownItem onClick={() => setStatus("")}>All</DropdownItem>
          <DropdownItem onClick={() => setStatus("Active")}>Active</DropdownItem>
          <DropdownItem onClick={() => setStatus("Inactive")}>
            Inactive
          </DropdownItem>
        </Dropdown>
      </div>

      {/* TABLE */}
      <div className="w-full overflow-x-auto pb-2">
        <table className="min-w-full border border-gray-200 text-sm text-left text-gray-700">
          <thead className="bg-emerald-600 text-white">
            <tr>
              <th className="p-3 border font-medium">Main Product</th>
              <th className="p-3 border font-medium">Recommended</th>
              <th className="p-3 border font-medium">Effective Date</th>
              <th className="p-3 border font-medium">Expiry Date</th>
              <th className="p-3 border font-medium">Status</th>
              <th className="p-3 border font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length > 0 ? (
              paginated.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="p-3 border font-medium">{r.productName}</td>
                  <td className="p-3 border">{r.recommendedNames.join(", ")}</td>
                  <td className="p-3 border">
                    {r.effectiveDate
                      ? format(new Date(r.effectiveDate), "yyyy-MM-dd")
                      : "—"}
                  </td>
                  <td className="p-3 border">
                    {r.expiryDate
                      ? format(new Date(r.expiryDate), "yyyy-MM-dd")
                      : "—"}
                  </td>
                  <td className="p-3 border">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        r.active
                          ? "bg-green-100 text-green-800 border border-green-300"
                          : "bg-red-100 text-red-800 border border-red-300"
                      }`}
                    >
                      {r.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3 border text-center space-x-3">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => openEditModal(r)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(r.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center text-gray-500 p-4 border"
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
              {(currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-800">
              {Math.min(currentPage * pageSize, filtered.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-800">{filtered.length}</span>{" "}
            entries
          </span>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showIcons
          />
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px] shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              {editTarget ? "Edit Rule" : "Add Rule"}
            </h2>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Base Product
              </label>
              <select
                className="w-full border border-gray-300 rounded p-2"
                value={form.baseProductId}
                onChange={(e) =>
                  setForm({ ...form, baseProductId: Number(e.target.value) })
                }
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <label className="block text-sm font-medium text-gray-700">
                Recommended Products
              </label>
              <select
                multiple
                className="w-full border border-gray-300 rounded p-2"
                value={form.recommendedProductIds.map(String)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    recommendedProductIds: Array.from(
                      e.target.selectedOptions,
                      (o) => Number(o.value)
                    ),
                  })
                }
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Effective Date
                  </label>
                  <input
                    type="date"
                    className="border border-gray-300 w-full p-2 rounded"
                    value={form.effectiveDate}
                    onChange={(e) =>
                      setForm({ ...form, effectiveDate: e.target.value })
                    }
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    className="border border-gray-300 w-full p-2 rounded"
                    value={form.expiryDate}
                    onChange={(e) =>
                      setForm({ ...form, expiryDate: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 gap-3">
              <Button color="gray" onClick={closeModal}>
                Cancel
              </Button>
              <Button color="blue" onClick={handleSaveRule}>
                {editTarget ? "Update" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
