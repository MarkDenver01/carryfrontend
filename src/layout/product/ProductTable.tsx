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

  // unified handler
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
    <div className="overflow-x-auto w-full">
      {/* GODLY HUD TABLE */}
      <table className="min-w-[1500px] text-sm text-left text-slate-700">
        {/* ===== TABLE HEADER ===== */}
        <thead>
          <tr className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-500 
                         text-white text-xs uppercase tracking-wide shadow 
                         border-b border-emerald-300/40">

            <th className="p-3 font-semibold w-[80px]">Image</th>

            <th
              className="p-3 font-semibold w-[100px] cursor-pointer select-none hover:bg-emerald-600/20 transition"
              onClick={() => handleSort("code")}
            >
              Code {getSortIcon("code")}
            </th>

            <th
              className="p-3 font-semibold w-[200px] cursor-pointer select-none hover:bg-emerald-600/20 transition"
              onClick={() => handleSort("name")}
            >
              Name {getSortIcon("name")}
            </th>

            <th
              className="p-3 font-semibold w-[260px] cursor-pointer select-none hover:bg-emerald-600/20 transition"
              onClick={() => handleSort("categoryName")}
            >
              Category {getSortIcon("categoryName")}
            </th>

            <th
              className="p-3 font-semibold w-[350px] cursor-pointer select-none hover:bg-emerald-600/20 transition"
              onClick={() => handleSort("description")}
            >
              Description {getSortIcon("description")}
            </th>

            <th className="p-3 font-semibold w-[80px]">Size</th>

            <th
              className="p-3 font-semibold w-[80px] cursor-pointer select-none hover:bg-emerald-600/20 transition"
              onClick={() => handleSort("stock")}
            >
              Stocks {getSortIcon("stock")}
            </th>

            <th className="p-3 font-semibold w-[130px]">Expiry</th>
            <th className="p-3 font-semibold w-[130px]">In Date</th>
            <th className="p-3 font-semibold w-[120px]">Status</th>
            <th className="p-3 font-semibold text-center w-[500px]">Actions</th>
          </tr>
        </thead>

        {/* ===== TABLE BODY ===== */}
        <tbody className="bg-white/70 backdrop-blur-xl">
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((product, idx) => (
              <tr
                key={product.id ?? idx}
                className="border-t border-slate-200/60 
                           hover:bg-emerald-50/60 hover:shadow-[0_4px_18px_rgba(16,185,129,0.25)]
                           transition-all duration-200"
              >
                {/* Product Image */}
                <td className="p-3 w-[80px] align-middle">
                  <img
                    src={product.imageUrl || "/placeholder.png"}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover border border-emerald-200 shadow-sm"
                  />
                </td>

                {/* Code */}
                <td className="p-3 w-[100px] align-middle font-semibold text-slate-800">
                  {product.code}
                </td>

                {/* Name */}
                <td className="p-3 w-[200px] align-middle font-bold text-slate-900">
                  {product.name}
                </td>

                {/* Category badge */}
                <td className="p-3 w-[260px] align-middle">
                  <span className="px-2 py-1 text-xs rounded-full 
                                   bg-emerald-100 text-emerald-700 
                                   border border-emerald-300 shadow-sm">
                    {product.categoryName ?? "—"}
                  </span>
                </td>

                {/* Description with hover tooltip */}
                <td className="p-3 w-[350px] align-middle relative group">
                  <p className="line-clamp-2 cursor-pointer text-slate-700">
                    {product.description}
                  </p>

                  {/* Tooltip */}
                  <div
                    className="hidden group-hover:block absolute left-0 top-full mt-2 z-50
                               w-[360px] bg-white/95 backdrop-blur-xl
                               border border-slate-200 rounded-md shadow-xl
                               p-3 text-xs text-slate-700"
                  >
                    {product.description}
                  </div>
                </td>

                {/* Size */}
                <td className="p-3 w-[80px] align-middle">{product.size}</td>

                {/* Stock */}
                <td className="p-3 w-[80px] align-middle font-semibold">
                  {product.stock}
                </td>

                {/* Expiry */}
                <td className="p-3 w-[130px] align-middle text-slate-600">
                  {product.expiryDate ?? "—"}
                </td>

                {/* In Date */}
                <td className="p-3 w-[130px] align-middle text-slate-600">
                  {product.inDate ?? "—"}
                </td>

                {/* Status badge */}
                <td className="p-3 w-[120px] align-middle">
                  <span
                    className={`px-2 py-1 text-xs rounded-full border font-semibold 
                      ${
                        product.status === "Available"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                          : "bg-red-100 text-red-700 border-red-300"
                      }`}
                  >
                    {product.status}
                  </span>
                </td>

                {/* ACTION BUTTONS */}
                <td className="p-3 w-[500px] align-middle">
                  <div className="flex items-center justify-center gap-2">

                    {/* UPDATE */}
                    <button
                      className="h-9 min-w-[120px] flex items-center justify-center gap-1 
                                 px-3 text-xs font-semibold text-white
                                 bg-gradient-to-r from-yellow-500 to-yellow-600
                                 rounded-md shadow hover:shadow-lg transition"
                      onClick={() => {
                        const realIndex = (currentPage - 1) * pageSize + idx;
                        handleEditProduct(realIndex);
                      }}
                    >
                      <Pencil className="w-4 h-4" /> Update
                    </button>

                    {/* AVAILABILITY */}
                    <button
                      className={`h-9 min-w-[140px] flex items-center justify-center gap-1 px-3 
                        text-xs font-semibold text-white rounded-md shadow hover:shadow-lg transition
                        ${
                          product.status === "Available"
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-green-600 hover:bg-green-700"
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

                    {/* VIEW RECOMMENDATIONS */}
                    <button
                      className="h-9 min-w-[160px] flex items-center justify-center gap-1 px-3 
                                 text-xs font-semibold text-white
                                 bg-gradient-to-r from-blue-600 to-blue-700
                                 rounded-md shadow hover:shadow-lg transition"
                      onClick={() => onViewRecommendations(product)}
                    >
                      <Eye className="w-4 h-4" /> Recommendations
                    </button>

                    {/* DELETE */}
                    <button
                      className="h-9 min-w-[120px] flex items-center justify-center gap-1 px-3 
                                 text-xs font-semibold text-white
                                 bg-gradient-to-r from-red-600 to-red-700
                                 rounded-md shadow hover:shadow-xl transition"
                      onClick={() => {
                        if (product.id) handleDeleteProduct(product.id);
                      }}
                    >
                      <XCircle className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={11}
                className="text-center py-4 text-slate-500 border-t border-slate-200/60"
              >
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
