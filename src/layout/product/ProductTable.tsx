import React from "react";
import { Pencil, Eye, XCircle, CheckCircle } from "lucide-react";
import type { Product, ProductRecommended } from "../../types/types";

interface ProductTableProps {
  paginatedProducts: Product[];
  currentPage: number;
  itemsPerPage: number;
  openEditModal: (index: number) => void;
  toggleAvailability: (index: number) => void;
  handleDeleteProduct: (id: number) => void;
  setSelectedRecommendations: React.Dispatch<React.SetStateAction<ProductRecommended[]>>;
  setIsViewModalOpen: (value: boolean) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  paginatedProducts,
  currentPage,
  itemsPerPage,
  openEditModal,
  toggleAvailability,
  handleDeleteProduct,
  setSelectedRecommendations,
  setIsViewModalOpen,
}) => {
  return (
    <table className="min-w-full border border-gray-300 text-sm text-left text-gray-700">
      <thead className="bg-emerald-600 text-gray-100">
        <tr>
          <th className="p-3 border border-gray-300 font-medium">Image</th>
          <th className="p-3 border border-gray-300 font-medium">Code</th>
          <th className="p-3 border border-gray-300 font-medium">Name</th>
          <th className="p-3 border border-gray-300 font-medium">Description</th>
          <th className="p-3 border border-gray-300 font-medium">Size</th>
          <th className="p-3 border border-gray-300 font-medium">Stocks</th>
          <th className="p-3 border border-gray-300 font-medium">Expiry Date</th>
          <th className="p-3 border border-gray-300 font-medium">In Date</th>
          <th className="p-3 border border-gray-300 font-medium">Status</th>
          <th className="p-3 border border-gray-300 font-medium">Actions</th>
        </tr>
      </thead>
      <tbody>
        {paginatedProducts.length > 0 ? (
          paginatedProducts.map((product, idx) => (
            <tr key={product.id ?? idx} className="hover:bg-gray-100">
              <td className="p-3 border border-gray-300 align-middle">
                <img
                  src={product.image || "/placeholder.png"}
                  alt={product.name}
                  className="w-12 h-12 rounded-md object-cover"
                />
              </td>
              <td className="p-3 border border-gray-300 align-middle">{product.code}</td>
              <td className="p-3 border border-gray-300 align-middle font-medium">{product.name}</td>
              <td className="p-3 border border-gray-300 align-middle">{product.description}</td>
              <td className="p-3 border border-gray-300 align-middle">{product.size}</td>
              <td className="p-3 border border-gray-300 align-middle">{product.stock}</td>
              <td className="p-3 border border-gray-300 align-middle">
                {product.expiryDate ?? "—"}
              </td>
              <td className="p-3 border border-gray-300 align-middle">
                {product.inDate ?? "—"}
              </td>
              <td
                className={`p-3 border border-gray-300 align-middle font-semibold ${
                  product.status === "Available" ? "text-green-600" : "text-red-600"
                }`}
              >
                {product.status}
              </td>
              <td className="p-3 border border-gray-300 align-middle">
                <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                  {/* ✏️ Edit */}
                  <button
                    className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-yellow-500 hover:bg-yellow-600 rounded-md"
                    onClick={() => {
                      const realIndex = (currentPage - 1) * itemsPerPage + idx;
                      openEditModal(realIndex);
                    }}
                  >
                    <Pencil className="w-4 h-4" /> Update
                  </button>

                  {/* 🔁 Toggle Availability */}
                  <button
                    className={`flex items-center gap-1 px-3 py-1 text-xs text-white rounded-md ${
                      product.status === "Available"
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                    onClick={() =>
                      toggleAvailability((currentPage - 1) * itemsPerPage + idx)
                    }
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

                  {/* 👁️ View Recommendations */}
                  <button
                    className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                    onClick={() => {
                      const target = paginatedProducts[idx];
                      setSelectedRecommendations(target.recommendations ?? []);
                      setIsViewModalOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4" /> View Recommended
                  </button>

                  {/* ❌ Delete */}
                  <button
                    className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded-md"
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
              colSpan={10}
              className="text-center py-4 text-gray-500 border border-gray-300"
            >
              No products found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default ProductTable;
