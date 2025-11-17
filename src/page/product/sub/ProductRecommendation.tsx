import { useState, useMemo } from "react";
import {
  Modal,
  Button,
  Label,
  TextInput,
  Select,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "flowbite-react";
import {
  Pencil,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";

interface RecommendationRule {
  id: number;
  product: string;
  recommended: string[];
  effectiveDate: string;
  expiryDate: string;
  category?: string;
}

const allProducts = [
  { name: "Milk", category: "Dairy" },
  { name: "Bread", category: "Bakery" },
  { name: "Eggs", category: "Dairy" },
  { name: "Butter", category: "Dairy" },
  { name: "Cheese", category: "Dairy" },
  { name: "Juice", category: "Beverage" },
  { name: "Cereal", category: "Grains" },
  { name: "Yogurt", category: "Dairy" },
  { name: "Ham", category: "Meat" },
  { name: "Soda", category: "Beverage" },
  { name: "Water", category: "Beverage" },
  { name: "Coffee", category: "Beverage" },
  { name: "Sugar", category: "Grocery" },
];

// SORT KEYS
type SortField = "product" | "category" | "effectiveDate";

export default function ProductRecommendationRule() {
  const [rules, setRules] = useState<RecommendationRule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    product: "",
    recommended: [] as string[],
    effectiveDate: "",
    expiryDate: "",
  });

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [sortField, setSortField] = useState<SortField>("product");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const uniqueCategories = Array.from(
    new Set(allProducts.map((p) => p.category))
  );

  // SORT ICON
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <ArrowUpDown className="w-4 h-4 inline opacity-50" />;
    if (sortOrder === "asc") return <ArrowUp className="w-4 h-4 inline" />;
    return <ArrowDown className="w-4 h-4 inline" />;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // ADD RULE
  const handleAddRule = () => {
    const selectedProduct = allProducts.find(
      (p) => p.name === newRule.product
    );
    const entry: RecommendationRule = {
      id: Date.now(),
      ...newRule,
      category: selectedProduct?.category || "Unknown",
    };
    setRules((prev) => [...prev, entry]);
    setIsModalOpen(false);
    setNewRule({
      product: "",
      recommended: [],
      effectiveDate: "",
      expiryDate: "",
    });
  };

  const handleDelete = (id: number) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  // FILTER
  const filtered = useMemo(() => {
    return rules.filter((r) => {
      const matchSearch = r.product.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        selectedCategory === "" || r.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [rules, search, selectedCategory]);

  // SORT
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = String(a[sortField] ?? "").toLowerCase();
      const bVal = String(b[sortField] ?? "").toLowerCase();

      return sortOrder === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  }, [filtered, sortField, sortOrder]);

  // PAGINATION
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = sorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Product Recommendation Rules</h2>

        <Button
          color="blue"
          className="flex items-center gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4" /> Add Rule
        </Button>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-wrap gap-3 mb-4">
        <TextInput
          placeholder="Search product..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
        <Select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Categories</option>
          {uniqueCategories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </Select>
      </div>

      {/* TABLE */}
      <table className="min-w-full border border-gray-300 text-sm text-left text-gray-700">
        <thead className="bg-emerald-600 text-white">
          <tr>
            <th className="p-3 border font-medium">Status</th>

            <th
              className="p-3 border font-medium cursor-pointer select-none"
              onClick={() => handleSort("product")}
            >
              Product <SortIcon field="product" />
            </th>

            <th className="p-3 border font-medium">Recommended</th>

            <th
              className="p-3 border font-medium cursor-pointer select-none"
              onClick={() => handleSort("effectiveDate")}
            >
              Date Range <SortIcon field="effectiveDate" />
            </th>

            <th className="p-3 border font-medium text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {paginated.length > 0 ? (
            paginated.map((rule) => (
              <tr key={rule.id} className="hover:bg-gray-100">
                <td className="p-3 border text-green-600 font-semibold">
                  Active
                </td>
                <td className="p-3 border font-medium">{rule.product}</td>
                <td className="p-3 border">
                  {rule.recommended.join(", ") || "—"}
                </td>
                <td className="p-3 border">
                  {rule.effectiveDate} → {rule.expiryDate}
                </td>

                <td className="p-3 border">
                  <div className="flex justify-center gap-2">
                    <Button size="xs" color="warning">
                      <Pencil className="w-4 h-4" />
                    </Button>

                    <Button
                      size="xs"
                      color="failure"
                      onClick={() => handleDelete(rule.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={5}
                className="text-center p-4 text-gray-500 border"
              >
                No rules found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <Button
            size="xs"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </Button>

          <span className="text-sm flex items-center">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            size="xs"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}

      {/* MODAL */}
      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalHeader>Add New Recommendation Rule</ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            {/* PRODUCT */}
            <div>
              <Label htmlFor="product">When Product</Label>
              <Select
                id="product"
                value={newRule.product}
                onChange={(e) =>
                  setNewRule({ ...newRule, product: e.target.value })
                }
              >
                <option value="">Select Product</option>
                {allProducts.map((p) => (
                  <option key={p.name}>{p.name}</option>
                ))}
              </Select>
            </div>

            {/* RECOMMENDED MULTI SELECT */}
            <div>
              <Label htmlFor="recommended">Show Recommended Product(s)</Label>
              <Select
                id="recommended"
                multiple
                value={newRule.recommended}
                onChange={(e) =>
                  setNewRule({
                    ...newRule,
                    recommended: Array.from(
                      e.target.selectedOptions,
                      (o) => o.value
                    ),
                  })
                }
              >
                {allProducts.map((p) => (
                  <option key={p.name}>{p.name}</option>
                ))}
              </Select>
            </div>

            {/* EFFECTIVE DATE */}
            <div>
              <Label>Effective Date</Label>
              <TextInput
                type="date"
                value={newRule.effectiveDate}
                onChange={(e) =>
                  setNewRule({ ...newRule, effectiveDate: e.target.value })
                }
              />
            </div>

            {/* EXPIRY DATE */}
            <div>
              <Label>Expiry Date</Label>
              <TextInput
                type="date"
                value={newRule.expiryDate}
                onChange={(e) =>
                  setNewRule({ ...newRule, expiryDate: e.target.value })
                }
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleAddRule}
          >
            Add Rule
          </Button>

          <Button color="gray" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
