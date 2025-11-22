import { useState, useMemo } from "react";
import { Button, Pagination } from "flowbite-react";
import Swal from "sweetalert2";
import { Search, PlusCircle, Layers, Pencil, XCircle } from "lucide-react";
import { motion } from "framer-motion";

import ProductCategoryFormModal from "../../../components/product/ProductCategoryFormModal";
import { useCategoryContext } from "../../../context/CategoryContext";

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
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative p-6 md:p-8 lg:p-10 min-h-[calc(100vh-6rem)] overflow-hidden"
    >
      {/* ☑ Background HUD */}
      <div className="pointer-events-none absolute inset-0 -z-20 opacity-50 bg-[linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] bg-[size:42px_42px]"></div>

      {/* Animated Glow */}
      <motion.div
        className="absolute -top-32 -left-10 w-80 h-80 bg-emerald-400/25 blur-3xl -z-10"
        animate={{
          x: [0, 18, -10, 6, 0],
          y: [0, -12, 14, -6, 0],
          borderRadius: ["50%", "65%", "45%", "70%", "50%"],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* MAIN CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="relative bg-white/95 backdrop-blur-xl shadow-[0_0_60px_rgba(16,185,129,0.25)] border border-emerald-500/30 rounded-2xl p-6 md:p-8"
      >
        {/* Decorative Corners */}
        <div className="pointer-events-none absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-emerald-400/70"></div>
        <div className="pointer-events-none absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-emerald-400/70"></div>
        <div className="pointer-events-none absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-emerald-400/70"></div>
        <div className="pointer-events-none absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-emerald-400/70"></div>

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Layers className="w-9 h-9 text-emerald-600" />
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Product Categories
            </h2>
          </div>

          <button
            onClick={() => {
              setEditTarget(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg transition"
          >
            <PlusCircle className="w-5 h-5" /> Add Category
          </button>
        </div>

        {/* SEARCH */}
        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-4 top-2.5 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search category..."
            className="w-full border border-gray-300 rounded-xl px-4 pl-12 py-2.5 bg-gray-50 shadow-sm focus:ring-2 focus:ring-emerald-500 text-sm"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-xl border border-gray-300 shadow-md">
          <table className="min-w-[1000px] w-full text-sm text-gray-700">
            <thead className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white sticky top-0 z-20">
              <tr>
                <th
                  className="p-3 cursor-pointer select-none border-r border-white/20"
                  onClick={() => handleSort("categoryName")}
                >
                  Name <span className="opacity-70">{getSortIcon("categoryName")}</span>
                </th>

                <th
                  className="p-3 cursor-pointer select-none border-r border-white/20"
                  onClick={() => handleSort("categoryDescription")}
                >
                  Description{" "}
                  <span className="opacity-70">{getSortIcon("categoryDescription")}</span>
                </th>

                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginated.length > 0 ? (
                paginated.map((cat) => (
                  <tr
                    key={cat.categoryId}
                    className="border-b hover:bg-emerald-50/60 transition"
                  >
                    <td className="p-3 font-semibold">{cat.categoryName}</td>
                    <td className="p-3 text-gray-600">
                      {cat.categoryDescription || "—"}
                    </td>

                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          className="flex items-center gap-1 px-3 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded-md shadow"
                          onClick={() => {
                            setEditTarget(cat);
                            setShowModal(true);
                          }}
                        >
                          <Pencil className="w-4 h-4" /> Edit
                        </button>

                        <button
                          className="flex items-center gap-1 px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md shadow"
                          onClick={() => handleDelete(cat.categoryId)}
                        >
                          <XCircle className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-500">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 text-sm text-gray-600">
            <span>
              Showing{" "}
              <span className="font-semibold">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold">
                {Math.min(currentPage * pageSize, sorted.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold">{sorted.length}</span>
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
