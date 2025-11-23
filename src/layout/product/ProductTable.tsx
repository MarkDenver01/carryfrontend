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
      <div className="grid grid-cols-12 text-xs font-semibold text-gray-500 px-3 pb-2 border-b border-gray-200 tracking-wide">
        <div className="col-span-3 flex items-center gap-1 cursor-default">
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

      {paginatedProducts.length > 0 ? (
        paginatedProducts.map((product, idx) => (
          <div
            key={product.id ?? idx}
            className="
              group
              grid grid-cols-12 gap-4 p-5 rounded-2xl
              bg-white 
              border border-gray-100
              shadow-[0_4px_24px_rgba(0,0,0,0.06)]
              hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)]
              transition-all duration-300
              relative overflow-hidden
            "
          >
            {/* Glow Accent */}
            <div className="
              absolute inset-0 pointer-events-none opacity-0 
              group-hover:opacity-100 transition-all duration-300
              bg-gradient-to-r from-emerald-50 to-transparent
            "/>

            {/* !! Image + Name + Description */}
            <div className="col-span-3 flex gap-4 relative z-10">
              <img
                src={product.imageUrl || '/placeholder.png'}
                className="
                  w-20 h-20 rounded-xl object-cover border border-gray-200 
                  shadow-sm
                "
              />

              <div className="flex flex-col justify-between py-1">
                <p className="font-semibold text-gray-900 text-sm leading-tight">
                  {product.name}
                </p>
                <p className="text-xs text-gray-500 line-clamp-2 leading-snug">
                  {product.description}
                </p>
              </div>
            </div>

            {/* CODE */}
            <div className="col-span-1 flex items-center text-sm text-gray-600">
              {product.code}
            </div>

            {/* NAME (redundant para sa grid alignment, kaya faded na) */}
            <div className="col-span-2 flex items-center text-sm text-gray-800">
              {product.name}
            </div>

            {/* CATEGORY */}
            <div className="col-span-2 flex items-center">
              <span className="
                px-3 py-1 text-xs rounded-full 
                bg-emerald-50 text-emerald-700 border border-emerald-200
                shadow-sm
              ">
                {product.categoryName ?? "—"}
              </span>
            </div>

            {/* STOCK */}
            <div className="col-span-1 flex items-center text-sm font-medium">
              {product.stock}
            </div>

            {/* EXPIRY */}
            <div className="col-span-1 flex items-center text-sm text-gray-600">
              {product.expiryDate ?? "—"}
            </div>

            {/* STATUS */}
            <div className="col-span-1 flex items-center">
              <span
                className={`
                  px-3 py-1 text-xs rounded-full border shadow-sm
                  ${
                    product.status === "Available"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-red-100 text-red-700 border-red-200"
                  }
                `}
              >
                {product.status}
              </span>
            </div>

            {/* ACTION BUTTONS */}
            <div className="col-span-2 flex items-center justify-center gap-2">

              <button
                className="
                  px-3 py-2 text-xs rounded-lg text-white shadow-md 
                  bg-gradient-to-br from-yellow-500 to-yellow-600
                  hover:brightness-110 transition
                  flex items-center gap-1
                "
                onClick={() =>
                  handleEditProduct((currentPage - 1) * pageSize + idx)
                }
              >
                <Pencil className="w-4 h-4" />
                Update
              </button>

              <button
                className={`
                  px-3 py-2 text-xs rounded-lg shadow-md 
                  flex items-center gap-1 transition text-white
                  ${
                    product.status === "Available"
                      ? "bg-gradient-to-br from-red-500 to-red-600 hover:brightness-110"
                      : "bg-gradient-to-br from-green-600 to-green-700 hover:brightness-110"
                  }
                `}
                onClick={() => toggleAvailability(product)}
              >
                {product.status === "Available" ? (
                  <>
                    <XCircle className="w-4 h-4" /> Not Available
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" /> Available
                  </>
                )}
              </button>

              <button
                className="
                  px-3 py-2 text-xs rounded-lg text-white
                  bg-gradient-to-br from-blue-600 to-blue-700
                  hover:brightness-110 shadow-md flex items-center gap-1 transition
                "
                onClick={() => onViewRecommendations(product)}
              >
                <Eye className="w-4 h-4" /> View
              </button>

              <button
                className="
                  px-3 py-2 text-xs rounded-lg text-white
                  bg-gradient-to-br from-red-600 to-red-700
                  hover:brightness-110 shadow-md flex items-center gap-1 transition
                "
                onClick={() => product.id && handleDeleteProduct(product.id)}
              >
                <XCircle className="w-4 h-4" /> Delete
              </button>

            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500 py-6">No products found.</div>
      )}
    </div>
  );
};

export default ProductTable;
