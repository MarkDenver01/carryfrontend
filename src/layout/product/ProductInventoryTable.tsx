  import { useState, useMemo } from "react";
  import { Button, Dropdown, DropdownItem, Pagination } from "flowbite-react";
  import { Search, ChevronDown } from "lucide-react";

  import type { Product, ProductRecommended } from "../../types/types";

  import ProductTable from "../product/ProductTable";
  import ProductFormModal from "../../components/product/ProductFormModal";
  import ProductRecommendationsModal from "../../components/product/ProductRecommendationsModal";
  import Swal from "sweetalert2";
  import { useProductsContext } from "../../context/ProductsContext";


  // STRICT SORT KEYS
  type ProductSortField =
    | "name"
    | "code"
    | "categoryName" 
    | "description"
    | "size"
    | "stock"
    | "expiryDate"
    | "inDate"
    | "status";

  export default function ProductInventoryTable() {
    const { products, removeProduct, updateProductStatusById } =
      useProductsContext();

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<"" | Product["status"]>("");
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState<Product | null>(null);

    const [showRecs, setShowRecs] = useState(false);
    const [recommendations, setRecommendations] = useState<
      ProductRecommended[]
    >([]);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;

    // FILTER
    const filtered = useMemo(() => {
      return products.filter(
        (p) =>
          (p.name + p.code).toLowerCase().includes(search.toLowerCase()) &&
          (status === "" || p.status === status)
      );
    }, [products, search, status]);

    // SORT
    const [sortField, setSortField] = useState<ProductSortField>("name");
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

    const toggleAvailability = async (product: Product) => {
      if (!product?.id) return;

      const newStatus =
        product.status === "Available" ? "Not Available" : "Available";

      await updateProductStatusById(product.id, newStatus);
  };


    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Product Inventory Monitoring
          </h2>

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
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Search name or code..."
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

          <Dropdown
            dismissOnClick={true}
            label=""
            renderTrigger={() => (
              <button
                className="flex items-center gap-2 border border-emerald-500 bg-emerald-100 
                          text-emerald-900 font-semibold text-sm px-4 py-1 rounded-full shadow 
                          hover:shadow-md transition"
              >
                {`Filter: ${status === "" ? "All Status" : status}`}
                <ChevronDown className="w-4 h-4 text-emerald-900" />
              </button>
            )}
          >
            <DropdownItem onClick={() => setStatus("")}>All Status</DropdownItem>
            <DropdownItem onClick={() => setStatus("Available")}>
              Available
            </DropdownItem>
            <DropdownItem onClick={() => setStatus("Not Available")}>
              Not Available
            </DropdownItem>
          </Dropdown>
        </div>

        {/* TABLE WITH SCROLL LEFT-RIGHT */}
        <div className="w-full overflow-x-auto pb-2">
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
                {Math.min(currentPage * pageSize, sortedProducts.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-800">
                {sortedProducts.length}
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
