import { useState, useMemo } from "react";
import { Button, Pagination } from "flowbite-react";
import Swal from "sweetalert2";
import {
  Search,
  MoreVertical,
  Pencil,
  XCircle,
  Tag
} from "lucide-react";

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

  const [highlight, setHighlight] = useState<number | null>(null);

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
      confirmButtonText: "Delete"
    });

    if (result.isConfirmed) {
      await removeCategory(id);
      setHighlight(id);

      Swal.fire("Deleted!", "Category removed successfully.", "success");

      setTimeout(() => setHighlight(null), 1200);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-xl border border-gray-200">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 tracking-wide flex items-center gap-2">
          Product Categories
        </h2>

        <Button
          onClick={() => {
            setEditTarget(null);
            setShowModal(true);
          }}
          className="!bg-emerald-600 hover:!bg-emerald-700 text-white font-semibold px-5 py-2 rounded-full shadow-md"
        >
          + Add Category
        </Button>
      </div>

      {/* SEARCH INPUT */}
      <div className="relative w-full max-w-sm mb-6">
        <input
          type="text"
          placeholder="Search category..."
          className="w-full border border-gray-300 rounded-full px-4 py-2 pl-11 shadow 
                     bg-white/70 backdrop-blur-md text-sm focus:ring-2 focus:ring-emerald-500"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
        <Search className="absolute left-3 top-2.5 text-gray-600 w-5 h-5" />
      </div>

      {/* EMPTY STATE */}
      {paginated.length === 0 && search && (
        <div className="py-16 text-center flex flex-col items-center gap-3 text-gray-600">
          <Tag className="w-12 h-12 text-emerald-600" />
          <p className="text-lg font-semibold">No categories found</p>
          <p className="text-sm text-gray-500 w-72">
            Try adjusting your search or create a new product category.
          </p>

          <Button
            className="mt-2 !bg-emerald-600 hover:!bg-emerald-700 text-white rounded-full"
            onClick={() => {
              setEditTarget(null);
              setShowModal(true);
            }}
          >
            + Add Category
          </Button>
        </div>
      )}

      {/* TABLE */}
      {paginated.length > 0 && (
        <div className="w-full overflow-x-auto pb-2">
          <table className="min-w-[1000px] w-full border border-gray-300 text-sm text-left text-gray-700 rounded-lg overflow-hidden">

            <thead className="bg-emerald-600 text-white sticky top-0 shadow">
              <tr>
                <th
                  className="p-3 font-medium cursor-pointer border border-gray-300"
                  onClick={() => handleSort("categoryName")}
                >
                  Category Name <span className="text-xs">{getSortIcon("categoryName")}</span>
                </th>

                <th
                  className="p-3 font-medium cursor-pointer border border-gray-300"
                  onClick={() => handleSort("categoryDescription")}
                >
                  Description <span className="text-xs">{getSortIcon("categoryDescription")}</span>
                </th>

                <th className="p-3 font-medium text-center border border-gray-300">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((cat) => (
                <tr
                  key={cat.categoryId}
                  className={`transition-all duration-500 ${
                    highlight === cat.categoryId ? "bg-red-100" : "hover:bg-emerald-50"
                  }`}
                >
                  <td className="p-3 border border-gray-300">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{cat.categoryName}</span>

                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                        Category
                      </span>
                    </div>
                  </td>

                  <td className="p-3 border border-gray-300 text-gray-600">
                    {cat.categoryDescription || "—"}
                  </td>

                  <td className="p-3 border border-gray-300 text-center">
                    <div className="relative flex justify-center">
                      <div className="group">
                        <button className="p-1.5 rounded-md hover:bg-gray-200 transition">
                          <MoreVertical className="w-5 h-5 text-gray-700" />
                        </button>

                        {/* DROPDOWN */}
                        <div className="hidden group-hover:flex flex-col absolute right-0 bg-white border rounded-md shadow-md z-20 w-32">
                          <button
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
                            onClick={() => {
                              setEditTarget(cat);
                              setShowModal(true);
                            }}
                          >
                            <Pencil size={16} className="text-yellow-600" />
                            Edit
                          </button>

                          <button
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
                            onClick={() => handleDelete(cat.categoryId)}
                          >
                            <XCircle size={16} className="text-red-600" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
          <span>
            Showing{" "}
            <strong>{(currentPage - 1) * pageSize + 1}</strong> to{" "}
            <strong>{Math.min(currentPage * pageSize, sorted.length)}</strong> of{" "}
            <strong>{sorted.length}</strong> entries
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
      <ProductCategoryFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        editTarget={editTarget}
      />
    </div>
  );
}
