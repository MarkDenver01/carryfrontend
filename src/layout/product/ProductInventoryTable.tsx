import { useState, useMemo } from "react";
import { Button, Dropdown, DropdownItem, Pagination } from "flowbite-react";
import { Search, ChevronDown, Sparkles } from "lucide-react";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

import { useProductsContext } from "../../context/ProductsContext";
import ProductTable from "../product/ProductTable";
import ProductFormModal from "../../components/product/ProductFormModal";
import ProductRecommendationsModal from "../../components/product/ProductRecommendationsModal";

import { fetchAllRules } from "../../libs/ApiGatewayDatasource"; // ✅ adjust path if different
import type { Product } from "../../types/types";
import type { RecommendationRuleDTO } from "../../libs/models/product/RecommendedRule";

// strict sort fields
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

  // ✅ Modal state for viewing recommendations
  const [viewModal, setViewModal] = useState(false);
  const [recommendations, setRecommendations] = useState<
    RecommendationRuleDTO[]
  >([]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  /** 🔍 FILTER */
  const filtered = useMemo(() => {
    return products.filter(
      (p) =>
        (p.name + p.code).toLowerCase().includes(search.toLowerCase()) &&
        (status === "" || p.status === status)
    );
  }, [products, search, status]);

  /** ↕️ SORT */
  const [sortField, setSortField] = useState<ProductSortField>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const sortedProducts = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = String(a[sortField] ?? "").toLowerCase();
      const bVal = String(b[sortField] ?? "").toLowerCase();
      return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
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

  /** 📄 PAGINATION */
  const totalPages = Math.ceil(sortedProducts.length / pageSize);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  /** ✏️ EDIT PRODUCT */
  const handleEditProduct = (index: number) => {
    const product = sortedProducts[index];
    if (product) {
      setEditTarget(product);
      setShowModal(true);
    }
  };

  /** ❌ DELETE PRODUCT */
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

  /** 🔁 TOGGLE AVAILABILITY */
  const toggleAvailability = async (product: Product) => {
    if (!product?.id) return;
    const newStatus =
      product.status === "Available" ? "Not Available" : "Available";
    await updateProductStatusById(product.id, newStatus);
  };

  /** 👁️ VIEW RECOMMENDATIONS — fetch dynamically like ProductPriceTable */
  const handleViewRecommendations = async (productId: number | undefined) => {
    if (!productId) return;

    try {
      const allRules = await fetchAllRules();
      const productRules = allRules.filter(
        (rule) => rule.productId === productId
      );

      if (productRules.length === 0) {
        Swal.fire("Info", "No recommendations found for this product.", "info");
        return;
      }

      setRecommendations(productRules);
      setViewModal(true);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      Swal.fire("Error", "Failed to load recommendations.", "error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative p-6 md:p-8 overflow-hidden"
    >
      {/* ===== HUD BACKGROUND (GRID + BLOBS + SCANLINES) ===== */}
      <div className="pointer-events-none absolute inset-0 -z-20">
        {/* Grid */}
        <div className="w-full h-full opacity-40 mix-blend-soft-light bg-[linear-gradient(to_right,rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Scanlines */}
        <div className="absolute inset-0 opacity-[0.06] bg-[repeating-linear-gradient(to_bottom,rgba(15,23,42,0.9)_0px,rgba(15,23,42,0.9)_1px,transparent_1px,transparent_3px)]" />

        {/* Ambient blobs */}
        <motion.div
          className="absolute -top-20 -left-16 h-64 w-64 bg-emerald-500/26 blur-3xl"
          animate={{
            x: [0, 20, 10, -5, 0],
            y: [0, 10, 20, 5, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 right-0 h-72 w-72 bg-sky-400/24 blur-3xl"
          animate={{
            x: [0, -20, -35, -10, 0],
            y: [0, -10, -22, -5, 0],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* ===== HEADER ===== */}
      <div className="mb-6">
        <motion.h2
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-600 bg-clip-text text-transparent"
        >
          Product Inventory Monitoring
        </motion.h2>

        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Track product status, stock levels, and recommendations.</span>
        </div>

        <div className="mt-3 h-[3px] w-32 bg-gradient-to-r from-emerald-400 via-emerald-500 to-transparent rounded-full" />
      </div>

      {/* ===== MAIN HUD CONTAINER ===== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative rounded-[24px] border border-emerald-500/35 bg-white/95 shadow-[0_18px_55px_rgba(15,23,42,0.4)] backdrop-blur-xl p-5 md:p-6 overflow-hidden"
      >
        {/* HUD corner brackets */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-3 left-3 h-5 w-5 border-t-2 border-l-2 border-emerald-300/80" />
          <div className="absolute top-3 right-3 h-5 w-5 border-t-2 border-r-2 border-emerald-300/80" />
          <div className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-emerald-300/80" />
          <div className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-emerald-300/80" />
        </div>

        {/* Inner halo */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_60%)]" />

        <div className="relative flex flex-col gap-5">
          {/* HEADER ROW (Add Product) */}
          <div className="flex justify-between items-center mb-2">
            <div className="text-xs text-gray-500">
              <span className="px-2 py-0.5 rounded-full border border-emerald-300/70 bg-emerald-50 text-emerald-700 font-semibold">
                Live Inventory
              </span>
            </div>
            <Button
              onClick={() => {
                setEditTarget(null);
                setShowModal(true);
              }}
              className="rounded-full bg-gradient-to-r from-emerald-600 to-green-700 text-white font-semibold shadow-md hover:shadow-lg"
            >
              + Add Product
            </Button>
          </div>

          {/* FILTERS */}
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="Search name or code..."
                className="w-full border border-emerald-300 rounded-full px-4 py-2 pl-10 shadow-sm 
                        focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 text-sm"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
            </div>

            <Dropdown
              dismissOnClick
              label=""
              renderTrigger={() => (
                <button
                  className="flex items-center gap-2 border border-emerald-500 bg-emerald-50 
                          text-emerald-900 font-semibold text-xs md:text-sm px-4 py-1.5 rounded-full shadow-sm 
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

          {/* PRODUCT TABLE – HOLOGRAM WRAPPER AROUND CHILD COMPONENT */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative w-full overflow-x-auto pb-3 rounded-2xl border border-emerald-300/40 
                       bg-white/90 shadow-[0_15px_45px_rgba(15,23,42,0.35)] backdrop-blur-xl"
          >
            {/* Scanline overlay */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.07] 
                            bg-[repeating-linear-gradient(to_bottom,rgba(15,23,42,0.9)_0px,rgba(15,23,42,0.9)_1px,transparent_1px,transparent_3px)]" />

            {/* Hologram sweep */}
            <motion.div
              className="pointer-events-none absolute inset-0 opacity-0 
                         bg-[linear-gradient(120deg,transparent,rgba(52,211,153,0.4),transparent)]"
              animate={{
                opacity: [0, 0.45, 0],
                translateX: ["-200%", "200%"],
              }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative">
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
                onViewRecommendations={(product) =>
                  handleViewRecommendations(product.id!)
                } // ✅ same logic
              />
            </div>
          </motion.div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-4 text-sm text-gray-600">
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
                  className="shadow-sm"
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* MODALS */}
      <ProductFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        product={editTarget}
      />

      <ProductRecommendationsModal
        show={viewModal}
        onClose={() => setViewModal(false)}
        recommendations={recommendations}
      />
    </motion.div>
  );
}
