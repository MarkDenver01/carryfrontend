import { useState, useMemo } from "react";
import { Button, Pagination } from "flowbite-react";
import Swal from "sweetalert2";
import { Search } from "lucide-react";

import ProductCategoryFormModal from "../../../src/components/product/ProductCategoryFormModal";
import { useCategoryContext } from "../../../src/context/CategoryContext";
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

  /** SORT HANDLER */
  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  /** SORT ICON */
  const getSortIcon = (field: SortField) => {
    if (sortBy !== field) return "⇅";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  /** FILTER */
  const filtered = useMemo(() => {
    return categories.filter((c) =>
      c.categoryName.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  /** SORT */
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const A = (a[sortBy] || "").toLowerCase();
      const B = (b[sortBy] || "").toLowerCase();
      return sortOrder === "asc" ? A.localeCompare(B) : B.localeCompare(A);
    });
  }, [filtered, sortBy, sortOrder]);

  /** PAGINATION */
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  /** DELETE */
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
    <div className="p-6 bg-white rounded-lg shadow-md">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Product Categories
        </h2>

        <Button
          onClick={() => {
            setEditTarget(null);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          + Add Category
        </Button>
      </div>

      {/* SEARCH INPUT */}
      <div className="relative w-full max-w-xs mb-6">
        <input
          type="text"
          placeholder="Search category..."
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

      {/* TABLE WRAPPER (SCROLLABLE) */}
      <div className="w-full overflow-x-auto pb-2">
        <table className="min-w-[1000px] border border-gray-300 text-sm text-left text-gray-700">
          <thead className="bg-emerald-600 text-white">
            <tr>
              <th
                className="p-3 border border-gray-300 font-medium cursor-pointer select-none"
                onClick={() => handleSort("categoryName")}
              >
                Category Name{" "}
                <span className="text-xs opacity-80">
                  {getSortIcon("categoryName")}
                </span>
              </th>

              <th
                className="p-3 border border-gray-300 font-medium cursor-pointer select-none"
                onClick={() => handleSort("categoryDescription")}
              >
                Description{" "}
                <span className="text-xs opacity-80">
                  {getSortIcon("categoryDescription")}
                </span>
              </th>

              <th className="p-3 border border-gray-300 font-medium text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-gray-50">
            {paginated.length > 0 ? (
              paginated.map((cat) => (
                <tr key={cat.categoryId} className="hover:bg-emerald-100">

                  <td className="p-3 border border-gray-300 font-medium">
                    <div className="flex items-center gap-2">
                      {cat.categoryName}
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-300">
                        Category
                      </span>
                    </div>
                  </td>

                  <td className="p-3 border border-gray-300">
                    {cat.categoryDescription || "—"}
                  </td>

                  <td className="p-3 border border-gray-300 text-center">
                    <div className="flex items-center justify-center gap-2 whitespace-nowrap">

                      {/* UPDATE */}
                      <button
                        className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-yellow-500 hover:bg-yellow-600 rounded-md"
                        onClick={() => {
                          setEditTarget(cat);
                          setShowModal(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" /> Update
                      </button>

                      {/* DELETE */}
                      <button
                        className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded-md"
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
              {Math.min(currentPage * pageSize, sorted.length)}
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
      <ProductCategoryFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        editTarget={editTarget}
      />
    </div>
  );
}
