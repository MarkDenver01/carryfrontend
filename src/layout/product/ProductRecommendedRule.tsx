import { useState, useMemo } from "react";
import { Button, Dropdown, DropdownItem, Pagination } from "flowbite-react";
import { Search, ChevronDown } from "lucide-react";
import Swal from "sweetalert2";
import { format } from "date-fns";
import type {
  RecommendationRuleDTO,
  RecommendationRuleRequest,
} from "../../libs/models/product/RecommendedRule";
import { useRecommendationRules } from "../../context/RecommendationRulesContext";

export default function RecommendationRulesPage() {
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

  const pageSize = 8;
  const [currentPage, setCurrentPage] = useState(1);

  // Filter
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

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedRules = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Create or Edit
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

  const handleSaveRule = async () => {
    if (!form.baseProductId || form.recommendedProductIds.length === 0) {
      await Swal.fire("Validation", "Please fill all required fields.", "warning");
      return;
    }

    try {
      if (editTarget) {
        await updateRuleById(editTarget.id, form);
        await Swal.fire("Updated", "Recommendation rule updated successfully!", "success");
      } else {
        await addRule(form);
        await Swal.fire("Created", "Recommendation rule created successfully!", "success");
      }
      closeModal();
    } catch (err: any) {
      await Swal.fire("Error", err?.message || "Failed to save rule.", "error");
    }
  };

  const handleDeleteRule = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Delete Rule?",
      text: "Are you sure you want to delete this recommendation rule?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });
    if (confirm.isConfirmed) {
      await removeRule(id);
      await Swal.fire("Deleted", "Rule has been removed.", "success");
    }
  };

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
          + Add Recommendation Rule
        </Button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Search product or recommendation..."
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

        <Dropdown
          dismissOnClick={true}
          label=""
          renderTrigger={() => (
            <button
              className="flex items-center gap-2 border border-emerald-500 bg-emerald-100 
                         text-emerald-900 font-semibold text-sm px-4 py-1 rounded-full shadow 
                         hover:shadow-md transition"
            >
              {`Filter: ${status === "" ? "All Status" : status}`}
              <ChevronDown className="w-4 h-4 text-emerald-900" />
            </button>
          )}
        >
          <DropdownItem onClick={() => setStatus("")}>All Status</DropdownItem>
          <DropdownItem onClick={() => setStatus("Active")}>Active</DropdownItem>
          <DropdownItem onClick={() => setStatus("Inactive")}>Inactive</DropdownItem>
        </Dropdown>
      </div>

      {/* TABLE */}
      <div className="w-full overflow-x-auto pb-2">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Main Product</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Recommended Products</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Effective Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Expiry Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRules.length > 0 ? (
              paginatedRules.map((rule) => (
                <tr key={rule.id} className="border-b hover:bg-gray-50 text-sm">
                  <td className="px-4 py-3">{rule.productName}</td>
                  <td className="px-4 py-3">
                    {rule.recommendedNames.join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {rule.effectiveDate ? format(new Date(rule.effectiveDate), "yyyy-MM-dd") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {rule.expiryDate ? format(new Date(rule.expiryDate), "yyyy-MM-dd") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        rule.active
                          ? "bg-green-100 text-green-800 border border-green-300"
                          : "bg-red-100 text-red-800 border border-red-300"
                      }`}
                    >
                      {rule.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => openEditModal(rule)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDeleteRule(rule.id)}
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
                  className="text-center text-gray-500 py-6 text-sm"
                >
                  No recommendation rules found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 text-sm text-gray-600">
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
            <span className="font-semibold text-gray-800">
              {filtered.length}
            </span>{" "}
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
              {editTarget ? "Edit Recommendation Rule" : "Add New Recommendation Rule"}
            </h2>

            <div className="space-y-4">
              <input
                type="number"
                placeholder="Main Product ID"
                value={form.baseProductId}
                onChange={(e) =>
                  setForm({ ...form, baseProductId: Number(e.target.value) })
                }
                className="border border-gray-300 w-full p-2 rounded focus:ring-2 focus:ring-emerald-400"
              />

              <input
                type="text"
                placeholder="Recommended Product IDs (comma-separated)"
                onChange={(e) =>
                  setForm({
                    ...form,
                    recommendedProductIds: e.target.value
                      .split(",")
                      .map((id) => Number(id.trim()))
                      .filter((id) => !isNaN(id)),
                  })
                }
                className="border border-gray-300 w-full p-2 rounded focus:ring-2 focus:ring-emerald-400"
              />

              <input
                type="date"
                value={form.effectiveDate}
                onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
                className="border border-gray-300 w-full p-2 rounded focus:ring-2 focus:ring-emerald-400"
              />

              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className="border border-gray-300 w-full p-2 rounded focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div className="flex justify-end mt-6 gap-3">
              <Button
                color="gray"
                onClick={closeModal}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </Button>
              <Button
                color="blue"
                onClick={handleSaveRule}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editTarget ? "Update Rule" : "Create Rule"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
