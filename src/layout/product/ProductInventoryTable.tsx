import { useState, useMemo } from "react";
import { Button, TextInput, Select } from "flowbite-react";
import { useProducts } from "../../types/useProducts";
import type { Product, ProductRecommended } from "../../types/types";
import ProductTable from "../product/ProductTable";
import ProductAddModal from "../product/ProductAddModal";
import ProductEditModal from "../product/ProductEditModal";
import ProductRecommendationsModal from "../product/ProductRecommendationsModal";
import Swal from "sweetalert2";

export default function ProductInventoryTable() {
  const { products, add, update, remove } = useProducts();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | Product["status"]>("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showRecs, setShowRecs] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [recommendations, setRecommendations] = useState<ProductRecommended[]>([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 🔍 Filtering logic
  const filtered = useMemo(() => {
    return products.filter(
      (p) =>
        (p.name + p.code).toLowerCase().includes(search.toLowerCase()) &&
        (status === "" || p.status === status)
    );
  }, [products, search, status]);

  // 🔢 Paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage]);

  // 🧭 Pagination controls
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // ✏️ Edit product
  const openEditModal = (index: number) => {
    const realProduct = filtered[index];
    if (realProduct) {
      setEditTarget(realProduct);
      setShowEdit(true);
    }
  };

  // 🗑️ Delete product
  const handleDeleteProduct = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete Product?",
      text: "Are you sure you want to delete this product?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      await remove(id);
      Swal.fire("Deleted!", "Product has been removed.", "success");
    }
  };

  // 🔁 Toggle availability
  const toggleAvailability = (index: number) => {
    const updated = [...filtered];
    const product = updated[index];
    if (!product) return;

    product.status = product.status === "Available" ? "Not Available" : "Available";
    update(product);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Product Inventory Monitoring</h2>
        <Button onClick={() => setShowAdd(true)}>+ Add Product</Button>
      </div>

      {/* 🔍 Search and Filter */}
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

      {/* 🧮 Table */}
      <ProductTable
        paginatedProducts={paginatedProducts}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        openEditModal={openEditModal}
        toggleAvailability={toggleAvailability}
        handleDeleteProduct={handleDeleteProduct}
        setSelectedRecommendations={setRecommendations}
        setIsViewModalOpen={setShowRecs}
      />

      {/* 📄 Pagination */}
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

      {/* Modals */}
      <ProductAddModal show={showAdd} onClose={() => setShowAdd(false)} onSubmit={add} />
      <ProductEditModal
        show={showEdit}
        product={editTarget}
        onClose={() => setShowEdit(false)}
        onSubmit={update}
      />
      <ProductRecommendationsModal
        show={showRecs}
        onClose={() => setShowRecs(false)}
        recommendations={recommendations}
      />
    </div>
  );
}
