import { useState, useMemo } from "react";
import { Button, TextInput } from "flowbite-react";
import Swal from "sweetalert2";
import { useCategoryContext } from "../../../context/CategoryContext";
import ProductCategoryFormModal from "../../../components/product/ProductCategoryFormModal";

export default function ProductCategoryManagement() {
  const { categories, removeCategory } = useCategoryContext();

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);

  const filteredCategories = useMemo(() => {
    return categories.filter((c) =>
      c.categoryName.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  const handleDelete = async (categoryId: number) => {
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
      await removeCategory(categoryId);
      Swal.fire("Deleted!", "Category has been removed.", "success");
    } catch (err: any) {
      Swal.fire("Error", err.message || "Failed to delete category", "error");
    }
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
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Category Name</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredCategories.map((cat) => (
              <tr key={cat.categoryId} className="border-t">
                <td className="px-4 py-2">{cat.categoryName}</td>
                <td className="px-4 py-2">{cat.categoryDescription}</td>
                <td className="px-4 py-2 text-center">
                  <div className="flex justify-center gap-3">
                    <Button
                      size="xs"
                      color="warning"
                      onClick={() => {
                        setEditTarget(cat);
                        setShowModal(true);
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      size="xs"
                      color="failure"
                      onClick={() => handleDelete(cat.categoryId)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredCategories.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-center text-gray-500" colSpan={3}>
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
