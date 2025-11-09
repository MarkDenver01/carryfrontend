import { useState, useMemo } from "react";
import { Button, TextInput, Select } from "flowbite-react";
import type { Product, ProductRecommended } from "../../types/types";
import ProductTable from "../product/ProductTable";
import ProductFormModal from "../product/ProductFormModal";
import ProductRecommendationsModal from "../product/ProductRecommendationsModal";
import Swal from "sweetalert2";
import { useProductsContext } from "../../context/ProductsContext";

export default function ProductInventoryTable() {
  const {
    products,
    removeProduct,
    updateProductStatusById,
  } = useProductsContext();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | Product["status"]>("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [showRecs, setShowRecs] = useState(false);
  const [recommendations, setRecommendations] = useState<ProductRecommended[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filtered = useMemo(() => {
    return products.filter(
      (p) =>
        (p.name + p.code).toLowerCase().includes(search.toLowerCase()) &&
        (status === "" || p.status === status)
    );
  }, [products, search, status]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const handleEdit = (index: number) => {
    const product = filtered[index];
    if (product) {
      setEditTarget(product);
      setShowModal(true);
    }
  };

  const handleAdd = () => {
    setEditTarget(null);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete Product?",
      text: "Are you sure you want to delete this product?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      await removeProduct(id);
      Swal.fire("Deleted!", "Product has been removed.", "success");
    }
  };

  const toggleAvailability = async (index: number) => {
    const product = filtered[index];
    if (!product || !product.id) return;
    const newStatus = product.status === "Available" ? "Not Available" : "Available";
    await updateProductStatusById(product.id, newStatus);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Product Inventory Monitoring</h2>
        <Button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition"
        >
          + Add Product
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <TextInput
          placeholder="Search by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={status} onChange={(e) => setStatus(e.target.value as Product["status"])}>
          <option value="">All Status</option>
          <option value="Available">Available</option>
          <option value="Not Available">Not Available</option>
        </Select>
      </div>

      <ProductTable
        paginatedProducts={paginatedProducts}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        openEditModal={handleEdit}
        toggleAvailability={toggleAvailability}
        handleDeleteProduct={handleDelete}
        setSelectedRecommendations={setRecommendations}
        setIsViewModalOpen={setShowRecs}
      />

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <Button
            size="xs"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Prev
          </Button>
          <span className="text-sm flex items-center">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            size="xs"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <ProductFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        product={editTarget}
      />

      <ProductRecommendationsModal
        show={showRecs}
        onClose={() => setShowRecs(false)}
        recommendations={recommendations}
      />
    </div>
  );
}
