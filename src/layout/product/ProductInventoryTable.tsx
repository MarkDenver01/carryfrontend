import { useState, useMemo } from "react";
import { Button, Dropdown, DropdownItem, Pagination } from "flowbite-react";
import { Search, ChevronDown } from "lucide-react";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

import { useProductsContext } from "../../context/ProductsContext";
import ProductTable from "../product/ProductTable";
import ProductFormModal from "../../components/product/ProductFormModal";
import ProductRecommendationsModal from "../../components/product/ProductRecommendationsModal";

import { fetchAllRules } from "../../libs/ApiGatewayDatasource";
import type { Product } from "../../types/types";
import type { RecommendationRuleDTO } from "../../libs/models/product/RecommendedRule";

// strict sort fields
type ProductSortField =
  | "name"
  | "code"
  | "categoryName"
  | "productDescription"
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

  const [viewModal, setViewModal] = useState(false);
  const [recommendations, setRecommendations] = useState<
    RecommendationRuleDTO[]
  >([]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  /** ============================
   *   CATEGORY SIDEBAR
   ============================ */
  const [selectedCategory, setSelectedCategory] = useState("All");

  /** Category extraction + count */
  const categoryCount: Record<string, number> = {};
  products.forEach((p) => {
    if (p.categoryName) {
      categoryCount[p.categoryName] = (categoryCount[p.categoryName] || 0) + 1;
    }
  });

  const categories = useMemo(() => {
    const list = Array.from(
      new Set(
        products
          .map((p) => p.categoryName)
          .filter((c): c is string => Boolean(c))
      )
    );
    return ["All", ...list];
  }, [products]);

  /** ============================
   *   FILTERING
   ============================ */
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = (p.name + p.code)
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchStatus = status === "" || p.status === status;

      const matchCategory =
        selectedCategory === "All" || p.categoryName === selectedCategory;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [products, search, status, selectedCategory]);

  /** ============================
   *   SORTING
   ============================ */
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

  /** ============================
   *   PAGINATION
   ============================ */
  const totalPages = Math.ceil(sortedProducts.length / pageSize);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  /** ============================
   *   EDIT PRODUCT
   ============================ */
  const handleEditProduct = (index: number) => {
    const product = sortedProducts[index];
    if (product) {
      setEditTarget(product);
      setShowModal(true);
    }
  };

  /** ============================
   *   DELETE PRODUCT
   ============================ */
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

  /** ============================
   *   TOGGLE AVAILABILITY
   ============================ */
  const toggleAvailability = async (product: Product) => {
    if (!product?.id) return;
    const newStatus =
      product.status === "Available" ? "Not Available" : "Available";
    await updateProductStatusById(product.id, newStatus);
  };

  /** ============================
   *   RECOMMENDATIONS
   ============================ */
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

  /** ============================
   *   JSX OUTPUT
   ============================ */
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative p-6 md:p-8 overflow-hidden"
    >
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 -z-20">
        <div className="w-full h-full opacity-30 mix-blend-soft-light bg-[linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] bg-[size:42px_42px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_65%)]" />

        <motion.div
          className="absolute -top-24 -left-20 h-64 w-64 bg-emerald-400/20 blur-3xl"
          animate={{
            x: [0, 18, 8, -8, 0],
            y: [0, 10, 20, 6, 0],
          }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute -bottom-24 right-[-3rem] h-72 w-72 bg-cyan-400/18 blur-3xl"
          animate={{
            x: [0, -20, -30, -10, 0],
            y: [0, -8, -18, -4, 0],
          }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* HEADER */}
      <div className="mb-7 relative">
        <motion.h2
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 bg-clip-text text-transparent"
        >
          Product Inventory Monitoring
        </motion.h2>
      </div>

      {/* MAIN CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative rounded-[24px] border border-emerald-200/80 bg-gradient-to-br from-white/96 via-slate-50/98 to-emerald-50/60 shadow-[0_18px_55px_rgba(15,23,42,0.28)] backdrop-blur-xl p-5 md:p-6 overflow-hidden"
      >
        <div className="relative flex gap-5">
          {/* =============================================
              CATEGORY SIDEBAR (UPGRADED)
              ============================================= */}
          <div className="w-60 shrink-0 rounded-2xl border border-emerald-200 bg-white/80 shadow-sm p-4 h-fit max-h-[680px] overflow-y-auto sticky top-4">
            <h3 className="text-sm font-semibold text-emerald-700 mb-3">
              Categories
            </h3>

            <div className="space-y-2">
              {categories.map((cat) => (
                <motion.button
                  key={cat}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={`
                    w-full flex items-center justify-between gap-2 px-4 py-2 rounded-xl text-sm border transition-all
                    ${
                      selectedCategory === cat
                        ? "bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-300/30 border-emerald-500"
                        : "bg-white hover:bg-emerald-50 text-gray-700 border-emerald-200"
                    }
                  `}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      selectedCategory === cat
                        ? "bg-white/20 text-white"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {cat === "All"
                      ? products.length
                      : categoryCount[cat] ?? 0}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* =============================================
              RIGHT CONTENT
              ============================================= */}
          <div className="flex-1 flex flex-col gap-5">
            {/* FILTER TOOLBAR */}
            <div className="rounded-xl bg-white/70 border border-emerald-200/50 shadow-sm px-4 py-3 flex items-center gap-3">
              <div className="relative w-full max-w-xs">
                <input
                  type="text"
                  placeholder="Search by name or code..."
                  className="w-full border border-emerald-200 rounded-full px-4 py-2 pl-10 shadow-sm 
                        focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm text-slate-800 placeholder:text-slate-400"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <Search className="absolute left-3 top-2.5 text-emerald-500 w-5 h-5" />
              </div>

              <Dropdown
                dismissOnClick
                label=""
                renderTrigger={() => (
                  <button
                    className="flex items-center gap-2 border border-emerald-300 bg-emerald-50 
                          text-emerald-900 font-semibold text-xs md:text-sm px-4 py-1.5 rounded-full shadow-sm 
                          hover:shadow-md transition"
                  >
                    <span className="text-[0.7rem] uppercase tracking-[0.16em] text-emerald-700/90">
                      Status
                    </span>
                    <span className="text-xs md:text-sm">
                      {status === "" ? "All" : status}
                    </span>
                    <ChevronDown className="w-4 h-4 text-emerald-900" />
                  </button>
                )}
              >
                <DropdownItem onClick={() => setStatus("")}>
                  All Status
                </DropdownItem>
                <DropdownItem onClick={() => setStatus("Available")}>
                  Available
                </DropdownItem>
                <DropdownItem onClick={() => setStatus("Not Available")}>
                  Not Available
                </DropdownItem>
              </Dropdown>

              <Button
                onClick={() => {
                  setEditTarget(null);
                  setShowModal(true);
                }}
                className="ml-auto rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-400 text-white font-semibold shadow-[0_10px_28px_rgba(45,212,191,0.55)] hover:brightness-110 border border-emerald-300/80"
              >
                + Add Product
              </Button>
            </div>

            {/* TABLE */}
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="relative w-full overflow-x-auto pb-3 rounded-2xl border border-emerald-200/80 
                       bg-white/98 shadow-[0_14px_40px_rgba(15,23,42,0.18)]"
            >
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
                }
              />
            </motion.div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-4 text-xs md:text-sm text-slate-600">
                <span>
                  Showing{" "}
                  <span className="font-semibold text-emerald-700">
                    {(currentPage - 1) * pageSize + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-emerald-700">
                    {Math.min(currentPage * pageSize, sortedProducts.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-emerald-700">
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
