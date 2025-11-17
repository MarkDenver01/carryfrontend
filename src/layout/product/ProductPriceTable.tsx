import { useState, useMemo } from "react";
import { Pencil, XCircle, Search } from "lucide-react";
import Swal from "sweetalert2";
import ProductPriceFormModal from "../../components/product/ProductPriceFormModal";
import { usePricesContext } from "../../context/PricesContext";
import type { ProductPrice } from "../../types/pricingTypes";
import { Button, Pagination } from "flowbite-react";

type SortField =
  | "productName"
  | "basePrice"
  | "taxPercentage"
  | "discountPercentage"
  | "effectiveDate";
type SortOrder = "asc" | "desc";

export default function ProductPriceTable() {
  const { prices, removePrice } = usePricesContext();

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<ProductPrice | null>(null);

  const [sortBy, setSortBy] = useState<SortField>("productName");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  /** SORT HANDLER */
  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  /** Sort icon */
  const getSortIcon = (field: SortField) => {
    if (sortBy !== field) return "⇅";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  /** FILTER */
  const filtered = useMemo(() => {
    return prices.filter((p) =>
      p.productName.toLowerCase().includes(search.toLowerCase())
    );
  }, [prices, search]);

  /** SORT */
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const valA = String(a[sortBy] ?? "").toLowerCase();
      const valB = String(b[sortBy] ?? "").toLowerCase();

      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });
  }, [filtered, sortBy, sortOrder]);

  /** PAGINATION */
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Product Price Monitoring
        </h2>

        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={handleAdd}
        >
          + Set Product Price
        </Button>
      </div>

      {/* SEARCH INPUT */}
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

      {/* TABLE WRAPPER */}
      <div className="w-full overflow-x-auto pb-2">
        <table className="min-w-[1200px] border border-gray-300 text-sm text-left text-gray-700">
          <thead className="bg-emerald-600 text-white">
            <tr>
              {[
                ["productName", "Product"],
                ["basePrice", "Base Price"],
                ["taxPercentage", "Tax (%)"],
                ["discountPercentage", "Discount"],
                ["effectiveDate", "Effective Date"],
              ].map(([field, label]) => (
                <th
                  key={field}
                  className="p-3 border border-gray-300 font-medium cursor-pointer select-none"
                  onClick={() => handleSort(field as SortField)}
                >
                  {label}{" "}
                  <span className="text-xs opacity-80">
                    {getSortIcon(field as SortField)}
                  </span>
                </th>
              ))}

              <th className="p-3 border border-gray-300 font-medium text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-gray-50">
            {paginated.length > 0 ? (
              paginated.map((p, index) => (
                <tr key={p.priceId ?? index} className="hover:bg-emerald-100">

                  <td className="p-3 border border-gray-300">{p.productName}</td>

                  <td className="p-3 border border-gray-300">
                    ₱{p.basePrice.toFixed(2)}
                  </td>

                  <td className="p-3 border border-gray-300">
                    {p.taxPercentage}%
                  </td>

                  <td className="p-3 border border-gray-300">
                    {p.discountPercentage}%{" "}
                    {p.discountCategory === "PROMO" && (
                      <span className="text-blue-600 font-medium">Promo</span>
                    )}
                  </td>

                  <td className="p-3 border border-gray-300">
                    {p.effectiveDate}
                  </td>

                  {/* ACTION BUTTONS */}
                  <td className="p-3 border border-gray-300">
                    <div className="flex justify-center gap-2 whitespace-nowrap">

                      <button
                        className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-yellow-500 hover:bg-yellow-600 rounded-md"
                        onClick={() => handleEdit(index)}
                      >
                        <Pencil className="w-4 h-4" /> Update
                      </button>

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
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mt-6 text-sm text-gray-600">

          {/* Summary */}
          <span>
            Showing{" "}
            <span className="font-semibold text-gray-800">
              {(currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-800">
              {Math.min(currentPage * pageSize, sorted.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-800">
              {sorted.length}
            </span>{" "}
            entries
          </span>

          {/* Flowbite Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showIcons
          />
        </div>
      )}

      {/* MODAL */}
      <ProductPriceFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        price={editTarget}
      />
    </div>
  );
}
