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

  // ✅ Replaced old modal triggers with the new unified handler
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
      <table className="min-w-[1500px] border border-gray-200 text-sm text-left text-gray-700">
        <thead className="bg-emerald-700 text-white text-xs uppercase tracking-wide">
          <tr className="divide-x divide-emerald-600">
            <th className="p-3 font-semibold w-[80px]">Image</th>
            <th
              className="p-3 font-semibold w-[100px] cursor-pointer"
              onClick={() => handleSort("code")}
            >
              Code {getSortIcon("code")}
            </th>
            <th
              className="p-3 font-semibold w-[200px] cursor-pointer"
              onClick={() => handleSort("name")}
            >
              Name {getSortIcon("name")}
            </th>
            <th
              className="p-3 font-semibold w-[260px] cursor-pointer"
              onClick={() => handleSort("categoryName")}
            >
              Category {getSortIcon("categoryName")}
            </th>
            <th
              className="p-3 font-semibold w-[350px] cursor-pointer"
              onClick={() => handleSort("description")}
            >
              Description {getSortIcon("description")}
            </th>
            <th className="p-3 font-semibold w-[80px]">Size</th>
            <th
              className="p-3 font-semibold w-[80px] cursor-pointer"
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

        <tbody className="bg-white">
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((product, idx) => (
              <tr
                key={product.id ?? idx}
                className="hover:bg-gray-50 border-t border-gray-200"
              >
                {/* Image */}
                <td className="p-2.5 w-[80px] align-middle">
                  <img
                    src={product.imageUrl || "/placeholder.png"}
                    alt={product.name}
                    className="w-12 h-12 rounded object-cover border border-gray-200"
                  />
                </td>

                {/* Code */}
                <td className="p-2.5 w-[100px] align-middle">{product.code}</td>

                {/* Name */}
                <td className="p-2.5 w-[200px] align-middle font-medium">
                  {product.name}
                </td>

                {/* Category */}
                <td className="p-2.5 w-[260px] align-middle">
                  <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700 border border-indigo-300">
                    {product.categoryName ?? "—"}
                  </span>
                </td>

                {/* Description (with hover tooltip) */}
                <td className="p-2.5 w-[350px] align-middle relative group">
                  <p className="line-clamp-3 cursor-pointer">
                    {product.description}
                  </p>

                  <div
                    className="
                      hidden group-hover:block absolute z-50 left-0 top-full mt-1
                      w-[380px] bg-white shadow-xl border border-gray-300
                      rounded-md p-3 text-gray-700 text-sm leading-relaxed
                      whitespace-normal
                    "
                  >
                    {product.description}
                  </div>
                </td>

                {/* Size */}
                <td className="p-2.5 w-[80px] align-middle">{product.size}</td>

                {/* Stock */}
                <td className="p-2.5 w-[80px] align-middle">{product.stock}</td>

                {/* Expiry */}
                <td className="p-2.5 w-[130px] align-middle">
                  {product.expiryDate ?? "—"}
                </td>

                {/* In Date */}
                <td className="p-2.5 w-[130px] align-middle">
                  {product.inDate ?? "—"}
                </td>

                {/* Status */}
                <td className="p-2.5 w-[120px] align-middle">
                  <span
                    className={`px-2 py-1 text-xs rounded-full border ${
                      product.status === "Available"
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-red-100 text-red-700 border-red-300"
                    }`}
                  >
                    {product.status}
                  </span>
                </td>

                {/* ACTION BUTTONS */}
                <td className="p-2.5 align-middle w-[500px]">
                  <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                    {/* UPDATE */}
                    <button
                      className="h-9 min-w-[120px] flex items-center justify-center gap-1 px-3 text-xs text-white bg-yellow-500 hover:bg-yellow-600 rounded-md"
                      onClick={() => {
                        const realIndex = (currentPage - 1) * pageSize + idx;
                        handleEditProduct(realIndex);
                      }}
                    >
                      <Pencil className="w-4 h-4" /> Update
                    </button>

                    {/* AVAILABILITY */}
                    <button
                      className={`h-9 min-w-[120px] flex items-center justify-center gap-1 px-3 text-xs text-white rounded-md ${
                        product.status === "Available"
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
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

                    {/* VIEW RECOMMENDATIONS ✅ */}
                    <button
                      className="h-9 min-w-[150px] flex items-center justify-center gap-1 px-3 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                      onClick={() => onViewRecommendations(product)}
                    >
                      <Eye className="w-4 h-4" /> View Recommendations
                    </button>

                    {/* DELETE */}
                    <button
                      className="h-9 min-w-[120px] flex items-center justify-center gap-1 px-3 text-xs text-white bg-red-600 hover:bg-red-700 rounded-md"
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
                className="text-center py-4 text-gray-500 border-t border-gray-200"
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
