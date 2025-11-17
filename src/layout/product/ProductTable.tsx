import React from "react";
import { Pencil, Eye, XCircle, CheckCircle } from "lucide-react";
import type { Product, ProductRecommended } from "../../types/types";

interface ProductTableProps {
  sortedProducts: Product[];
  paginatedProducts: Product[];
  currentPage: number;
  pageSize: number;
  handleSort: (field: any) => void;
  getSortIcon: (field: any) => string;
  handleEditProduct: (index: number) => void;
  toggleAvailability: (index: number) => void;
  handleDeleteProduct: (id: number) => void;
  setSelectedRecommendations: React.Dispatch<
    React.SetStateAction<ProductRecommended[]>
  >;
  setIsViewModalOpen: (value: boolean) => void;
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
  setSelectedRecommendations,
  setIsViewModalOpen,
}) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border border-gray-300 text-sm text-left text-gray-700">
        {/* HEADER */}
        <thead className="bg-emerald-600 text-white">
          <tr>
            <th className="p-3 border border-gray-300 font-medium whitespace-nowrap">
              Image
            </th>

            {[
              ["code", "Code"],
              ["name", "Name"],
              ["categoryName", "Category"],
              ["description", "Description"],
              ["size", "Size"],
              ["stock", "Stocks"],
              ["expiryDate", "Expiry Date"],
              ["inDate", "In Date"],
              ["status", "Status"],
            ].map(([field, label]) => (
              <th
                key={field}
                className="p-3 border border-gray-300 font-medium cursor-pointer select-none whitespace-nowrap"
                onClick={() => handleSort(field)}
              >
                {label}{" "}
                <span className="text-xs opacity-80">{getSortIcon(field)}</span>
              </th>
            ))}

            <th className="p-3 border border-gray-300 font-medium text-center whitespace-nowrap">
              Actions
            </th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody className="bg-gray-50">
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((product, idx) => (
              <tr
                key={product.id ?? idx}
                className="hover:bg-emerald-100 transition"
              >
                {/* IMAGE */}
                <td className="p-3 border border-gray-300 align-middle">
                  <img
                    src={product.imageUrl || "/placeholder.png"}
                    alt={product.name}
                    className="w-12 h-12 rounded-md object-cover"
                  />
                </td>

                {/* PRODUCT FIELDS */}
                <td className="p-3 border border-gray-300">{product.code}</td>

                <td className="p-3 border border-gray-300 font-medium">
                  {product.name}
                </td>

                <td className="p-3 border border-gray-300">
                  <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700 border border-indigo-300">
                    {product.categoryName ?? "—"}
                  </span>
                </td>

                <td className="p-3 border border-gray-300 max-w-[300px] break-words">
                  {product.description}
                </td>

                <td className="p-3 border border-gray-300">{product.size}</td>

                <td className="p-3 border border-gray-300">{product.stock}</td>

                <td className="p-3 border border-gray-300">
                  {product.expiryDate ?? "—"}
                </td>

                <td className="p-3 border border-gray-300">
                  {product.inDate ?? "—"}
                </td>

                <td className="p-3 border border-gray-300">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                      product.status === "Available"
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-red-100 text-red-700 border border-red-300"
                    }`}
                  >
                    {product.status}
                  </span>
                </td>

                {/* ACTIONS */}
                <td className="p-3 border border-gray-300 align-middle">
                  <div className="flex flex-wrap justify-center gap-2">
                    {/* UPDATE */}
                    <button
                      className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-yellow-500 hover:bg-yellow-600 rounded-md whitespace-nowrap"
                      onClick={() => {
                        const realIndex =
                          (currentPage - 1) * pageSize + idx;
                        handleEditProduct(realIndex);
                      }}
                    >
                      <Pencil className="w-4 h-4" /> Update
                    </button>

                    {/* TOGGLE STATUS */}
                    <button
                      className={`flex items-center gap-1 px-3 py-1 text-xs text-white rounded-md whitespace-nowrap ${
                        product.status === "Available"
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                      onClick={() => {
                        const realIndex =
                          (currentPage - 1) * pageSize + idx;
                        toggleAvailability(realIndex);
                      }}
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

                    {/* VIEW RECOMMENDED */}
                    <button
                      className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-md whitespace-nowrap"
                      onClick={() => {
                        const target = paginatedProducts[idx];
                        setSelectedRecommendations(
                          target.recommendations ?? []
                        );
                        setIsViewModalOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" /> Recommended
                    </button>

                    {/* DELETE */}
                    <button
                      className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded-md whitespace-nowrap"
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
                className="text-center py-4 text-gray-500 border border-gray-300"
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
