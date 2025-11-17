import { useState, useMemo } from "react";
import { Button, TextInput, Select } from "flowbite-react";
import type { Product, ProductRecommended } from "../../types/types";

import ProductTable from "../product/ProductTable";
import ProductFormModal from "../product/ProductFormModal";
import ProductRecommendationsModal from "../product/ProductRecommendationsModal";
import Swal from "sweetalert2";
import { useProductsContext } from "../../context/ProductsContext";

// STRICT SORT KEYS (no more TS error)
type ProductSortField =
  | "name"
  | "code"
  | "description"
  | "size"
  | "stock"
  | "expiryDate"
  | "inDate"
  | "status";

export default function ProductInventoryTable() {
  const { products, removeProduct, updateProductStatusById } =
    useProductsContext();

  // UI State
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | Product["status"]>("");

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);

  const [showRecs, setShowRecs] = useState(false);
  const [recommendations, setRecommendations] = useState<
    ProductRecommended[]
  >([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // FILTERING
  const filtered = useMemo(() => {
    return products.filter(
      (p) =>
        (p.name + p.code).toLowerCase().includes(search.toLowerCase()) &&
        (status === "" || p.status === status)
    );
  }, [products, search, status]);

  // SORTING
  const [sortField, setSortField] =
    useState<ProductSortField>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const sortedProducts = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = String(a[sortField] ?? "").toLowerCase();
      const bVal = String(b[sortField] ?? "").toLowerCase();

      return sortOrder === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  }, [filtered, sortField, sortOrder]);

  const handleSort = (field: ProductSortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: ProductSortField) => {
    if (field !== sortField) return "⇅";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  // PAGINATION
  const totalPages = Math.ceil(sortedProducts.length / pageSize);

  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ACTIONS
  const handleEditProduct = (index: number) => {
    const product = sortedProducts[index];
    if (product) {
      setEditTarget(product);
      setShowModal(true);
    }
  };

  const handleDeleteProduct = async (id: number) => {
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
    const product = sortedProducts[index];
    if (!product?.id) return;

    const newStatus =
      product.status === "Available" ? "Not Available" : "Available";

    await updateProductStatusById(product.id, newStatus);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Product Inventory Monitoring</h2>

        <Button
          onClick={() => {
            setEditTarget(null);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          + Add Product
        </Button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3 mb-4">
        <TextInput
          placeholder="Search name or code..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

        <Select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as Product["status"])
          }
        >
          <option value="">All Status</option>
          <option value="Available">Available</option>
          <option value="Not Available">Not Available</option>
        </Select>
      </div>

      {/* TABLE */}
      <ProductTable
        sortedProducts={sortedProducts}
        paginatedProducts={paginatedProducts}
        currentPage={currentPage}
        pageSize={pageSize}
        handleSort={handleSort}
        getSortIcon={getSortIcon}
        handleEditProduct={handleEditProduct}
        toggleAvailability={toggleAvailability}
        handleDeleteProduct={handleDeleteProduct}
        setSelectedRecommendations={setRecommendations}
        setIsViewModalOpen={setShowRecs}
      />

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <Button
            size="xs"
            onClick={() =>
              setCurrentPage((p) => Math.max(1, p - 1))
            }
            disabled={currentPage === 1}
          >
            Prev
          </Button>

          <span className="text-sm flex items-center">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            size="xs"
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages, p + 1))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* MODALS */}
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
