import { useState, useMemo } from "react";
import { Button, Pagination } from "flowbite-react";
import { Pencil, XCircle, Search, Eye } from "lucide-react";
import Swal from "sweetalert2";
import ProductPriceFormModal from "../../components/product/ProductPriceFormModal";
import ViewRecommendedModal from "../../components/product/ViewRecommendedModal";
import { usePricesContext } from "../../context/PricesContext";
import type { ProductPrice } from "../../types/pricingTypes";

export default function ProductPriceTable() {
  const { prices, removePrice } = usePricesContext();

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<ProductPrice | null>(null);

  const [viewModal, setViewModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  /** 🔍 SEARCH FILTER */
  const filtered = useMemo(() => {
    return prices.filter((p) =>
      p.productName.toLowerCase().includes(search.toLowerCase())
    );
  }, [prices, search]);

  /** 📄 PAGINATION */
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  /** ➕ ADD PRICE */
  const handleAdd = () => {
    setEditTarget(null);
    setShowModal(true);
  };

  /** ✏️ EDIT PRICE */
  const handleEdit = (price: ProductPrice) => {
    setEditTarget(price);
    setShowModal(true);
  };

  /** ❌ DELETE PRICE */
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete Price?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    });

    if (result.isConfirmed) {
      await removePrice(id);
      Swal.fire("Deleted!", "Price record removed.", "success");
    }
  };

  /** 👁️ VIEW RECOMMENDATIONS */
  const handleViewRecommendations = (productId: number) => {
    setSelectedProductId(productId);
    setViewModal(true);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Product Pricing Management
        </h2>
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={handleAdd}
        >
          + Set Product Price
        </Button>
      </div>

      {/* SEARCH */}
      <div className="relative w-full max-w-xs mb-6">
        <input
          type="text"
          placeholder="Search product..."
          className="w-full border border-emerald-300 rounded-full px-4 py-2 pl-10 shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
        <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
      </div>

      {/* TABLE */}
      <div className="w-full overflow-x-auto pb-2">
        <table className="min-w-[1400px] border border-gray-300 text-sm text-left text-gray-700">
          <thead className="bg-emerald-600 text-white">
            <tr>
              <th className="p-3 border">Product Image</th>
              <th className="p-3 border">Product Name</th>
              <th className="p-3 border">Category</th>
              <th className="p-3 border">Size</th>
              <th className="p-3 border">Price (₱)</th>
              <th className="p-3 border">Stocks</th>
              <th className="p-3 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length > 0 ? (
              paginated.map((p) => (
                <tr
                  key={p.priceId}
                  className={`hover:bg-emerald-100 transition ${
                    p.stocks <= 2 ? "bg-red-100" : ""
                  }`}
                >
                  <td className="p-3 border">
                    <img
                      src={p.productImgUrl}
                      alt={p.productName}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                  </td>
                  <td className="p-3 border font-medium">{p.productName}</td>
                  <td className="p-3 border">{p.categoryName}</td>
                  <td className="p-3 border">{p.productSize}</td>
                  <td className="p-3 border">₱{p.basePrice.toFixed(2)}</td>
                  <td className="p-3 border text-center">{p.stocks}</td>
                  <td className="p-3 border text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-yellow-500 hover:bg-yellow-600 rounded-md"
                        onClick={() => handleEdit(p)}
                      >
                        <Pencil className="w-4 h-4" /> Update
                      </button>
                      <button
                        className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded-md"
                        onClick={() => handleDelete(p.priceId)}
                      >
                        <XCircle className="w-4 h-4" /> Delete
                      </button>
                      <button
                        className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                        onClick={() => handleViewRecommendations(p.productId)}
                      >
                        <Eye className="w-4 h-4" /> View Recommendations
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="text-center text-gray-500 py-4 border"
                >
                  No product price records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
          <span>
            Showing{" "}
            <span className="font-semibold text-gray-800">
              {(currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-800">
              {Math.min(currentPage * pageSize, filtered.length)}
            </span>{" "}
            of {filtered.length} entries
          </span>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showIcons
          />
        </div>
      )}

      {/* MODALS */}
      <ProductPriceFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        price={editTarget}
      />

      <ViewRecommendedModal
        show={viewModal}
        onClose={() => setViewModal(false)}
        productId={selectedProductId}
      />
    </div>
  );
}
