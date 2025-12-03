import { useState, useMemo } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { Button, Dropdown, DropdownItem, Pagination } from "flowbite-react";
import { Search, ChevronDown, Tag, Package, Layers, Clock, Hash, X, CheckCircle2 } from "lucide-react";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

import { useProductsContext } from "../../context/ProductsContext";
import ProductTable from "../product/ProductTable";
import ProductFormModal from "../../components/product/ProductFormModal";
import ProductRecommendationsModal from "../../components/product/ProductRecommendationsModal";

import { fetchAllRules } from "../../libs/ApiGatewayDatasource";
import type { Product } from "../../types/types";
import type { RecommendationRuleDTO } from "../../libs/models/product/RecommendedRule";
import dayjs from "dayjs";

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
   *   CURSOR SPOTLIGHT
   ============================ */
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  /** ============================
   *   PRODUCT DETAIL SLIDE PANEL (NEW)
   ============================ */
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const openDetail = (product: Product) => {
    setSelectedProduct(product);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedProduct(null);
  };

  /** ============================
   *   JSX OUTPUT
   ============================ */
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative p-6 md:p-8 flex flex-col gap-8 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* ---------- BACKGROUND GRIDS ---------- */}
      <div className="pointer-events-none absolute inset-0 -z-30">
        <div className="w-full h-full opacity-40 mix-blend-soft-light bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* ---------- CURSOR SPOTLIGHT ---------- */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background: `radial-gradient(520px at ${cursorPos.x}px ${cursorPos.y}px, rgba(34,197,94,0.25), transparent 70%)`,
        }}
      />

      {/* ---------- HEADER ---------- */}
      <div className="relative flex flex-col gap-3">
        <motion.h1
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-emerald-500 to-sky-500 bg-clip-text text-transparent"
        >
          Product Inventory Monitoring
        </motion.h1>

        <p className="text-gray-500 text-sm max-w-xl">
          Live view of{" "}
          <span className="font-medium text-emerald-700">
            all store and online products
          </span>
          . Click any product to view full details.
        </p>

        <div className="mt-3 h-[3px] w-32 bg-gradient-to-r from-emerald-400 via-emerald-500 to-transparent rounded-full" />
      </div>

      {/* ---------- MAIN CONTENT ---------- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative rounded-[24px] border border-emerald-200/80 bg-gradient-to-br from-white/96 via-slate-50/98 to-emerald-50/60 shadow-[0_18px_55px_rgba(15,23,42,0.28)] backdrop-blur-xl p-5 md:p-6 overflow-hidden"
      >
        <div className="relative flex gap-5">
          {/* ---------- SIDEBAR ---------- */}
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
                    w-full flex items-center justify-between px-4 py-2 rounded-xl text-sm border
                    ${
                      selectedCategory === cat
                        ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-300/30"
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
                    {cat === "All" ? products.length : categoryCount[cat] ?? 0}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* ---------- RIGHT SECTION ---------- */}
          <div className="flex-1 flex flex-col gap-5">
            {/* FILTERS */}
            <div className="rounded-xl bg-white/70 border border-emerald-200/50 shadow-sm px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative w-full md:max-w-xs">
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

              <div className="flex items-center gap-3">
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
              </div>

              <div className="md:ml-auto">
                <Button
                  onClick={() => {
                    setEditTarget(null);
                    setShowModal(true);
                  }}
                  className="w-full md:w-auto rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-400 text-white font-semibold shadow-[0_10px_28px_rgba(45,212,191,0.55)] hover:brightness-110 border border-emerald-300/80"
                >
                  + Add Product
                </Button>
              </div>
            </div>

            {/* ---------- PRODUCT TABLE ---------- */}
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
                onSelectProduct={openDetail}   
              />
            </motion.div>

            {/* ---------- PAGINATION ---------- */}
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

      {/* 🌟🌟🌟 RIGHT-SIDE PRODUCT DETAIL SLIDE PANEL 🌟🌟🌟 */}
      {detailOpen && selectedProduct && (
        <div className="fixed inset-0 z-[80] flex justify-end bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="h-full w-full max-w-md bg-white shadow-2xl border-l border-emerald-100 flex flex-col"
          >
            {/* HEADER */}
            <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-500/10 via-white to-cyan-500/10 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Product Details
                </p>
                <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                  {selectedProduct.name}
                </p>
              </div>
              <button
                onClick={closeDetail}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* IMAGE */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-emerald-300/60 via-cyan-300/50 to-transparent opacity-70 blur-[3px]" />
                  <img
                    src={selectedProduct.imageUrl || "/placeholder.png"}
                    className="relative w-40 h-40 rounded-2xl object-cover border border-emerald-100 shadow-lg"
                  />
                </div>
              </div>

              {/* NAME & DESCRIPTION */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <p className="text-[13px] text-slate-600">
                    <span className="font-semibold text-slate-900">
                      {selectedProduct.name}
                    </span>
                  </p>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {selectedProduct.productDescription || (
                    <span className="italic text-slate-400">No description</span>
                  )}
                </p>
              </div>

              {/* GRID INFORMATION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* CATEGORY */}
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2.5 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Category</span>
                  </div>
                  <span className="text-[11px] text-slate-800 mt-0.5">
                    {selectedProduct.categoryName || "Uncategorized"}
                  </span>
                </div>

                {/* STOCK */}
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 px-3 py-2.5 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <Package className="w-3.5 h-3.5" />
                    <span>Stocks</span>
                  </div>
                  <span className="text-[11px] text-slate-800 mt-0.5">
                    {selectedProduct.stock}
                  </span>
                </div>

                {/* EXPIRY */}
                <div className="rounded-xl border border-emerald-100 bg-cyan-50/60 px-3 py-2.5 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Expiry</span>
                  </div>
                  <span className="text-[11px] text-slate-800 mt-0.5">
                    {selectedProduct.expiryDate
                      ? dayjs(selectedProduct.expiryDate).format("MMM DD, YYYY")
                      : "—"}
                  </span>
                </div>

                {/* STATUS */}
                <div className="rounded-xl border border-emerald-100 bg-slate-50 px-3 py-2.5 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Status</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] mt-0.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        selectedProduct.status === "Available"
                          ? "bg-emerald-500"
                          : "bg-slate-500"
                      }`}
                    />
                    <span className="text-slate-800">
                      {selectedProduct.status}
                    </span>
                  </span>
                </div>

                {/* CODE */}
                <div className="rounded-xl border border-emerald-100 bg-white px-3 py-2.5 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <Hash className="w-3.5 h-3.5" />
                    <span>Code</span>
                  </div>
                  <span className="text-[11px] text-slate-800 mt-0.5 break-all">
                    {selectedProduct.code || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-end">
              <button
                onClick={closeDetail}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-full hover:bg-slate-100 transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ---------- EXISTING MODALS ---------- */}
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
