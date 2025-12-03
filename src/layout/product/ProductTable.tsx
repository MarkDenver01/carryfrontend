import React from "react";
import { Pencil, XCircle, CheckCircle } from "lucide-react";
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
  onViewRecommendations: (product: Product) => void; // still here but no button
  onSelectProduct?: (product: Product) => void;       // NEW
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
  onSelectProduct,
}) => {
  return (
    <div className="p-4 space-y-4 bg-gradient-to-b from-emerald-50/40 via-white to-cyan-50/40">
      {/* TABLE HEADER */}
      <div
        className="
          grid grid-cols-12 items-center
          px-5 py-3 
          text-[11px] font-semibold uppercase tracking-[0.16em]
          text-emerald-900/80
          bg-gradient-to-r from-emerald-50 via-white to-cyan-50
          border border-emerald-100/80 rounded-2xl shadow-sm
        "
      >
        <div className="col-span-3">Product</div>

        <button
          type="button"
          className="col-span-1 flex items-center gap-1 hover:text-emerald-600 text-left transition"
          onClick={() => handleSort("code")}
        >
          <span>Code</span>
          <span className="text-[10px]">{getSortIcon("code")}</span>
        </button>

        <button
          type="button"
          className="col-span-2 flex items-center gap-1 hover:text-emerald-600 text-left transition"
          onClick={() => handleSort("name")}
        >
          <span>Name</span>
          <span className="text-[10px]">{getSortIcon("name")}</span>
        </button>

        <button
          type="button"
          className="col-span-2 flex items-center gap-1 hover:text-emerald-600 text-left transition"
          onClick={() => handleSort("categoryName")}
        >
          <span>Category</span>
          <span className="text-[10px]">{getSortIcon("categoryName")}</span>
        </button>

        <div className="col-span-1">Stock</div>
        <div className="col-span-1">Expiry</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-1 text-center">Actions</div>
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
              onClick={() => onSelectProduct && onSelectProduct(product)}
              className={`
                grid grid-cols-12 gap-4 p-4
                rounded-2xl border bg-white/95
                transition-all duration-200 cursor-pointer
                ${
                  idx % 2 === 0
                    ? "border-emerald-50"
                    : "border-emerald-100/70"
                }
                hover:-translate-y-[2px]
                hover:shadow-[0_14px_40px_rgba(15,23,42,0.16)]
                hover:border-emerald-200/80
              `}
            >
              {/* IMAGE + DETAILS */}
              <div className="col-span-3 flex items-center gap-4">
                <div className="relative">
                  <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-emerald-200/60 via-cyan-200/40 to-transparent opacity-75 blur-[2px]" />
                  <img
                    src={product.imageUrl || "/placeholder.png"}
                    className="relative w-16 h-16 rounded-xl object-cover border border-emerald-100 shadow-sm bg-slate-50"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p
                    className="font-semibold text-slate-900 text-sm line-clamp-1"
                    title={product.name}
                  >
                    {product.name}
                  </p>
                  <p
                    className="text-[11px] text-slate-500 line-clamp-2"
                    title={product.productDescription}
                  >
                    {product.productDescription}
                  </p>
                  <p className="text-[10px] text-emerald-700/75 font-medium uppercase tracking-[0.14em]">
                    {product.code}
                  </p>
                </div>
              </div>

              {/* CODE */}
              <div
                className="col-span-1 flex items-center text-[12px] text-slate-700"
                title={product.code}
              >
                <span className="truncate">{product.code}</span>
              </div>

              {/* NAME */}
              <div
                className="col-span-2 flex items-center text-[13px] font-medium text-slate-900"
                title={product.name}
              >
                <span className="truncate">{product.name}</span>
              </div>

              {/* CATEGORY */}
              <div className="col-span-2 flex items-center">
                <span
                  className="
                    inline-flex items-center gap-1.5
                    px-3 py-1 text-[11px] rounded-full 
                    bg-emerald-50 text-emerald-700 border border-emerald-200/80
                    shadow-sm
                  "
                  title={product.categoryName ?? "—"}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="truncate max-w-[120px]">
                    {product.categoryName ?? "Uncategorized"}
                  </span>
                </span>
              </div>

              {/* STOCK */}
              <div className="col-span-1 flex items-center">
                <span
                  className={`
                    inline-flex items-center justify-center
                    px-3 py-1 text-[11px] rounded-full font-semibold shadow-sm
                    ${
                      isOutOfStock
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : isLowStock
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }
                  `}
                >
                  {product.stock}
                </span>
              </div>

              {/* EXPIRY */}
              <div
                className="col-span-1 flex items-center text-sm text-slate-700"
                title={expiryFormatted}
              >
                {expiryFormatted}
              </div>

              {/* STATUS */}
              <div className="col-span-1 flex items-center">
                <span
                  className={`
                    inline-flex items-center gap-1.5
                    px-3 py-1 text-[11px] rounded-full font-semibold border shadow-sm
                    ${
                      computedStatus === "Available"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-700 border-slate-300"
                    }
                  `}
                >
                  <span
                    className={`
                      w-1.5 h-1.5 rounded-full
                      ${
                        computedStatus === "Available"
                          ? "bg-emerald-500"
                          : "bg-slate-500"
                      }
                    `}
                  />
                  <span>{computedStatus}</span>
                </span>
              </div>

              {/* ACTION BUTTONS */}
              <div className="col-span-1 flex flex-col gap-2 items-stretch justify-center">
                {/* EDIT */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditProduct((currentPage - 1) * pageSize + idx);
                  }}
                  className="
                    inline-flex items-center justify-center gap-1.5
                    rounded-lg border border-emerald-200/80
                    bg-white text-[11px] font-medium text-emerald-800 
                    py-1.5 px-2.5 shadow-sm
                    hover:bg-emerald-50 hover:border-emerald-300
                    transition
                  "
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                {/* TOGGLE STATUS */}
                <button
                  disabled={isOutOfStock || isLowStock}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isOutOfStock && !isLowStock) {
                      toggleAvailability(product);
                    }
                  }}
                  className={`
                    inline-flex items-center justify-center gap-1.5
                    rounded-lg text-[11px] font-medium py-1.5 px-2.5 shadow-sm transition
                    ${
                      isOutOfStock || isLowStock
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300"
                        : computedStatus === "Available"
                        ? "bg-gradient-to-r from-red-500 to-rose-500 text-white hover:brightness-110 border border-red-400/70"
                        : "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:brightness-110 border border-emerald-400/70"
                    }
                  `}
                >
                  {computedStatus === "Available" ? (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Disable</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Enable</span>
                    </>
                  )}
                </button>

                {/* DELETE */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    product.id && handleDeleteProduct(product.id);
                  }}
                  className="
                    inline-flex items-center justify-center gap-1.5
                    rounded-lg bg-red-600 text-white text-[11px] font-medium 
                    py-1.5 px-2.5 shadow-sm
                    hover:bg-red-700 transition
                  "
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <div className="py-8 text-center text-slate-500 text-sm">
          No products found.
        </div>
      )}
    </div>
  );
};

export default ProductTable;
