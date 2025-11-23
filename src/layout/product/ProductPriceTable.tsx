import { useState, useMemo } from "react";
import { Pagination } from "flowbite-react";
import { Pencil, XCircle, Search, Eye } from "lucide-react";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

import ProductPriceFormModal from "../../components/product/ProductPriceFormModal";
import ViewRecommendedModal from "../../components/product/ViewRecommendedModal";
import { usePricesContext } from "../../context/PricesContext";
import type { ProductPrice } from "../../types/pricingTypes";

export default function ProductPriceTable() {
  const { prices, removePrice } = usePricesContext();

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<ProductPrice | null>(null);

  const [viewModal, setViewModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  /** FILTER */
  const filtered = useMemo(() => {
    return prices.filter((p) =>
      p.productName.toLowerCase().includes(search.toLowerCase())
    );
  }, [prices, search]);

  /** PAGINATION */
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  /** ADD PRICE */
  const handleAdd = () => {
    setEditTarget(null);
    setShowModal(true);
  };

  /** EDIT */
  const handleEdit = (price: ProductPrice) => {
    setEditTarget(price);
    setShowModal(true);
  };

  /** DELETE */
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
      Swal.fire("Deleted!", "Price removed successfully.", "success");
    }
  };

  /** VIEW RECS */
  const handleViewRecommendations = (productId: number) => {
    setSelectedProductId(productId);
    setViewModal(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="p-6 md:p-8"
    >
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Product Pricing Management
        </h2>
        <p className="text-sm text-gray-500">
          Manage prices, view stock levels, and update pricing information.
        </p>
      </div>

      {/* TOP BAR */}
      <div className="flex items-center justify-between mb-4">
        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search product..."
            className="w-60 border border-gray-300 rounded-lg px-10 py-2 text-sm 
                       focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <button
          onClick={handleAdd}
          className="
            px-4 py-2 text-sm rounded-lg 
            bg-emerald-600 text-white font-medium 
            hover:bg-emerald-700 transition
          "
        >
          + Set Product Price
        </button>
      </div>

      {/* TABLE */}
      <div
        className="
          w-full overflow-x-auto rounded-xl border bg-white 
          shadow-sm
        "
      >
        <table className="min-w-[1300px] text-sm text-left text-gray-700">
          <thead className="bg-gray-100 border-b text-gray-700 text-xs uppercase">
            <tr>
              <th className="p-3">Image</th>
              <th className="p-3">Product</th>
              <th className="p-3">Description</th>
              <th className="p-3">Category</th>
              <th className="p-3">Size</th>
              <th className="p-3">Price (₱)</th>
              <th className="p-3">Stocks</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.length > 0 ? (
              paginated.map((p) => (
                <tr
                  key={p.priceId}
                  className="
                    border-b 
                    hover:bg-gray-50 transition
                  "
                >
                  <td className="p-3">
                    <img
                      src={p.productImgUrl}
                      alt={p.productName}
                      className="w-12 h-12 rounded-lg object-cover border"
                    />
                  </td>

                  <td className="p-3 font-semibold text-gray-800">
                    {p.productName}
                  </td>

                  <td className="p-3 text-gray-600">{p.productDescription}</td>

                  <td className="p-3">
                    <span className="px-2 py-1 text-[11px] rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {p.categoryName}
                    </span>
                  </td>

                  <td className="p-3 text-gray-700">{p.productSize}</td>

                  <td className="p-3 font-semibold text-emerald-700">
                    ₱{p.basePrice.toFixed(2)}
                  </td>

                  <td className="p-3">
                    <span
                      className={`
                        px-2 py-1 text-[11px] rounded-full border font-medium
                        ${
                          p.stocks <= 2
                            ? "bg-red-100 text-red-700 border-red-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }
                      `}
                    >
                      {p.stocks}
                    </span>
                  </td>

                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-1.5 flex-wrap">

                      {/* UPDATE */}
                      <button
                        onClick={() => handleEdit(p)}
                        className="
                          px-2.5 py-1 text-[11px] rounded-md
                          bg-blue-500 text-white hover:bg-blue-600
                          flex items-center gap-1 shadow-sm transition
                        "
                      >
                        <Pencil className="w-3.5 h-3.5" /> Update
                      </button>

                      {/* DELETE */}
                      <button
                        onClick={() => handleDelete(p.priceId)}
                        className="
                          px-2.5 py-1 text-[11px] rounded-md
                          bg-red-600 text-white hover:bg-red-700
                          flex items-center gap-1 shadow-sm transition
                        "
                      >
                        <XCircle className="w-3.5 h-3.5" /> Delete
                      </button>

                      {/* VIEW */}
                      <button
                        onClick={() =>
                          handleViewRecommendations(p.productId)
                        }
                        className="
                          px-2.5 py-1 text-[11px] rounded-md
                          bg-gray-700 text-white hover:bg-gray-800
                          flex items-center gap-1 shadow-sm transition
                        "
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="text-center text-gray-500 py-5 text-sm"
                >
                  No pricing records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 text-xs text-gray-600">
          <span>
            Showing{" "}
            <span className="font-semibold text-gray-800">
              {(currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-800">
              {Math.min(currentPage * pageSize, filtered.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-800">
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
