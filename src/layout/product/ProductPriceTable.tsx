import { useState, useMemo } from "react";
import { Button, Pagination } from "flowbite-react";
import { Pencil, XCircle, Search, Eye, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

import ProductPriceFormModal from "../../components/product/ProductPriceFormModal";
import ViewRecommendedModal from "../../components/product/ViewRecommendedModal";
import { usePricesContext } from "../../context/PricesContext";
import type { ProductPrice } from "../../types/pricingTypes";

export default function ProductPriceTable() {
  const { prices, removePrice } = usePricesContext();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<ProductPrice | null>(null);

  const [viewModal, setViewModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  /* ============================================
     CATEGORY LIST + COUNT
  ============================================ */
  const categories = useMemo(() => {
    const set = new Set(prices.map((p) => p.categoryName).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [prices]);

  const categoryCount: Record<string, number> = {};
  prices.forEach((p) => {
    categoryCount[p.categoryName] = (categoryCount[p.categoryName] || 0) + 1;
  });

  /* ============================================
     FILTERING
  ============================================ */
  const filtered = useMemo(() => {
    return prices.filter((p) => {
      const matchSearch = p.productName
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchCategory =
        selectedCategory === "All" || p.categoryName === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [prices, search, selectedCategory]);

  /* ============================================
     PAGINATION
  ============================================ */
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  /* ============================================
     ACTION HANDLERS
  ============================================ */
  const handleAdd = () => {
    setEditTarget(null);
    setShowModal(true);
  };

  const handleEdit = (price: ProductPrice) => {
    setEditTarget(price);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete Price?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    });

    if (result.isConfirmed) {
      await removePrice(id);
      Swal.fire("Deleted!", "Price record removed.", "success");
    }
  };

  const handleViewRecommendations = (productId: number) => {
    setSelectedProductId(productId);
    setViewModal(true);
  };

  /* ============================================
     JSX OUTPUT
  ============================================ */
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative p-6 md:p-8 overflow-hidden"
    >
      {/* HEADER */}
      <div className="mb-7 relative">
        <motion.h2
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 bg-clip-text text-transparent"
        >
          Product Pricing Management
        </motion.h2>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.8rem] text-slate-500">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
            Pricing Overview
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Categorized product rates
          </span>
        </div>

        <div className="mt-3 h-[3px] w-32 bg-gradient-to-r from-emerald-400 via-emerald-500 to-transparent rounded-full" />
      </div>

      {/* ✨ MAIN WRAPPER (Sidebar + Table) */}
      <div className="relative rounded-[24px] border border-emerald-200/80 bg-gradient-to-br from-white/96 via-slate-50/98 to-emerald-50/60 shadow-[0_18px_55px_rgba(15,23,42,0.22)] backdrop-blur-xl p-5 md:p-6 overflow-hidden flex gap-5">
        
        {/* =====================
            CATEGORY SIDEBAR
        ===================== */}
        <div className="w-60 shrink-0 rounded-2xl border border-emerald-200 bg-white/90 shadow-md p-4 h-fit max-h-[680px] overflow-y-auto sticky top-4">
          <h3 className="text-sm font-semibold text-emerald-700 mb-3">
            Categories
          </h3>

          <div className="space-y-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`
                  w-full flex items-center justify-between px-4 py-2 rounded-xl text-sm border transition
                  ${
                    selectedCategory === cat
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-lg"
                      : "bg-white hover:bg-emerald-50 text-gray-700 border-emerald-200"
                  }
                `}
              >
                <span className="truncate">{cat}</span>

                <span
                  className={`
                    text-[10px] px-2 py-0.5 rounded-full
                    ${
                      selectedCategory === cat
                        ? "bg-white/20 text-white"
                        : "bg-emerald-100 text-emerald-700"
                    }
                  `}
                >
                  {cat === "All" ? prices.length : categoryCount[cat] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* =====================
            RIGHT SIDE CONTENT
        ===================== */}
        <div className="flex-1 flex flex-col gap-5">
          
          {/* SEARCH + ADD BUTTON */}
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="Search product..."
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

            <Button
              className="rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-400 text-white font-semibold shadow-[0_10px_28px_rgba(45,212,191,0.55)] hover:brightness-110 border border-emerald-300/80"
              onClick={handleAdd}
            >
              + Set Product Price
            </Button>
          </div>

          {/* TABLE */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="relative w-full overflow-x-auto pb-3 rounded-2xl border border-emerald-200/80 
                       bg-white/98 shadow-[0_14px_40px_rgba(15,23,42,0.18)]"
          >
            <table className="min-w-[1400px] text-sm text-left text-gray-700">
              <thead className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 text-white shadow-[0_4px_15px_rgba(16,185,129,0.4)]">
                <tr>
                  <th className="p-3 border border-emerald-300/40 font-semibold">
                    Product Image
                  </th>
                  <th className="p-3 border border-emerald-300/40 font-semibold">
                    Product Name
                  </th>
                  <th className="p-3 border border-emerald-300/40 font-semibold">
                    Description
                  </th>
                  <th className="p-3 border border-emerald-300/40 font-semibold">
                    Category
                  </th>
                  <th className="p-3 border border-emerald-300/40 font-semibold">
                    Size
                  </th>
                  <th className="p-3 border border-emerald-300/40 font-semibold">
                    Price (₱)
                  </th>
                  <th className="p-3 border border-emerald-300/40 font-semibold">
                    Stocks
                  </th>
                  <th className="p-3 border border-emerald-300/40 font-semibold text-center">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white/90">
                {paginated.length > 0 ? (
                  paginated.map((p) => (
                    <tr
                      key={p.priceId}
                      className={`border-t border-gray-200/70 hover:bg-emerald-50 transition ${
                        p.stocks <= 2
                          ? "bg-red-50/70 hover:bg-red-100/80"
                          : ""
                      }`}
                    >
                      <td className="p-3 border border-gray-200/80">
                        <img
                          src={p.productImgUrl}
                          alt={p.productName}
                          className="w-12 h-12 object-cover rounded-md border border-gray-200 shadow-sm"
                        />
                      </td>

                      <td className="p-3 border border-gray-200/80 font-semibold text-slate-800">
                        {p.productName}
                      </td>

                      <td className="p-3 border border-gray-200/80 text-slate-600">
                        {p.productDescription}
                      </td>

                      <td className="p-3 border border-gray-200/80">
                        <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {p.categoryName}
                        </span>
                      </td>

                      <td className="p-3 border border-gray-200/80">
                        {p.productSize}
                      </td>

                      <td className="p-3 border border-gray-200/80 font-semibold text-emerald-700">
                        ₱{p.basePrice.toFixed(2)}
                      </td>

                      <td className="p-3 border border-gray-200/80 text-center">
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                            p.stocks <= 2
                              ? "bg-red-100 text-red-700 border-red-300"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {p.stocks}
                        </span>
                      </td>

                      <td className="p-3 border border-gray-200/80 text-center">
                        <div className="flex justify-center gap-2 flex-wrap">
                          <button
                            className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-yellow-500 hover:bg-yellow-600 rounded-md shadow-sm transition"
                            onClick={() => handleEdit(p)}
                          >
                            <Pencil className="w-4 h-4" /> Update
                          </button>

                          <button
                            className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm transition"
                            onClick={() => handleDelete(p.priceId)}
                          >
                            <XCircle className="w-4 h-4" /> Delete
                          </button>

                          <button
                            className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition"
                            onClick={() =>
                              handleViewRecommendations(p.productId)
                            }
                          >
                            <Eye className="w-4 h-4" /> View Recs
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center text-gray-500 py-4 border border-gray-200/80"
                    >
                      No product price entries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
                  {Math.min(currentPage * pageSize, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-emerald-700">
                  {filtered.length}
                </span>{" "}
                entries
              </span>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                showIcons
              />
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      <ProductPriceFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        price={editTarget}
      />

      <ViewRecommendedModal
        show={viewModal}
        onClose={() => setViewModal(false)}
        productId={selectedProductId}
      />
    </motion.div>
  );
}
