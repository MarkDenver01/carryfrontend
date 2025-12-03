import React from "react";
import { Pencil, Eye, XCircle, CheckCircle, } from "lucide-react";
import type { Product } from "../../types/types";
import dayjs from "dayjs";

interface ProductTableProps {
  sortedProducts: Product[];
  paginatedProducts: Product[];
  currentPage: number;
  pageSize: number;
  handleSort: (field: any) => void;
  getSortIcon: (field: any) => string;
  handleEditProduct: (index: number) => void;
  toggleAvailability: (product: Product) => void;
  handleDeleteProduct: (id: number) => void;
  onViewRecommendations: (product: Product) => void;
}

const LOW_STOCK_LIMIT = 1;

const ProductTable: React.FC<ProductTableProps> = ({
  paginatedProducts,
  currentPage,
  pageSize,
  handleSort,
  getSortIcon,
  handleEditProduct,
  toggleAvailability,
  handleDeleteProduct,
  onViewRecommendations,
}) => {
  return (
    <div className="space-y-6 p-3">

      {/* TABLE HEADER */}
      <div
        className="
          grid grid-cols-12 text-xs font-semibold text-gray-600 
          px-3 py-3 border-b border-gray-300
          bg-gradient-to-r from-gray-50 to-gray-100
          sticky top-0 z-20
        "
      >
        <div className="col-span-3 flex items-center gap-1">
          Product
        </div>

        <div
          className="col-span-1 cursor-pointer hover:text-emerald-600 transition"
          onClick={() => handleSort("code")}
        >
          Code {getSortIcon("code")}
        </div>

        <div
          className="col-span-2 cursor-pointer hover:text-emerald-600 transition"
          onClick={() => handleSort("name")}
        >
          Name {getSortIcon("name")}
        </div>

        <div
          className="col-span-2 cursor-pointer hover:text-emerald-600 transition"
          onClick={() => handleSort("categoryName")}
        >
          Category {getSortIcon("categoryName")}
        </div>

        <div className="col-span-1">Stock</div>
        <div className="col-span-1">Expiry</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-2 text-center">Actions</div>
      </div>

      {/* TABLE BODY */}
      {paginatedProducts.length > 0 ? (
        paginatedProducts.map((product, idx) => {
          const isOutOfStock = product.stock <= 0;
          const isLowStock = product.stock <= LOW_STOCK_LIMIT;
          const computedStatus =
            isOutOfStock || isLowStock ? "Not Available" : product.status;

          const expiryFormatted = product.expiryDate
            ? dayjs(product.expiryDate).format("MMM DD, YYYY")
            : "—";

          return (
            <div
              key={product.id ?? idx}
              className={`
                grid grid-cols-12 gap-4 p-4 border rounded-xl
                transition-all duration-200
                ${
                  idx % 2 === 0
                    ? "bg-white border-gray-200"
                    : "bg-gray-50 border-gray-300"
                }
                hover:shadow-lg hover:-translate-y-1
              `}
            >

              {/* IMAGE + DETAILS */}
              <div className="col-span-3 flex items-center gap-4">
                <img
                  src={product.imageUrl || "/placeholder.png"}
                  className="
                    w-16 h-16 rounded-lg object-cover border border-gray-300 
                    transition-transform hover:scale-110
                  "
                />
                <div className="flex flex-col">
                  <p
                    className="font-semibold text-gray-900 text-sm"
                    title={product.name}
                  >
                    {product.name}
                  </p>
                  <p
                    className="text-xs text-gray-500 line-clamp-2"
                    title={product.productDescription}
                  >
                    {product.productDescription}
                  </p>
                </div>
              </div>

              {/* CODE */}
              <div
                className="col-span-1 flex items-center text-sm text-gray-700"
                title={product.code}
              >
                {product.code}
              </div>

              {/* NAME */}
              <div
                className="col-span-2 flex items-center text-sm font-medium text-gray-800"
                title={product.name}
              >
                {product.name}
              </div>

              {/* CATEGORY */}
              <div className="col-span-2 flex items-center">
                <span
                  className="
                    px-3 py-1 text-[11px] rounded-full 
                    bg-emerald-50 text-emerald-700 border border-emerald-200
                    shadow-sm
                  "
                  title={product.categoryName ?? "—"}
                >
                  {product.categoryName ?? "—"}
                </span>
              </div>

              {/* STOCK BADGE */}
              <div className="col-span-1 flex items-center">
                <span
                  className={`
                    px-3 py-1 text-[11px] rounded-md font-semibold shadow-sm
                    ${
                      isOutOfStock
                        ? "bg-red-100 text-red-700"
                        : isLowStock
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-emerald-100 text-emerald-700"
                    }
                  `}
                >
                  {product.stock}
                </span>
              </div>

              {/* EXPIRY DATE */}
              <div
                className="col-span-1 flex items-center text-sm text-gray-700"
                title={expiryFormatted}
              >
                {expiryFormatted}
              </div>

              {/* STATUS BADGE */}
              <div className="col-span-1 flex items-center">
                <span
                  className={`
                    px-3 py-1 text-[11px] rounded-full font-semibold border shadow-sm
                    ${
                      computedStatus === "Available"
                        ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                        : "bg-red-100 text-red-700 border-red-300"
                    }
                  `}
                >
                  {computedStatus}
                </span>
              </div>

              {/* ACTION BUTTONS */}
              <div className="col-span-2 flex items-center justify-center gap-2">

                {/* EDIT */}
                <button
                  title="Edit Product"
                  onClick={() =>
                    handleEditProduct((currentPage - 1) * pageSize + idx)
                  }
                  className="
                    p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 
                    shadow-sm transition flex items-center
                  "
                >
                  <Pencil className="w-4 h-4" />
                </button>

                {/* AVAILABILITY TOGGLE */}
                <button
                  title={isOutOfStock || isLowStock ? "Cannot enable (low stock)" : "Toggle Status"}
                  disabled={isOutOfStock || isLowStock}
                  onClick={() => {
                    if (isOutOfStock || isLowStock) {
                      alert("This product has low or zero stock and cannot be set to Available.");
                      return;
                    }
                    toggleAvailability(product);
                  }}
                  className={`
                    p-2 rounded-md shadow-sm transition flex items-center
                    ${
                      isOutOfStock || isLowStock
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : computedStatus === "Available"
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }
                  `}
                >
                  {computedStatus === "Available" ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                </button>

                {/* VIEW RECOMMENDATIONS */}
                <button
                  title="View Recommendations"
                  onClick={() => onViewRecommendations(product)}
                  className="
                    p-2 rounded-md bg-indigo-500 text-white hover:bg-indigo-600 
                    shadow-sm transition flex items-center
                  "
                >
                  <Eye className="w-4 h-4" />
                </button>

                {/* DELETE */}
                <button
                  title="Delete Product"
                  onClick={() => product.id && handleDeleteProduct(product.id)}
                  className="
                    p-2 rounded-md bg-red-600 text-white hover:bg-red-700 
                    shadow-sm transition flex items-center
                  "
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })
      ) : (
        <div className="text-center text-gray-500 py-6">No products found.</div>
      )}
    </div>
  );
};

export default ProductTable;
