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
      {/* ===== HUD BACKGROUND ===== */}
      <div className="pointer-events-none absolute inset-0 -z-20">
        <div className="w-full h-full opacity-40 mix-blend-soft-light bg-[linear-gradient(to_right,rgba(148,163,184,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.15)_1px,transparent_1px)] bg-[size:38px_38px]" />

        <div className="absolute inset-0 opacity-[0.06] bg-[repeating-linear-gradient(to_bottom,rgba(15,23,42,0.85)_0px,rgba(15,23,42,0.85)_1px,transparent_1px,transparent_3px)]" />

        <motion.div
          className="absolute -top-20 -left-16 h-64 w-64 bg-emerald-500/25 blur-3xl"
          animate={{
            x: [0, 20, 10, -5, 0],
            y: [0, 10, 20, 5, 0],
          }}
          transition={{ duration: 18, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-24 right-0 h-72 w-72 bg-cyan-400/24 blur-3xl"
          animate={{
            x: [0, -20, -35, -10, 0],
            y: [0, -10, -20, -5, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
      </div>

      {/* ===== PAGE TITLE ===== */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-600 bg-clip-text text-transparent"
        >
          Product Categories
        </motion.h1>

        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
          <Sparkles className="w-4 h-4 text-emerald-400" /> Manage and organize
          your store’s category structure.
        </div>

        <div className="mt-3 h-[3px] w-28 bg-gradient-to-r from-emerald-400 via-emerald-500 to-transparent rounded-full" />
      </div>

      {/* ===== HUD CONTAINER ===== */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative rounded-[24px] border border-emerald-500/30 bg-white/95 shadow-[0_18px_55px_rgba(15,23,42,0.35)] backdrop-blur-xl p-6 overflow-hidden"
      >
        {/* Add Button */}
        <div className="flex justify-between items-center mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              setEditTarget(null);
              setShowModal(true);
            }}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-green-700 text-white font-semibold shadow-lg"
          >
            + Add Category
          </motion.button>
        </div>

        {/* ===== SEARCH BAR ===== */}
        <div className="relative w-full max-w-sm mb-6">
          <input
            type="text"
            placeholder="Search category…"
            className="w-full border border-gray-300 rounded-full px-4 py-2 pl-11 shadow-sm 
              focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
        </div>

        {/* ===== TABLE ===== */}
        <div className="w-full overflow-x-auto pb-2">
          <table className="min-w-[1000px] w-full border border-gray-300 text-sm text-left text-gray-700 rounded-xl overflow-hidden shadow-md">

            <thead className="bg-gradient-to-r from-emerald-600 to-green-700 text-white sticky top-0 z-20">
              <tr className="text-sm">
                <th
                  className="p-3 cursor-pointer border border-emerald-300/40 select-none"
                  onClick={() => handleSort("categoryName")}
                >
                  Category Name{" "}
                  <span className="text-xs opacity-80">
                    {getSortIcon("categoryName")}
                  </span>
                </th>

                <th
                  className="p-3 cursor-pointer border border-emerald-300/40 select-none"
                  onClick={() => handleSort("categoryDescription")}
                >
                  Description{" "}
                  <span className="text-xs opacity-80">
                    {getSortIcon("categoryDescription")}
                  </span>
                </th>

                <th className="p-3 text-center border border-emerald-300/40">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white">
              {paginated.length > 0 ? (
                paginated.map((cat) => (
                  <motion.tr
                    key={cat.categoryId}
                    whileHover={{ scale: 1.01 }}
                    className="hover:bg-emerald-50 transition"
                  >
                    <td className="p-3 border border-gray-300">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">
                          {cat.categoryName}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 border">
                          Category
                        </span>
                      </div>
                    </td>

                    <td className="p-3 border border-gray-300 text-gray-600">
                      {cat.categoryDescription || "—"}
                    </td>

                    <td className="p-3 border text-center">
                      <div className="flex justify-center gap-3">

                        {/* UPDATE */}
                        <button
                          className="flex items-center gap-1 px-3 py-1 text-xs text-white 
                             bg-yellow-500 hover:bg-yellow-600 rounded-md shadow"
                          onClick={() => {
                            setEditTarget(cat);
                            setShowModal(true);
                          }}
                        >
                          <Pencil className="w-4 h-4" /> Update
                        </button>

                        {/* DELETE */}
                        <button
                          className="flex items-center gap-1 px-3 py-1 text-xs text-white 
                             bg-red-600 hover:bg-red-700 rounded-md shadow"
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
                    className="p-4 text-center text-gray-500 border border-gray-300"
                  >
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ===== PAGINATION ===== */}
        {totalPages > 1 && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-6 text-sm text-gray-600">

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

      {/* MODAL */}
      <ProductCategoryFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        editTarget={editTarget}
      />
    </motion.div>
  );
}
