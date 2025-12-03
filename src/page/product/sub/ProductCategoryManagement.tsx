import { useState, useMemo } from "react";
import { Pagination } from "flowbite-react";
import Swal from "sweetalert2";
import { Search, Sparkles, LayoutGrid, Rows, Info } from "lucide-react";
import { motion } from "framer-motion";

import ProductCategoryFormModal from "../../../components/product/ProductCategoryFormModal";
import { useCategoryContext } from "../../../context/CategoryContext";
import { useProductsContext } from "../../../context/ProductsContext";
import { Pencil, XCircle } from "lucide-react";

type SortField = "categoryName" | "categoryDescription";
type SortOrder = "asc" | "desc";

export default function ProductCategoryManagement() {
  const { categories, removeCategory } = useCategoryContext();
  const { products } = useProductsContext(); // ✅ For product counts only (frontend UI)

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("categoryName");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);

  const [viewMode, setViewMode] = useState<"table" | "grid">("table"); // ✅ New: List / Grid toggle

  // 🔍 Right-side detail panel state
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCategoryDetail, setSelectedCategoryDetail] = useState<any | null>(null);

  const pageSize = 8;

  /* ============================
     SORT HANDLERS
  ============================ */
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

  /* ============================
     PRODUCT COUNT PER CATEGORY
  ============================ */
  const productCountByCategoryName = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      if (p.categoryName) {
        map[p.categoryName] = (map[p.categoryName] || 0) + 1;
      }
    });
    return map;
  }, [products]);

  const getProductsForCategory = (categoryName: string) =>
    products.filter((p) => p.categoryName === categoryName);

  /* ============================
     FILTER + SORT + PAGINATION
  ============================ */
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

  /* ============================
     DELETE HANDLER
  ============================ */
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

  /* ============================
     DETAIL PANEL HANDLERS
  ============================ */
  const openDetail = (category: any) => {
    setSelectedCategoryDetail(category);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedCategoryDetail(null);
  };

  /* ============================
     JSX OUTPUT
  ============================ */
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
          Organize your store structure by category. Click any category to view
          full details.
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
        {/* TOP BAR: Add + Search + View Toggle */}
        <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
          {/* Left: Add button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            onClick={() => {
              setEditTarget(null);
              setShowModal(true);
            }}
            className="px-5 py-2 rounded-full bg-gradient-to-r 
              from-emerald-600 via-emerald-500 to-cyan-400 text-white 
              font-semibold shadow-lg hover:brightness-110 
              border border-emerald-300/80 w-full md:w-auto text-sm"
          >
            + Add Category
          </motion.button>

          {/* Middle: Search */}
          <div className="relative w-full md:max-w-sm">
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

          {/* Right: View mode toggle */}
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
              View
            </span>
            <div className="inline-flex items-center rounded-full border border-emerald-200 bg-white/80 shadow-sm overflow-hidden">
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 text-xs flex items-center gap-1 ${
                  viewMode === "table"
                    ? "bg-emerald-500 text-white"
                    : "text-slate-600 hover:bg-emerald-50"
                }`}
              >
                <Rows className="w-4 h-4" />
                <span>List</span>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 text-xs flex items-center gap-1 ${
                  viewMode === "grid"
                    ? "bg-emerald-500 text-white"
                    : "text-slate-600 hover:bg-emerald-50"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Grid</span>
              </button>
            </div>
          </div>
        </div>

        {/* ===== TABLE / GRID WRAPPER ===== */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative w-full overflow-x-auto rounded-2xl 
            border border-emerald-200/60 bg-white/95 backdrop-blur-xl
            shadow-[0_14px_45px_rgba(15,23,42,0.15)] p-1.5"
        >
          {viewMode === "table" ? (
            /* =====================
               LIST / TABLE VIEW
            ===================== */
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

                  <th className="p-4 text-left font-semibold tracking-wide">
                    Products
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
                      className="transition-all border-l-[4px] border-transparent hover:border-emerald-500 cursor-pointer"
                      onClick={() => openDetail(cat)}
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

                      <td className="p-4 text-gray-700">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-full 
                            bg-indigo-50 text-indigo-700 border border-indigo-200"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          {productCountByCategoryName[cat.categoryName] || 0}{" "}
                          products
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            className="flex items-center gap-1 px-3 py-1.5 text-xs text-white 
                              bg-gradient-to-r from-yellow-500 to-yellow-600 
                              hover:brightness-110 rounded-md shadow-md"
                            onClick={(e) => {
                              e.stopPropagation();
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(cat.categoryId);
                            }}
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
                      colSpan={4}
                      className="p-4 text-center text-gray-500 border border-gray-300/40"
                    >
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            /* =====================
               GRID VIEW
            ===================== */
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginated.length > 0 ? (
                paginated.map((cat) => {
                  const count =
                    productCountByCategoryName[cat.categoryName] || 0;
                  return (
                    <motion.div
                      key={cat.categoryId}
                      whileHover={{
                        y: -3,
                        boxShadow: "0 18px 40px rgba(15,23,42,0.20)",
                      }}
                      className="relative rounded-2xl border border-emerald-100/80 bg-white/95 p-4 cursor-pointer 
                        transition-all flex flex-col gap-3"
                      onClick={() => openDetail(cat)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="inline-flex items-center gap-2 mb-1">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Category
                            </span>
                            <span className="text-[11px] text-slate-400 uppercase tracking-[0.12em]">
                              {count} product{count === 1 ? "" : "s"}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">
                            {cat.categoryName}
                          </h3>
                        </div>

                        <div className="flex flex-col gap-1">
                          <button
                            className="p-1.5 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditTarget(cat);
                              setShowModal(true);
                            }}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="p-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 hover:bg-red-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(cat.categoryId);
                            }}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-3">
                        {cat.categoryDescription || (
                          <span className="italic text-slate-400">
                            No description added yet.
                          </span>
                        )}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Info className="w-3.5 h-3.5 text-emerald-500" />
                          Click to view details
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-full py-6 text-center text-sm text-slate-500">
                  No categories found.
                </div>
              )}
            </div>
          )}
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

      {/* ===== DETAIL SLIDE PANEL ===== */}
      {detailOpen && selectedCategoryDetail && (
        <div className="fixed inset-0 z-[80] flex justify-end bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="h-full w-full max-w-md bg-white shadow-2xl border-l border-emerald-100 flex flex-col"
          >
            {/* HEADER */}
            <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-500/10 via-white to-cyan-500/10 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Category Details
                </p>
                <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                  {selectedCategoryDetail.categoryName}
                </p>
              </div>
              <button
                onClick={closeDetail}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* DESCRIPTION */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em]">
                  Description
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedCategoryDetail.categoryDescription || (
                    <span className="italic text-slate-400">
                      No description provided for this category.
                    </span>
                  )}
                </p>
              </div>

              {/* SUMMARY CARDS */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Total products */}
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2.5 flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-emerald-800">
                    Total Products
                  </span>
                  <span className="text-base font-bold text-emerald-700">
                    {productCountByCategoryName[
                      selectedCategoryDetail.categoryName
                    ] || 0}
                  </span>
                </div>

                {/* Category label */}
                <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 px-3 py-2.5 flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-cyan-800">
                    Category Label
                  </span>
                  <span className="text-xs text-slate-800">
                    {selectedCategoryDetail.categoryName}
                  </span>
                </div>
              </div>

              {/* PRODUCTS MINI LIST */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em]">
                  Sample Products
                </p>

                {getProductsForCategory(selectedCategoryDetail.categoryName)
                  .slice(0, 5)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2"
                    >
                      <img
                        src={p.imageUrl || "/placeholder.png"}
                        alt={p.name}
                        className="w-8 h-8 rounded-md object-cover border border-slate-200"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                          {p.name}
                        </span>
                        <span className="text-[11px] text-slate-500 line-clamp-1">
                          {p.productDescription || "No description"}
                        </span>
                      </div>
                    </div>
                  ))}

                {getProductsForCategory(selectedCategoryDetail.categoryName)
                  .length === 0 && (
                  <p className="text-[11px] text-slate-400 italic">
                    No products are currently assigned to this category.
                  </p>
                )}
              </div>
            </div>

            {/* FOOTER */}
            <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between">
              <button
                onClick={closeDetail}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-full hover:bg-slate-100 transition"
              >
                Close
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditTarget(selectedCategoryDetail);
                    setShowModal(true);
                  }}
                  className="text-xs font-medium px-3 py-1.5 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 transition"
                >
                  Edit Category
                </button>
                <button
                  onClick={() =>
                    handleDelete(selectedCategoryDetail.categoryId)
                  }
                  className="text-xs font-medium px-3 py-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ===== MODAL ===== */}
      <ProductCategoryFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        editTarget={editTarget}
      />
    </motion.div>
  );
}
