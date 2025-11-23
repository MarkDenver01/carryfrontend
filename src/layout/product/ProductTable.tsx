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
        <div className="col-span-3 flex items-center gap-1">Product</div>

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

      {/* BODY */}
      {paginatedProducts.length > 0 ? (
        paginatedProducts.map((product, idx) => (
          <div
            key={product.id ?? idx}
            className="
              group
              grid grid-cols-12 gap-4 p-5 rounded-xl
              bg-white border border-gray-100
              shadow-sm hover:shadow-md
              transition-all duration-200
              relative
            "
          >
            {/* IMAGE + DETAILS */}
            <div className="col-span-3 flex gap-4 items-center">
              <img
                src={product.imageUrl || "/placeholder.png"}
                className="w-20 h-20 rounded-lg object-cover border border-gray-200 shadow-sm"
              />
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  {product.name}
                </p>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {product.description}
                </p>
              </div>
            </div>

            {/* CODE */}
            <div className="col-span-1 flex items-center text-sm text-gray-600">
              {product.code}
            </div>

            {/* NAME */}
            <div className="col-span-2 flex items-center text-sm text-gray-800">
              {product.name}
            </div>

            {/* CATEGORY */}
            <div className="col-span-2 flex items-center">
              <span className="px-3 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
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

              {/* UPDATE */}
              <button
                onClick={() =>
                  handleEditProduct((currentPage - 1) * pageSize + idx)
                }
                className="
                  px-2.5 py-1.5 text-xs font-medium rounded-md 
                  bg-blue-500 text-white hover:bg-blue-600
                  flex items-center gap-1 transition-all shadow-sm
                  active:scale-[0.97]
                "
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>

              {/* STATUS TOGGLE */}
              <button
                onClick={() => toggleAvailability(product)}
                className={`
                  px-2.5 py-1.5 text-xs font-medium rounded-md 
                  flex items-center gap-1 transition-all shadow-sm 
                  active:scale-[0.97] 
                  ${
                    product.status === "Available"
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }
                `}
              >
                {product.status === "Available" ? (
                  <>
                    <XCircle className="w-4 h-4" /> Disable
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" /> Enable
                  </>
                )}
              </button>

              {/* VIEW */}
              <button
                onClick={() => onViewRecommendations(product)}
                className="
                  px-2.5 py-1.5 text-xs font-medium rounded-md 
                  bg-indigo-500 text-white hover:bg-indigo-600
                  flex items-center gap-1 transition-all shadow-sm
                  active:scale-[0.97]
                "
              >
                <Eye className="w-4 h-4" />
                View
              </button>

              {/* DELETE */}
              <button
                onClick={() => product.id && handleDeleteProduct(product.id)}
                className="
                  px-2.5 py-1.5 text-xs font-medium rounded-md 
                  bg-red-600 text-white hover:bg-red-700 
                  flex items-center gap-1 transition-all shadow-sm
                  active:scale-[0.97]
                "
              >
                <XCircle className="w-4 h-4" />
                Delete
              </button>
            </div>

          </div>
        ))
      ) : (
        <div className="text-center text-gray-500 py-6">
          No products found.
        </div>
      )}
    </div>
  );
};

export default ProductTable;
