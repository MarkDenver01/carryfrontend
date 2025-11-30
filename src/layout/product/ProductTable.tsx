import React from "react";
import { Pencil, Eye, XCircle, CheckCircle } from "lucide-react";
import type { Product } from "../../types/types";

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

// You can change this anytime
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
    <div className="space-y-5 p-3">

      {/* HEADER */}
      <div
        className="
          grid grid-cols-12 text-[11px] font-semibold text-slate-600 px-4 pb-3
          border-b border-emerald-200/60
          bg-white/60 backdrop-blur-md rounded-xl shadow-sm
        "
      >
        <div className="col-span-3">Product</div>

        <div
          onClick={() => handleSort("code")}
          className="col-span-1 cursor-pointer hover:text-emerald-600 transition select-none"
        >
          Code {getSortIcon("code")}
        </div>

        <div
          onClick={() => handleSort("name")}
          className="col-span-2 cursor-pointer hover:text-emerald-600 transition select-none"
        >
          Name {getSortIcon("name")}
        </div>

        <div
          onClick={() => handleSort("categoryName")}
          className="col-span-2 cursor-pointer hover:text-emerald-600 transition select-none"
        >
          Category {getSortIcon("categoryName")}
        </div>

        <div className="col-span-1">Stock</div>
        <div className="col-span-1">Expiry</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-2 text-center">Actions</div>
      </div>

      {/* BODY */}
      {paginatedProducts.length > 0 ? (
        paginatedProducts.map((product, idx) => {
          const isOutOfStock = product.stock <= 0;
          const isLowStock = product.stock <= LOW_STOCK_LIMIT;

          const computedStatus =
            isOutOfStock || isLowStock ? "Not Available" : product.status;

          return (
            <div
              key={product.id ?? idx}
              className="
                grid grid-cols-12 gap-4 p-4 rounded-2xl
                bg-white/90 backdrop-blur-xl
                border border-emerald-100 shadow-[0_4px_20px_rgba(15,23,42,0.10)]
                hover:shadow-[0_8px_28px_rgba(15,23,42,0.15)]
                transform hover:-translate-y-[2px]
                transition-all duration-300
              "
            >
              {/* IMAGE + NAME */}
              <div className="col-span-3 flex items-center gap-3">
                <div className="relative">
                  <img
                    src={product.imageUrl || "/placeholder.png"}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm"
                  />

                  {/* LOW STOCK BADGE */}
                  {isLowStock && (
                    <span className="
                      absolute -top-2 -right-2 text-[9px] px-2 py-0.5 rounded-full
                      bg-red-600 text-white font-semibold shadow
                    ">
                      Low
                    </span>
                  )}
                </div>

                <div>
                  <p className="font-bold text-slate-900 text-sm leading-tight">
                    {product.name}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {product.productDescription}
                  </p>
                </div>
              </div>

              {/* CODE */}
              <div className="col-span-1 flex items-center text-sm text-slate-600">
                {product.code}
              </div>

              {/* NAME */}
              <div className="col-span-2 flex items-center text-sm text-slate-800 font-medium">
                {product.name}
              </div>

              {/* CATEGORY */}
              <div className="col-span-2 flex items-center">
                <span
                  className="
                    px-2.5 py-1 text-[10px]
                    rounded-xl font-semibold tracking-wide
                    bg-emerald-50 text-emerald-700 border border-emerald-200
                  "
                >
                  {product.categoryName ?? "—"}
                </span>
              </div>

              {/* STOCK */}
              <div className="col-span-1 flex items-center text-sm font-semibold text-slate-800">
                {product.stock}
              </div>

              {/* EXPIRY */}
              <div className="col-span-1 flex items-center text-xs text-slate-600">
                {product.expiryDate ?? "—"}
              </div>

              {/* STATUS */}
              <div className="col-span-1 flex items-center">
                <span
                  className={`
                    px-3 py-1 text-[10px] rounded-full border font-semibold
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
                  onClick={() =>
                    handleEditProduct((currentPage - 1) * pageSize + idx)
                  }
                  className="
                    flex items-center gap-1 px-3 py-1.5 text-[10px]
                    rounded-md bg-blue-500 text-white hover:bg-blue-600
                    shadow-sm font-semibold
                    transition-all
                  "
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>

                {/* TOGGLE STATUS */}
                <button
                  disabled={isOutOfStock || isLowStock}
                  onClick={() => {
                    if (isLowStock || isOutOfStock) {
                      alert("Stock too low to activate.");
                      return;
                    }
                    toggleAvailability(product);
                  }}
                  className={`
                    flex items-center gap-1 px-3 py-1.5 text-[10px]
                    rounded-md shadow-sm font-semibold transition-all
                    ${
                      isOutOfStock || isLowStock
                        ? "bg-slate-300 text-white cursor-not-allowed"
                        : computedStatus === "Available"
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-emerald-500 hover:bg-emerald-600 text-white"
                    }
                  `}
                >
                  {computedStatus === "Available" ? (
                    <>
                      <XCircle className="w-3.5 h-3.5" /> Off
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" /> On
                    </>
                  )}
                </button>

                {/* VIEW */}
                <button
                  onClick={() => onViewRecommendations(product)}
                  className="
                    flex items-center gap-1 px-3 py-1.5 text-[10px]
                    rounded-md bg-indigo-500 hover:bg-indigo-600
                    text-white shadow-sm font-semibold transition-all
                  "
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </button>

                {/* DELETE */}
                <button
                  onClick={() => product.id && handleDeleteProduct(product.id)}
                  className="
                    flex items-center gap-1 px-3 py-1.5 text-[10px]
                    rounded-md bg-red-600 text-white
                    hover:bg-red-700 shadow-sm font-semibold transition-all
                  "
                >
                  <XCircle className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center text-slate-500 py-6 text-sm">
          No products found.
        </div>
      )}
    </div>
  );
};

export default ProductTable;
