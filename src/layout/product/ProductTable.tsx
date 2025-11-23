import React from "react";
import {
  Pencil,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
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
    <div className="overflow-x-auto w-full">
      <table className="min-w-[1100px] w-full text-sm text-slate-800">
        
        {/* ================= HEADER (Apple style) ================= */}
        <thead>
          <tr className="bg-white/80 backdrop-blur-md border-b border-slate-200/80">
            {[
              { key: "", label: "Image" },
              { key: "code", label: "Code" },
              { key: "name", label: "Name" },
              { key: "categoryName", label: "Category" },
              { key: "stock", label: "Stock" },
              { key: "status", label: "Status" },
              { key: "", label: "Actions" },
            ].map((col) => (
              <th
                key={col.label}
                className="p-3 font-semibold text-[13px] text-slate-600 select-none"
                onClick={() => col.key && handleSort(col.key as any)}
              >
                <div
                  className={`flex items-center gap-1 ${
                    col.key ? "cursor-pointer hover:text-slate-900" : ""
                  }`}
                >
                  {col.label}
                  {col.key && (
                    <span className="text-xs opacity-60">
                      {getSortIcon(col.key as any)}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* ================= BODY ================= */}
        <tbody className="divide-y divide-slate-200/70">
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((product, idx) => (
              <tr
                key={product.id}
                className="hover:bg-slate-100/50 transition-all"
              >
                {/* IMAGE */}
                <td className="p-3">
                  <div className="h-12 w-12 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <img
                      src={product.imageUrl || "/placeholder.png"}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </td>

                {/* CODE */}
                <td className="p-3 text-slate-600">{product.code}</td>

                {/* NAME */}
                <td className="p-3 font-medium text-slate-900">
                  {product.name}
                </td>

                {/* CATEGORY */}
                <td className="p-3">
                  <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs border border-slate-200">
                    {product.categoryName}
                  </span>
                </td>

                {/* STOCK */}
                <td className="p-3 font-semibold text-slate-900">
                  {product.stock}
                </td>

                {/* STATUS */}
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-lg text-xs border font-medium ${
                      product.status === "Available"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-red-100 text-red-700 border-red-200"
                    }`}
                  >
                    {product.status}
                  </span>
                </td>

                {/* ACTIONS */}
                <td className="p-3">
                  <div className="flex items-center gap-3">

                    {/* VIEW */}
                    <button
                      className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700 transition shadow-sm"
                      onClick={() => onViewRecommendations(product)}
                      title="View Recommendations"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* EDIT */}
                    <button
                      className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-blue-100 hover:border-blue-300 text-blue-500 transition shadow-sm"
                      onClick={() =>
                        handleEditProduct(
                          (currentPage - 1) * pageSize + idx
                        )
                      }
                      title="Edit Product"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {/* TOGGLE STATUS */}
                    <button
                      className={`p-2 bg-white rounded-lg border shadow-sm transition ${
                        product.status === "Available"
                          ? "text-red-600 hover:bg-red-100 hover:border-red-300 border-red-200"
                          : "text-green-600 hover:bg-green-100 hover:border-green-300 border-green-200"
                      }`}
                      onClick={() => toggleAvailability(product)}
                      title="Toggle Availability"
                    >
                      {product.status === "Available" ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </button>

                    {/* DELETE */}
                    <button
                      className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-red-100 hover:border-red-300 text-red-600 transition shadow-sm"
                      onClick={() => product.id && handleDeleteProduct(product.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={7}
                className="text-center py-6 text-slate-500"
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
