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
import { Pencil, Trash2, Plus } from "lucide-react";

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

    const uniqueCategories = Array.from(new Set(allProducts.map(p => p.category)));

    const handleAddRule = () => {
        const selectedProduct = allProducts.find(p => p.name === newRule.product);
        const newEntry: RecommendationRule = {
            id: Date.now(),
            ...newRule,
            category: selectedProduct?.category || "Unknown",
        };
        setRules([...rules, newEntry]);
        setIsModalOpen(false);
        setNewRule({ product: "", recommended: [], effectiveDate: "", expiryDate: "" });
    };

    const handleDelete = (id: number) => {
        setRules((prev) => prev.filter((r) => r.id !== id));
    };

    const filteredRules = useMemo(() => {
        return rules.filter((r) => {
            const matchesSearch = r.product.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = selectedCategory === "" || r.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [rules, search, selectedCategory]);

    return (
        <div className="p-6 bg-white rounded shadow-md">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
                <div className="flex gap-2">
                    <TextInput
                        placeholder="Search Product..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-64"
                    />
                    <Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-48"
                    >
                        <option value="">All Categories</option>
                        {uniqueCategories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </Select>
                </div>
                <Button color="blue" onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add Rule
                </Button>
            </div>

            <table className="w-full border border-gray-300 text-sm text-left text-gray-100">
                <thead className="bg-emerald-600">
                <tr>
                    <th className="p-3 border">Status</th>
                    <th className="p-3 border">Product</th>
                    <th className="p-3 border">Recommended Products</th>
                    <th className="p-3 border">Date Added</th>
                    <th className="p-3 border">Actions</th>
                </tr>
                </thead>
                <tbody>
                {filteredRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-gray-100">
                        <td className="p-3 border text-green-600">Active</td>
                        <td className="p-3 border font-semibold">{rule.product}</td>
                        <td className="p-3 border">{rule.recommended.join(", ")}</td>
                        <td className="p-3 border">{rule.effectiveDate} → {rule.expiryDate}</td>
                        <td className="p-3 border">
                            <div className="flex gap-2">
                                <Button size="xs" color="warning">
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <Button size="xs" color="failure" onClick={() => handleDelete(rule.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </td>
                    </tr>
                ))}
                {filteredRules.length === 0 && (
                    <tr>
                        <td colSpan={5} className="text-center p-4 text-gray-500">
                            No rules found.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>

            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ModalHeader>Add New Recommendation Rule</ModalHeader>
                <ModalBody>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="product">When Product</Label>
                            <Select
                                id="product"
                                value={newRule.product}
                                onChange={(e) => setNewRule({ ...newRule, product: e.target.value })}
                            >
                                <option value="">Select Product</option>
                                {allProducts.map((p) => (
                                    <option key={p.name} value={p.name}>{p.name}</option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="recommended">Show Recommended Product(s)</Label>
                            <Select
                                id="recommended"
                                multiple
                                value={newRule.recommended}
                                onChange={(e) =>
                                    setNewRule({
                                        ...newRule,
                                        recommended: Array.from(e.target.selectedOptions, (o) => o.value),
                                    })
                                }
                            >
                                {allProducts.map((p) => (
                                    <option key={p.name} value={p.name}>{p.name}</option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="effective">Effective Date</Label>
                            <TextInput
                                id="effective"
                                type="date"
                                value={newRule.effectiveDate}
                                onChange={(e) => setNewRule({ ...newRule, effectiveDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="expiry">Product Expiry Date</Label>
                            <TextInput
                                id="expiry"
                                type="date"
                                value={newRule.expiryDate}
                                onChange={(e) => setNewRule({ ...newRule, expiryDate: e.target.value })}
                            />
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={handleAddRule} className="bg-green-600 hover:bg-green-700">
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
