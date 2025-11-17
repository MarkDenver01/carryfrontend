import { useState, useMemo } from "react";
import { Button, Pagination } from "flowbite-react";
import Swal from "sweetalert2";
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
      const valA = (a[sortBy] || "").toLowerCase();
      const valB = (b[sortBy] || "").toLowerCase();
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });
  }, [filtered, sortBy, sortOrder]);

  /** PAGINATE */
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  /** DELETE */
  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Delete Category?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    });

    if (!confirm.isConfirmed) return;

    try {
      await removeCategory(id);
      Swal.fire("Deleted!", "Category deleted.", "success");
    } catch (err: any) {
      Swal.fire("Error", err.message || "Failed to delete category", "error");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md overflow-x-auto">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
        <h1 className="text-xl font-semibold text-gray-700">
          Product Categories
        </h1>

        <Button
          color="blue"
          onClick={() => {
            setEditTarget(null);
            setShowModal(true);
          }}
        >
          + Add Category
        </Button>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search category..."
        className="w-full sm:w-64 px-3 py-2 mb-4 text-sm border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
      />

      {/* TABLE */}
      <table className="min-w-full border border-gray-300 text-sm text-left text-gray-700">
        <thead className="bg-emerald-600 text-white">
          <tr>
            <th
              className="p-3 border border-gray-300 font-medium cursor-pointer select-none"
              onClick={() => handleSort("categoryName")}
            >
              Category Name{" "}
              <span className="text-xs">{getSortIcon("categoryName")}</span>
            </th>

            <th
              className="p-3 border border-gray-300 font-medium cursor-pointer select-none"
              onClick={() => handleSort("categoryDescription")}
            >
              Description{" "}
              <span className="text-xs">{getSortIcon("categoryDescription")}</span>
            </th>

            <th className="p-3 border border-gray-300 font-medium text-center">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="bg-gray-50">
          {paginated.length > 0 ? (
            paginated.map((category) => (
              <tr
                key={category.categoryId}
                className="hover:bg-emerald-100 transition"
              >
                {/* NAME + BADGE */}
                <td className="p-3 border border-gray-300 font-medium">
                  <div className="flex items-center gap-2">
                    {category.categoryName}
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-300">
                      Category
                    </span>
                  </div>
                </td>

                <td className="p-3 border border-gray-300">
                  {category.categoryDescription || "—"}
                </td>

                <td className="p-3 border border-gray-300 text-center">
                  <div className="flex items-center justify-center gap-2">

                    {/* UPDATE */}
                    <button
                      className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-yellow-500 hover:bg-yellow-600 rounded-md"
                      onClick={() => {
                        setEditTarget(category);
                        setShowModal(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" /> Update
                    </button>

                    {/* DELETE */}
                    <button
                      className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded-md"
                      onClick={() => handleDelete(category.categoryId)}
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

      {/* PAGINATION SUMMARY + FLOWBITE PAGINATION */}
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

      {showModal && (
        <ProductCategoryFormModal
          show={showModal}
          onClose={() => setShowModal(false)}
          editTarget={editTarget}
        />
      )}
    </div>
  );
}
