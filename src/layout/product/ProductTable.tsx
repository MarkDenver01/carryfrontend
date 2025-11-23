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
    <div className="overflow-x-auto w-full p-3">
      <table className="min-w-[1500px] w-full text-sm text-gray-700">

        {/* HEADER */}
        <thead>
          <tr className="text-left text-gray-500 text-xs font-semibold border-b border-gray-200">
            <th className="py-3 px-2">Image</th>
            <th
              className="py-3 px-2 cursor-pointer hover:text-emerald-600 transition"
              onClick={() => handleSort("code")}
            >
              Code {getSortIcon("code")}
            </th>
            <th
              className="py-3 px-2 cursor-pointer hover:text-emerald-600 transition"
              onClick={() => handleSort("name")}
            >
              Name {getSortIcon("name")}
            </th>
            <th
              className="py-3 px-2 cursor-pointer hover:text-emerald-600 transition"
              onClick={() => handleSort("categoryName")}
            >
              Category {getSortIcon("categoryName")}
            </th>
            <th
              className="py-3 px-2 cursor-pointer hover:text-emerald-600 transition"
              onClick={() => handleSort("description")}
            >
              Description {getSortIcon("description")}
            </th>
            <th className="py-3 px-2">Size</th>
            <th
              className="py-3 px-2 cursor-pointer hover:text-emerald-600 transition"
              onClick={() => handleSort("stock")}
            >
              Stocks {getSortIcon("stock")}
            </th>
            <th className="py-3 px-2">Expiry</th>
            <th className="py-3 px-2">In Date</th>
            <th className="py-3 px-2">Status</th>
            <th className="py-3 px-2 text-center">Actions</th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((product, idx) => (
              <tr
                key={product.id ?? idx}
                className="border-b border-gray-200 hover:bg-gray-50 transition-all"
              >
                {/* IMAGE */}
                <td className="py-3 px-2">
                  <img
                    src={product.imageUrl || "/placeholder.png"}
                    alt={product.name}
                    className="w-12 h-12 rounded-md object-cover shadow-sm"
                  />
                </td>

                {/* CODE */}
                <td className="py-3 px-2 text-gray-700">{product.code}</td>

                {/* NAME */}
                <td className="py-3 px-2 font-medium text-gray-900">
                  {product.name}
                </td>

                {/* CATEGORY */}
                <td className="py-3 px-2">
                  <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs">
                    {product.categoryName ?? "—"}
                  </span>
                </td>

                {/* DESCRIPTION */}
                <td className="py-3 px-2 relative group text-gray-600">
                  <p className="line-clamp-2 text-sm">{product.description}</p>

                  {/* TOOLTIP */}
                  <div className="absolute hidden group-hover:block left-0 top-full mt-1 w-[330px] bg-white shadow-lg border border-gray-200 rounded-lg p-3 text-xs leading-5 z-20">
                    {product.description}
                  </div>
                </td>

                {/* SIZE */}
                <td className="py-3 px-2">{product.size}</td>

                {/* STOCK */}
                <td className="py-3 px-2">{product.stock}</td>

                {/* EXPIRY */}
                <td className="py-3 px-2">{product.expiryDate ?? "—"}</td>

                {/* IN DATE */}
                <td className="py-3 px-2">{product.inDate ?? "—"}</td>

                {/* STATUS */}
                <td className="py-3 px-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      product.status === "Available"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.status}
                  </span>
                </td>

                {/* ACTION BUTTONS */}
                <td className="py-3 px-2">
                  <div className="flex items-center justify-center gap-2">

                    {/* UPDATE */}
                    <button
                      className="px-3 h-9 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded-md flex items-center gap-1 transition"
                      onClick={() =>
                        handleEditProduct((currentPage - 1) * pageSize + idx)
                      }
                    >
                      <Pencil className="w-4 h-4" />
                      Update
                    </button>

                    {/* AVAILABILITY */}
                    <button
                      className={`px-3 h-9 text-xs rounded-md flex items-center gap-1 transition text-white ${
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

                    {/* VIEW */}
                    <button
                      className="px-3 h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-1 transition"
                      onClick={() => onViewRecommendations(product)}
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>

                    {/* DELETE */}
                    <button
                      className="px-3 h-9 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center gap-1 transition"
                      onClick={() => product.id && handleDeleteProduct(product.id)}
                    >
                      <XCircle className="w-4 h-4" />
                      Delete
                    </button>

                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={11}
                className="text-center py-5 text-gray-500"
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
