import { useState, useMemo } from "react";
import { Button, Pagination, Modal, ModalHeader, ModalBody, TextInput, Label, Select } from "flowbite-react";
import { Search, Pencil, XCircle } from "lucide-react";
import Swal from "sweetalert2";
import { format } from "date-fns";

import { useProductsContext } from "../../context/ProductsContext";
import { useRecommendationRules } from "../../context/RecommendationRulesContext";
import type { RecommendationRuleDTO, RecommendationRuleRequest } from "../../libs/models/product/RecommendedRule";

export default function RecommendationRulesPage() {
  const { products } = useProductsContext();
  const { rules, addRule, updateRuleById, removeRule } = useRecommendationRules();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<RecommendationRuleDTO | null>(null);

  const [form, setForm] = useState<RecommendationRuleRequest>({
    baseProductId: 0,
    recommendedProductIds: [],
    effectiveDate: "",
    expiryDate: "",
  });

  const pageSize = 8;

  // ======== FILTER + SEARCH ========
  const filtered = useMemo(() => {
    return rules.filter((r) =>
      (r.productName + r.recommendedNames.join(", "))
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [rules, search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ======== MODAL HANDLERS ========
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

  // ======== SAVE HANDLER ========
  const handleSaveRule = async () => {
    if (!form.baseProductId || form.recommendedProductIds.length === 0) {
      await Swal.fire("Validation", "Please fill all required fields", "warning");
      return;
    }

    try {
      if (editTarget) {
        await updateRuleById(editTarget.id, form);
        Swal.fire("Updated!", "Rule updated successfully.", "success");
      } else {
        await addRule(form);
        Swal.fire("Added!", "Rule created successfully.", "success");
      }
      closeModal();
    } catch (err: any) {
      Swal.fire("Error", err.message || "Failed to save rule", "error");
    }
  };

  // ======== DELETE HANDLER ========
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete Rule?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    });

    if (result.isConfirmed) {
      await removeRule(id);
      Swal.fire("Deleted!", "Rule removed successfully.", "success");
    }
  };

  // ======== UI ========
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Recommendation Rules
        </h2>

        <Button
          onClick={openCreateModal}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          + Add Rule
        </Button>
      </div>

      {/* SEARCH */}
      <div className="relative w-full max-w-xs mb-6">
        <input
          type="text"
          placeholder="Search rule..."
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

      {/* TABLE */}
      <div className="w-full overflow-x-auto pb-2">
        <table className="min-w-[1400px] border border-gray-300 text-sm text-left text-gray-700">
          <thead className="bg-emerald-600 text-white">
            <tr>
              <th className="p-3 border border-gray-300 font-medium">
                Main Product
              </th>
              <th className="p-3 border border-gray-300 font-medium">
                Recommended Products
              </th>
              <th className="p-3 border border-gray-300 font-medium">
                Effective Date
              </th>
              <th className="p-3 border border-gray-300 font-medium">
                Expiry Date
              </th>
              <th className="p-3 border border-gray-300 font-medium">
                Status
              </th>
              <th className="p-3 border border-gray-300 font-medium text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-gray-50">
            {paginated.length > 0 ? (
              paginated.map((rule) => (
                <tr key={rule.id} className="hover:bg-emerald-100 transition">
                  <td className="p-3 border border-gray-300 font-medium">
                    {rule.productName}
                  </td>
                  <td className="p-3 border border-gray-300">
                    {rule.recommendedNames.join(", ")}
                  </td>
                  <td className="p-3 border border-gray-300">
                    {rule.effectiveDate
                      ? format(new Date(rule.effectiveDate), "yyyy-MM-dd")
                      : "—"}
                  </td>
                  <td className="p-3 border border-gray-300">
                    {rule.expiryDate
                      ? format(new Date(rule.expiryDate), "yyyy-MM-dd")
                      : "—"}
                  </td>
                  <td className="p-3 border border-gray-300 text-center">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        rule.active
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-red-100 text-red-700 border border-red-300"
                      }`}
                    >
                      {rule.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3 border border-gray-300 text-center">
                    <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                      {/* UPDATE */}
                      <button
                        className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-yellow-500 hover:bg-yellow-600 rounded-md"
                        onClick={() => openEditModal(rule)}
                      >
                        <Pencil className="w-4 h-4" /> Update
                      </button>

                      {/* DELETE */}
                      <button
                        className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded-md"
                        onClick={() => handleDelete(rule.id)}
                      >
                        <XCircle className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="p-4 text-center text-gray-500 border border-gray-300"
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
      <Modal show={showModal} size="md" popup onClose={closeModal}>
        <ModalHeader />
        <ModalBody>
          <h3 className="text-lg font-bold mb-4">
            {editTarget ? "Edit Rule" : "Add New Rule"}
          </h3>

          <div className="mb-3">
            <Label>Main Product</Label>
            <Select
              value={form.baseProductId || ""}
              onChange={(e) =>
                setForm({ ...form, baseProductId: Number(e.target.value) })
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
            <Label>Recommended Products</Label>
            <Select
              multiple
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
            </Select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Effective Date</Label>
              <TextInput
                type="date"
                value={form.effectiveDate}
                onChange={(e) =>
                  setForm({ ...form, effectiveDate: e.target.value })
                }
              />
            </div>
            <div className="flex-1">
              <Label>Expiry Date</Label>
              <TextInput
                type="date"
                value={form.expiryDate}
                onChange={(e) =>
                  setForm({ ...form, expiryDate: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button color="gray" onClick={closeModal}>
              Cancel
            </Button>
            <Button color="blue" onClick={handleSaveRule}>
              {editTarget ? "Update" : "Add"}
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
}
