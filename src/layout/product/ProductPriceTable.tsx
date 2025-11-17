import { useState, useMemo } from "react";
import { Pencil, XCircle } from "lucide-react";
import Swal from "sweetalert2";
import ProductPriceFormModal from "../../components/product/ProductPriceFormModal";
import { usePricesContext } from "../../context/PricesContext";
import type { ProductPrice } from "../../types/pricingTypes";
import { Button, TextInput } from "flowbite-react";

export default function ProductPriceTable() {
  const { prices, removePrice } = usePricesContext();

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<ProductPrice | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filtered = useMemo(
    () =>
      prices.filter((p) =>
        p.productName.toLowerCase().includes(search.toLowerCase())
      ),
    [prices, search]
  );

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const handleEdit = (index: number) => {
    const price = paginated[index];
    if (!price) return;
    setEditTarget(price);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditTarget(null);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete Price Record?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      await removePrice(id);
      Swal.fire("Deleted!", "Price record removed.", "success");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Product Price Monitoring</h2>
        <button
          onClick={handleAdd}
          className="px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-md"
        >
          + Set Product Price
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-4">
        <TextInput
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm text-left text-gray-700">
          <thead className="bg-emerald-600 text-gray-100">
            <tr>
              <th className="p-3 border border-gray-300 font-medium">Product</th>
              <th className="p-3 border border-gray-300 font-medium">Base Price</th>
              <th className="p-3 border border-gray-300 font-medium">Tax (%)</th>
              <th className="p-3 border border-gray-300 font-medium">Discount</th>
              <th className="p-3 border border-gray-300 font-medium">
                Effective Date
              </th>
              <th className="p-3 border border-gray-300 font-medium text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {paginated.length > 0 ? (
              paginated.map((p, index) => (
                <tr key={p.priceId ?? index} className="hover:bg-gray-100">
                  <td className="p-3 border border-gray-300 align-middle">
                    {p.productName}
                  </td>
                  <td className="p-3 border border-gray-300 align-middle">
                    ₱{p.basePrice.toFixed(2)}
                  </td>
                  <td className="p-3 border border-gray-300 align-middle">
                    {p.taxPercentage}%
                  </td>
                  <td className="p-3 border border-gray-300 align-middle">
                    {p.discountCategory === "PROMO"
                      ? `${p.discountPercentage}% Promo`
                      : p.discountCategory}
                  </td>
                  <td className="p-3 border border-gray-300 align-middle">
                    {p.effectiveDate}
                  </td>

                  {/* ACTION BUTTONS */}
                  <td className="p-3 border border-gray-300 align-middle">
                    <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                      {/* ✏️ Edit */}
                      <button
                        className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-yellow-500 hover:bg-yellow-600 rounded-md"
                        onClick={() => handleEdit(index)}
                      >
                        <Pencil className="w-4 h-4" /> Update
                      </button>

                      {/* ❌ Delete */}
                      <button
                        className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded-md"
                        onClick={() => handleDelete(p.priceId)}
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
                  colSpan={6}
                  className="text-center py-4 text-gray-500 border border-gray-300"
                >
                  No product price records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            <Button
              size="xs"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </Button>
            <span className="text-sm flex items-center">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              size="xs"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Modal */}
      <ProductPriceFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        price={editTarget}
      />
    </div>
  );
}
