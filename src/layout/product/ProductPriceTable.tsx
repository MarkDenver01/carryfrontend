import { useState, useMemo } from "react";
import { Button, TextInput } from "flowbite-react";
import Swal from "sweetalert2";
import ProductPriceFormModal from "../../components/product/ProductPriceFormModal";
import { usePricesContext } from "../../context/PricesContext";
import type { ProductPrice } from "../../types/pricingTypes";

export default function ProductPriceTable() {
  const { prices, removePrice } = usePricesContext();

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<ProductPrice | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filtered = useMemo(() => {
    return prices.filter((p) =>
      p.productName.toLowerCase().includes(search.toLowerCase())
    );
  }, [prices, search]);

  const paginated = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
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
      text: "This will remove the price associated with the product.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      await removePrice(id);
      Swal.fire("Deleted!", "Price record has been removed.", "success");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Product Price Monitoring</h2>
        <Button
          onClick={handleAdd}
          className="px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700"
        >
          + Set Product Price
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-4">
        <TextInput
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700 border">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Base Price</th>
              <th className="p-3">Tax (%)</th>
              <th className="p-3">Discount</th>
              <th className="p-3">Effective Date</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((p, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="p-3">{p.productName}</td>
                <td className="p-3">₱{p.basePrice.toFixed(2)}</td>
                <td className="p-3">{p.taxPercentage}%</td>
                <td className="p-3">
                  {p.discountCategory === "PROMO"
                    ? `${p.discountPercentage}% Promo`
                    : p.discountCategory}
                </td>
                <td className="p-3">{p.effectiveDate}</td>
                <td className="p-3 text-center space-x-2">
                  <Button size="xs" color="blue" onClick={() => handleEdit(i)}>
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    color="red"
                    onClick={() => handleDelete(p.priceId)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
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

      {/* Pricing Modal */}
      <ProductPriceFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        price={editTarget}
      />
    </div>
  );
}
