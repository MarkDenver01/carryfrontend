import { useState, useMemo } from "react";
import { Pagination } from "flowbite-react";
import Swal from "sweetalert2";
import { Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import ProductCategoryFormModal from "../../../components/product/ProductCategoryFormModal";
import { useCategoryContext } from "../../../context/CategoryContext";
import { Pencil, XCircle } from "lucide-react";

type SortField = "categoryName" | "categoryDescription";
type SortOrder = "asc" | "desc";

export default function ProductCategoryManagement() {
  const { categories, removeCategory } = useCategoryContext();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("categoryName");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);

  const pageSize = 8;

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortBy !== field) return "⇅";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const filtered = useMemo(() => {
    return categories.filter((c) =>
      c.categoryName.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const A = (a[sortBy] || "").toLowerCase();
      const B = (b[sortBy] || "").toLowerCase();
      return sortOrder === "asc" ? A.localeCompare(B) : B.localeCompare(A);
    });
  }, [filtered, sortBy, sortOrder]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete Category?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    });

    if (result.isConfirmed) {
      await removeCategory(id);
      Swal.fire("Deleted!", "Category removed successfully.", "success");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative p-6 md:p-8 overflow-hidden"
    >
      {/* ===== BACKGROUND ===== */}
      <div className="pointer-events-none absolute inset-0 -z-20">
        <div
          className="w-full h-full opacity-30 mix-blend-soft-light 
          bg-[linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),
          linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)]
          bg-[size:42px_42px]"
        />

        <motion.div
          className="absolute -top-20 -left-16 h-64 w-64 bg-emerald-400/20 blur-3xl"
          animate={{ x: [0, 18, 8, -8, 0], y: [0, 10, 20, 6, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute -bottom-24 right-[-3rem] h-72 w-72 bg-cyan-400/20 blur-3xl"
          animate={{ x: [0, -20, -30, -10, 0], y: [0, -8, -18, -4, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* ===== HEADER ===== */}
      <div className="mb-8 relative">
        <motion.h1
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="text-3xl font-extrabold tracking-tight bg-gradient-to-r 
            from-emerald-500 via-emerald-400 to-cyan-400 bg-clip-text text-transparent"
        >
          Product Categories
        </motion.h1>

        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Manage and organize your store’s category structure.
        </div>

        <div
          className="mt-3 h-[3px] w-24 bg-gradient-to-r 
          from-emerald-400 via-emerald-500 to-transparent rounded-full"
        />
      </div>

      {/* ===== CONTENT CARD ===== */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative rounded-[24px] border border-emerald-200/80 
          bg-gradient-to-br from-white/96 via-slate-50/98 to-emerald-50/60 
          shadow-[0_18px_55px_rgba(15,23,42,0.28)] backdrop-blur-xl p-6 overflow-hidden"
      >
        {/* ADD BUTTON */}
        <div className="flex justify-between items-center mb-6">
          <motion.button
            whileHover={{ scale: 1.04 }}
            onClick={() => {
              setEditTarget(null);
              setShowModal(true);
            }}
            className="px-5 py-2 rounded-full bg-gradient-to-r 
              from-emerald-600 via-emerald-500 to-cyan-400 text-white 
              font-semibold shadow-lg hover:brightness-110 
              border border-emerald-300/80"
          >
            + Add Category
          </motion.button>
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full max-w-sm mb-6">
          <input
            type="text"
            placeholder="Search category…"
            className="w-full border border-emerald-200 rounded-full px-4 py-2 pl-11 
              shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 
              bg-white/95 text-sm text-slate-800 placeholder:text-slate-400"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Search className="absolute left-3 top-2.5 text-emerald-500 w-5 h-5" />
        </div>

        {/* ===== ENHANCED TABLE ===== */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative w-full overflow-x-auto rounded-2xl 
            border border-emerald-200/60 bg-white/95 backdrop-blur-xl
            shadow-[0_14px_45px_rgba(15,23,42,0.15)]"
        >
          <table className="min-w-[900px] w-full text-sm text-gray-700">
            <thead className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white shadow-lg">
              <tr className="divide-x divide-emerald-300/30">
                <th
                  className="p-4 font-semibold cursor-pointer tracking-wide text-left"
                  onClick={() => handleSort("categoryName")}
                >
                  <div className="flex items-center gap-2">
                    <span>Category Name</span>
                    <span className="text-xs opacity-90">
                      {getSortIcon("categoryName")}
                    </span>
                  </div>
                </th>

                <th
                  className="p-4 font-semibold cursor-pointer tracking-wide text-left"
                  onClick={() => handleSort("categoryDescription")}
                >
                  <div className="flex items-center gap-2">
                    <span>Description</span>
                    <span className="text-xs opacity-90">
                      {getSortIcon("categoryDescription")}
                    </span>
                  </div>
                </th>

                <th className="p-4 text-center font-semibold tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200/60">
              {paginated.length > 0 ? (
                paginated.map((cat) => (
                  <motion.tr
                    key={cat.categoryId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{
                      backgroundColor: "rgba(16,185,129,0.08)",
                      scale: 1.01,
                    }}
                    className="transition-all border-l-[4px] border-transparent hover:border-emerald-500"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {cat.categoryName}
                        </span>

                        <span
                          className="px-2 py-0.5 text-[10px] font-semibold rounded-full 
                          bg-emerald-100 text-emerald-700 border border-emerald-200/80"
                        >
                          CATEGORY
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-gray-700">
                      {cat.categoryDescription || "—"}
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          className="flex items-center gap-1 px-3 py-1.5 text-xs text-white 
                            bg-gradient-to-r from-yellow-500 to-yellow-600 
                            hover:brightness-110 rounded-md shadow-md"
                          onClick={() => {
                            setEditTarget(cat);
                            setShowModal(true);
                          }}
                        >
                          <Pencil className="w-4 h-4" /> Update
                        </button>

                        <button
                          className="flex items-center gap-1 px-3 py-1.5 text-xs text-white 
                            bg-gradient-to-r from-red-600 to-red-700 
                            hover:brightness-110 rounded-md shadow-md"
                          onClick={() => handleDelete(cat.categoryId)}
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
                    colSpan={3}
                    className="p-4 text-center text-gray-500 border border-gray-300/40"
                  >
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div
            className="flex flex-col gap-2 sm:flex-row sm:items-center 
            sm:justify-between mt-6 text-sm text-gray-600"
          >
            <span>
              Showing{" "}
              <span className="font-semibold text-gray-800">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-800">
                {Math.min(currentPage * pageSize, sorted.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-800">
                {sorted.length}
              </span>{" "}
              entries
            </span>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              showIcons
              className="shadow-sm"
            />
          </div>
        )}
      </motion.div>

      <ProductCategoryFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        editTarget={editTarget}
      />
    </motion.div>
  );
}
