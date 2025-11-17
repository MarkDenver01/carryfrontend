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
      <table className="min-w-[2100px] border border-gray-300 text-sm text-left text-gray-700">
        {/* HEADER */}
        <thead className="bg-emerald-600 text-white">
          <tr>
            {/* IMAGE */}
            <th className="p-3 border border-gray-300 font-medium w-[120px]">
              Image
            </th>

            {/* CODE */}
            <th
              className="p-3 border border-gray-300 font-medium cursor-pointer select-none w-[110px]"
              onClick={() => handleSort("code")}
            >
              Code{" "}
              <span className="text-xs opacity-80">{getSortIcon("code")}</span>
            </th>

            {/* NAME */}
            <th
              className="p-3 border border-gray-300 font-medium cursor-pointer select-none w-[250px]"
              onClick={() => handleSort("name")}
            >
              Name{" "}
              <span className="text-xs opacity-80">{getSortIcon("name")}</span>
            </th>

            {/* CATEGORY */}
            <th
              className="p-3 border border-gray-300 font-medium cursor-pointer select-none w-[180px]"
              onClick={() => handleSort("categoryName")}
            >
              Category{" "}
              <span className="text-xs opacity-80">
                {getSortIcon("categoryName")}
              </span>
            </th>

            {/* DESCRIPTION — BIG PRIORITY */}
            <th
              className="p-3 border border-gray-300 font-medium cursor-pointer select-none w-[900px]"
              onClick={() => handleSort("description")}
            >
              Description{" "}
              <span className="text-xs opacity-80">
                {getSortIcon("description")}
              </span>
            </th>

            {/* SIZE */}
            <th
              className="p-3 border border-gray-300 font-medium cursor-pointer select-none w-[110px]"
              onClick={() => handleSort("size")}
            >
              Size{" "}
              <span className="text-xs opacity-80">{getSortIcon("size")}</span>
            </th>

            {/* STOCKS */}
            <th
              className="p-3 border border-gray-300 font-medium cursor-pointer select-none w-[110px]"
              onClick={() => handleSort("stock")}
            >
              Stocks{" "}
              <span className="text-xs opacity-80">{getSortIcon("stock")}</span>
            </th>

            {/* EXPIRY */}
            <th
              className="p-3 border border-gray-300 font-medium cursor-pointer select-none w-[150px]"
              onClick={() => handleSort("expiryDate")}
            >
              Expiry Date{" "}
              <span className="text-xs opacity-80">
                {getSortIcon("expiryDate")}
              </span>
            </th>

            {/* IN DATE */}
            <th
              className="p-3 border border-gray-300 font-medium cursor-pointer select-none w-[150px]"
              onClick={() => handleSort("inDate")}
            >
              In Date{" "}
              <span className="text-xs opacity-80">{getSortIcon("inDate")}</span>
            </th>

            {/* STATUS */}
            <th className="p-3 border border-gray-300 font-medium w-[120px]">
              Status
            </th>

            {/* ACTIONS — BIG PRIORITY */}
            <th className="p-3 border border-gray-300 font-medium text-center w-[400px]">
              Actions
            </th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody className="bg-gray-50">
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((product, idx) => (
              <tr key={product.id ?? idx} className="hover:bg-emerald-100">
                {/* IMAGE */}
                <td className="p-3 border border-gray-300 w-[120px]">
                  <img
                    src={product.imageUrl || "/placeholder.png"}
                    alt={product.name}
                    className="w-12 h-12 rounded-md object-cover"
                  />
                </td>

                {/* CODE */}
                <td className="p-3 border border-gray-300 w-[110px]">
                  {product.code}
                </td>

                {/* NAME */}
                <td className="p-3 border border-gray-300 w-[250px] font-medium">
                  {product.name}
                </td>

                {/* CATEGORY */}
                <td className="p-3 border border-gray-300 w-[180px]">
                  <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700 border border-indigo-300">
                    {product.categoryName ?? "—"}
                  </span>
                </td>

                {/* DESCRIPTION */}
                <td className="p-3 border border-gray-300 w-[900px] whitespace-pre-wrap">
                  {product.description}
                </td>

                {/* SIZE */}
                <td className="p-3 border border-gray-300 w-[110px]">
                  {product.size}
                </td>

                {/* STOCK */}
                <td className="p-3 border border-gray-300 w-[110px]">
                  {product.stock}
                </td>

                {/* EXPIRY */}
                <td className="p-3 border border-gray-300 w-[150px]">
                  {product.expiryDate ?? "—"}
                </td>

                {/* IN DATE */}
                <td className="p-3 border border-gray-300 w-[150px]">
                  {product.inDate ?? "—"}
                </td>

                {/* STATUS */}
                <td className="p-3 border border-gray-300 w-[120px]">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      product.status === "Available"
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-red-100 text-red-700 border border-red-300"
                    }`}
                  >
                    {product.status}
                  </span>
                </td>

                {/* ACTION BUTTONS */}
                <td className="p-3 border border-gray-300 w-[400px]">
                  <div className="flex items-center justify-center gap-2">

                    {/* UPDATE */}
                    <button
                      className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-yellow-500 hover:bg-yellow-600 rounded-md"
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
                      className={`flex items-center gap-1 px-3 py-1 text-xs text-white rounded-md ${
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

                    {/* RECOMMENDED */}
                    <button
                      className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-md"
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
