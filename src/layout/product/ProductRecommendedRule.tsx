import { useState, useMemo } from "react";
import {
  Button,
  Pagination,
  Modal,
  ModalHeader,
  ModalBody,
  TextInput,
  Label,
  Select,
} from "flowbite-react";
import { Search, Pencil, XCircle, Sparkles } from "lucide-react";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { motion } from "framer-motion";

import { useProductsContext } from "../../context/ProductsContext";
import { useRecommendationRules } from "../../context/RecommendationRulesContext";
import type {
  RecommendationRuleDTO,
  RecommendationRuleRequest,
} from "../../libs/models/product/RecommendedRule";

// =======================================================
//     RECOMMENDATION RULES PAGE — GODLY HUD VERSION
// =======================================================
export default function RecommendationRulesPage() {
  const { products } = useProductsContext();
  const { rules, addRule, updateRuleById, removeRule } =
    useRecommendationRules();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<RecommendationRuleDTO | null>(
    null
  );

  const [form, setForm] = useState<RecommendationRuleRequest>({
    baseProductId: 0,
    recommendedProductIds: [],
    effectiveDate: "",
    expiryDate: "",
  });

  const pageSize = 8;

  // FILTER
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

  // ================= MODAL CONTROL =================
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

  // =============== SAVE HANDLER ===============
  const handleSaveRule = async () => {
    if (!form.baseProductId || form.recommendedProductIds.length === 0) {
      return Swal.fire("Validation", "Please complete all fields.", "warning");
    }

    try {
      if (editTarget) {
        await updateRuleById(editTarget.id, form);
        Swal.fire("Updated!", "Rule updated successfully.", "success");
      } else {
        await addRule(form);
        Swal.fire("Added!", "New rule saved successfully.", "success");
      }

      closeModal();
    } catch (err: any) {
      Swal.fire("Error", err.message || "Saving failed", "error");
    }
  };

  // =============== DELETE HANDLER ===============
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete Rule?",
      text: "This cannot be undone.",
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

  // =======================================================
  // ======================== UI ============================
  // =======================================================
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative p-6 md:p-8 overflow-hidden"
    >
      {/* ===== SUBTLE HUD BACKGROUND ===== */}
      <div className="pointer-events-none absolute inset-0 -z-20">
        <div className="w-full h-full opacity-30 mix-blend-soft-light bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:45px_45px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.15),transparent_70%)]" />

        <motion.div
          className="absolute -top-24 -left-16 h-64 w-64 bg-emerald-400/20 blur-3xl"
          animate={{ x: [0, 15, 5, -10, 0], y: [0, 12, 18, 8, 0] }}
          transition={{ duration: 26, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-28 right-[-3rem] h-72 w-72 bg-cyan-400/18 blur-3xl"
          animate={{ x: [0, -20, -30, -10, 0], y: [0, -10, -18, -4, 0] }}
          transition={{ duration: 28, repeat: Infinity }}
        />
      </div>

      {/* ===== PAGE HEADER ===== */}
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-400 bg-clip-text text-transparent">
          Recommendation Rules
        </h1>

        <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Manage Ruled-Based Recommendation product relationships.
        </div>

        <div className="mt-3 h-[3px] w-32 bg-gradient-to-r from-emerald-400 via-cyan-400 to-transparent rounded-full" />
      </motion.div>

      {/* ===== MAIN HUD CARD ===== */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative rounded-[24px] border border-emerald-200/80 bg-gradient-to-br 
                   from-white/98 via-slate-50/95 to-emerald-50/60 shadow-[0_18px_55px_rgba(15,23,42,0.28)] 
                   backdrop-blur-xl p-6 overflow-hidden"
      >
        {/* HEADER: badge + add button */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold">
              Rule Engine
            </span>
            <span className="text-[0.7rem]">
              Define Ruled-Based product relationships
            </span>
          </div>

          <Button
            onClick={openCreateModal}
            className="rounded-full bg-gradient-to-r from-emerald-600 to-cyan-500 text-white font-semibold shadow-[0_10px_28px_rgba(45,212,191,0.45)] border border-emerald-300/70 hover:brightness-110"
          >
            + Add Rule
          </Button>
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full max-w-xs mb-5">
          <input
            type="text"
            placeholder="Search rule..."
            className="w-full border border-emerald-300 rounded-full px-4 py-2 pl-10 shadow-sm 
                       focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white/95"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-emerald-500" />
        </div>

        {/* =================== TABLE =================== */}
        <motion.div
          className="relative overflow-x-auto rounded-2xl border border-emerald-200/80 bg-white/98 shadow-[0_14px_40px_rgba(15,23,42,0.15)]"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <table className="min-w-[1400px] w-full text-sm text-slate-700">
            <thead>
              <tr className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-500 text-white text-xs uppercase tracking-wide">
                <th className="p-3 border-r border-emerald-300/40">
                  Main Product
                </th>
                <th className="p-3 border-r border-emerald-300/40">
                  Recommended Products
                </th>
                <th className="p-3 border-r border-emerald-300/40">
                  Effective Date
                </th>
                <th className="p-3 border-r border-emerald-300/40">
                  Expiry Date
                </th>
                <th className="p-3 border-r border-emerald-300/40 text-center">
                  Status
                </th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white/60">
              {paginated.length > 0 ? (
                paginated.map((rule) => (
                  <motion.tr
                    key={rule.id}
                    whileHover={{
                      scale: 1.006,
                      backgroundColor: "rgba(16,185,129,0.06)",
                    }}
                    className="border-b border-slate-200/60 transition"
                  >
                    <td className="p-3 font-semibold">{rule.productName}</td>
                    <td className="p-3">
                      {rule.recommendedNames.join(", ")}
                    </td>
                    <td className="p-3">
                      {rule.effectiveDate
                        ? format(
                            new Date(rule.effectiveDate),
                            "yyyy-MM-dd"
                          )
                        : "—"}
                    </td>
                    <td className="p-3">
                      {rule.expiryDate
                        ? format(
                            new Date(rule.expiryDate),
                            "yyyy-MM-dd"
                          )
                        : "—"}
                    </td>

                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          rule.active
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                            : "bg-red-100 text-red-700 border border-red-300"
                        }`}
                      >
                        {rule.active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* ACTION BUTTONS */}
                    <td className="p-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditModal(rule)}
                          className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-yellow-500 hover:bg-yellow-600 rounded-md shadow hover:shadow-lg transition"
                        >
                          <Pencil className="w-4 h-4" /> Update
                        </button>

                        <button
                          onClick={() => handleDelete(rule.id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded-md shadow hover:shadow-lg transition"
                        >
                          <XCircle className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center p-4 text-slate-500 select-none"
                  >
                    No rules found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-5 text-sm text-slate-600">
            <span>
              Showing{" "}
              <span className="font-semibold text-emerald-700">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-emerald-700">
                {Math.min(currentPage * pageSize, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-emerald-700">
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
      </motion.div>

      {/* ================================================== */}
      {/*                IMPROVED PREMIUM MODAL              */}
      {/* ================================================== */}
      <Modal show={showModal} size="md" popup onClose={closeModal}>
        <ModalHeader />

        <ModalBody>
          <h3
            className="text-xl font-extrabold text-transparent bg-clip-text 
                       bg-gradient-to-r from-emerald-500 via-emerald-600 to-cyan-500 
                       text-center mb-6"
          >
            {editTarget ? "Update Recommendation Rule" : "Create Recommendation Rule"}
          </h3>

          <div className="space-y-5">

            {/* MAIN PRODUCT */}
            <div className="space-y-1">
              <Label className="font-semibold text-slate-700 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-emerald-500" /> Main Product
              </Label>
              <div className="
                rounded-2xl border border-emerald-300/60 shadow-sm 
                bg-white/90 backdrop-blur-sm px-3 py-2
              ">
                <Select
                  value={form.baseProductId || ""}
                  onChange={(e) =>
                    setForm({ ...form, baseProductId: Number(e.target.value) })
                  }
                  className="focus:ring-emerald-500"
                >
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* RECOMMENDED PRODUCTS */}
            <div className="space-y-1">
              <Label className="font-semibold text-slate-700 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-cyan-500" /> Recommended Products
              </Label>
              <div className="
                rounded-2xl border border-cyan-300/60 shadow-sm 
                bg-white/90 backdrop-blur-sm px-3 py-2
              ">
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
                  className="focus:ring-cyan-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* DATE FIELDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* EFFECTIVE */}
              <div>
                <Label className="font-semibold text-slate-700">Effective Date</Label>
                <div className="
                  rounded-2xl border border-emerald-300/60 shadow-sm 
                  bg-white/90 backdrop-blur-sm px-3 py-2
                ">
                  <TextInput
                    type="date"
                    value={form.effectiveDate}
                    onChange={(e) =>
                      setForm({ ...form, effectiveDate: e.target.value })
                    }
                    className="focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* EXPIRY */}
              <div>
                <Label className="font-semibold text-slate-700">Expiry Date</Label>
                <div className="
                  rounded-2xl border border-red-300/60 shadow-sm 
                  bg-white/90 backdrop-blur-sm px-3 py-2
                ">
                  <TextInput
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) =>
                      setForm({ ...form, expiryDate: e.target.value })
                    }
                    className="focus:ring-red-500"
                  />
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-3 pt-4">

              <Button
                color="gray"
                onClick={closeModal}
                className="rounded-full px-5 py-2 shadow-md hover:shadow-lg 
                           transition border border-slate-300"
              >
                Cancel
              </Button>

              <Button
                onClick={handleSaveRule}
                className="
                  rounded-full px-5 py-2 font-semibold 
                  bg-gradient-to-r from-emerald-600 to-cyan-500 text-white
                  shadow-[0_8px_20px_rgba(0,200,180,0.45)] hover:brightness-110
                "
              >
                {editTarget ? "Update Rule" : "Add Rule"}
              </Button>
            </div>

          </div>
        </ModalBody>
      </Modal>
    </motion.div>
  );
}
