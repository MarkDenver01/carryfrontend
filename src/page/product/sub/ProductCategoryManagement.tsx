import { useState, useMemo } from "react";
import { TextInput, Button } from "flowbite-react";
import Swal from "sweetalert2";
import { Pencil, XCircle, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import ProductCategoryFormModal from "../../../components/product/ProductCategoryFormModal";
import { useCategoryContext } from "../../../context/CategoryContext";

export default function ProductCategoryManagement() {
  const { categories, removeCategory } = useCategoryContext();

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Sorting state
  type SortField = "categoryName" | "categoryDescription" | null;
  type SortOrder = "asc" | "desc" | null;

  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  /** SORTING LOGIC */
  const sortedCategories = useMemo(() => {
    let sorted = [...categories];

    if (sortField && sortOrder) {
      sorted.sort((a, b) => {
        const valA = (a[sortField] || "").toLowerCase();
        const valB = (b[sortField] || "").toLowerCase();

        if (sortOrder === "asc") return valA.localeCompare(valB);
        if (sortOrder === "desc") return valB.localeCompare(valA);
        return 0;
      });
    }

    return sorted;
  }, [categories, sortField, sortOrder]);

  /** SEARCH FILTER + SORT */
  const filteredCategories = useMemo(() => {
    return sortedCategories.filter((c) =>
      c.categoryName.toLowerCase().includes(search.toLowerCase())
    );
  }, [sortedCategories, search]);

  /** PAGINATION */
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /** SORT HANDLER */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle: asc → desc → none
      if (sortOrder === "asc") setSortOrder("desc");
      else if (sortOrder === "desc") {
        setSortField(null);
        setSortOrder(null);
      } else setSortOrder("asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

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
      Swal.fire("Deleted!", "Category removed successfully.", "success");
    } catch (err: any) {
      Swal.fire("Error", err.message || "Failed to delete category", "error");
    }
  };

  /** SORT ICON */
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 inline opacity-50" />;
    if (sortOrder === "asc") return <ArrowUp className="w-4 h-4 inline" />;
    if (sortOrder === "desc") return <ArrowDown className="w-4 h-4 inline" />;
    return <ArrowUpDown className="w-4 h-4 inline opacity-50" />;
  };

  return (
    <div className="p-4">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Product Categories</h1>

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

      {/* SEARCH BAR */}
      <div className="mb-3 w-full md:w-1/3">
        <TextInput
          placeholder="Search category..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm text-left text-gray-700">
          <thead className="bg-emerald-600 text-gray-100">
            <tr>
              <th
                className="p-3 border border-gray-300 font-medium cursor-pointer select-none"
                onClick={() => handleSort("categoryName")}
              >
                Category Name <SortIcon field="categoryName" />
              </th>

              <th
                className="p-3 border border-gray-300 font-medium cursor-pointer select-none"
                onClick={() => handleSort("categoryDescription")}
              >
                Description <SortIcon field="categoryDescription" />
              </th>

              <th className="p-3 border border-gray-300 font-medium text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {paginatedCategories.length > 0 ? (
              paginatedCategories.map((cat) => (
                <tr key={cat.categoryId} className="hover:bg-gray-100">

                  {/* CATEGORY NAME + BADGE */}
                  <td className="p-3 border border-gray-300 align-middle font-medium flex items-center gap-2">
                    <span>{cat.categoryName}</span>

                    {/* BADGE */}
                    <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300">
                      Category
                    </span>
                  </td>

                  <td className="p-3 border border-gray-300 align-middle">
                    {cat.categoryDescription || "—"}
                  </td>

                  <td className="p-3 border border-gray-300 align-middle">
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
                  className="text-center py-4 text-gray-500 border border-gray-300"
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
        <div className="flex justify-between items-center mt-4 px-2">

          <button
            className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md disabled:opacity-40"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          <span className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md disabled:opacity-40"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MODAL */}
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
