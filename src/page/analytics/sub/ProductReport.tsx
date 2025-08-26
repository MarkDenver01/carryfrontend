import { useState, useMemo } from "react";
import { Dropdown, DropdownItem } from "flowbite-react";
import { ChevronDown } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ProductLegendLayout from "../../../layout/product/ProductLegendLayout.tsx";

dayjs.extend(relativeTime);

const productData = [
    {
        name: "Milk",
        category: "Dairy",
        stock: 120,
        expiryDate: "2025-08-10",
    },
    {
        name: "Eggs",
        category: "Poultry",
        stock: 80,
        expiryDate: "2025-07-04",
    },
    {
        name: "Bread",
        category: "Bakery",
        stock: 45,
        expiryDate: "2025-07-02",
    },
    {
        name: "Yogurt",
        category: "Dairy",
        stock: 30,
        expiryDate: "2025-07-01",
    },
    {
        name: "Chicken Breast",
        category: "Meat",
        stock: 50,
        expiryDate: "2025-07-06",
    },
];

const getDaysLeft = (date: string) => {
    const today = dayjs();
    const expiry = dayjs(date);
    return expiry.diff(today, "day");
};

const getFreshnessStatus = (daysLeft: number) => {
    if (daysLeft > 30) return { status: "Fresh", color: "bg-green-500" };
    if (daysLeft >= 7) return { status: "Moderate", color: "bg-yellow-400" };
    if (daysLeft >= 3) return { status: "Near Expiry", color: "bg-orange-400" };
    return { status: "Expiring Soon / Expired", color: "bg-red-500" };
};

export default function ProductReport() {
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [productFilter, setProductFilter] = useState("All");

    const filteredData = useMemo(() => {
        return productData.filter((item) => {
            const categoryMatch = categoryFilter === "All" || item.category === categoryFilter;
            const productMatch = productFilter === "All" || item.name === productFilter;
            return categoryMatch && productMatch;
        });
    }, [categoryFilter, productFilter]);

    const uniqueCategories = Array.from(new Set(productData.map((p) => p.category)));
    const uniqueProducts = Array.from(new Set(productData.map((p) => p.name)));

    return (
        <div className="p-6 flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Food Freshness and Expiry Reports</h1>
                <div className="flex gap-4">
                    <Dropdown
                        dismissOnClick={true}
                        renderTrigger={() => (
                            <button className="flex items-center gap-2 border border-green-500 bg-green-100 text-green-900 font-semibold text-sm px-4 py-1 rounded-full shadow-sm">
                                Category: {categoryFilter}
                                <ChevronDown className="w-4 h-4 text-black" />
                            </button>
                        )}
                    >
                        <DropdownItem onClick={() => setCategoryFilter("All")}>All</DropdownItem>
                        {uniqueCategories.map((category) => (
                            <DropdownItem key={category} onClick={() => setCategoryFilter(category)}>
                                {category}
                            </DropdownItem>
                        ))}
                    </Dropdown>

                    <Dropdown
                        dismissOnClick={true}
                        renderTrigger={() => (
                            <button className="flex items-center gap-2 border border-indigo-500 bg-indigo-100 text-indigo-900 font-semibold text-sm px-4 py-1 rounded-full shadow-sm">
                                Product: {productFilter}
                                <ChevronDown className="w-4 h-4 text-black" />
                            </button>
                        )}
                    >
                        <DropdownItem onClick={() => setProductFilter("All")}>All</DropdownItem>
                        {uniqueProducts.map((product) => (
                            <DropdownItem key={product} onClick={() => setProductFilter(product)}>
                                {product}
                            </DropdownItem>
                        ))}
                    </Dropdown>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full border border-gray-300 text-sm text-left text-gray-700">
                    <thead className="bg-emerald-600 text-gray-100">
                    <tr>
                        <th className="p-3 border border-gray-300 font-medium">Product Name</th>
                        <th className="p-3 border border-gray-300 font-medium">Category</th>
                        <th className="p-3 border border-gray-300 font-medium">Stock Qty.</th>
                        <th className="p-3 border border-gray-300 font-medium">Expiry Date</th>
                        <th className="p-3 border border-gray-300 font-medium">Days Left</th>
                        <th className="p-3 border border-gray-300 font-medium">Freshness Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredData.length > 0 ? (
                        filteredData.map((product, idx) => {
                            const daysLeft = getDaysLeft(product.expiryDate);
                            const freshness = getFreshnessStatus(daysLeft);
                            return (
                                <tr
                                    key={idx}
                                    className="hover:bg-gray-100 transition duration-150 ease-in-out"
                                >
                                    <td className="p-3 border border-gray-300 font-medium">{product.name}</td>
                                    <td className="p-3 border border-gray-300">{product.category}</td>
                                    <td className="p-3 border border-gray-300">{product.stock}</td>
                                    <td className="p-3 border border-gray-300">{product.expiryDate}</td>
                                    <td className="p-3 border border-gray-300">{daysLeft} day(s)</td>
                                    <td className="p-3 border border-gray-300">
              <span
                  className={`inline-block px-3 py-1 text-white text-xs font-semibold rounded-full ${freshness.color}`}
              >
                {freshness.status}
              </span>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td
                                colSpan={6}
                                className="text-center py-4 text-gray-500 border border-gray-300"
                            >
                                No records found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>

            </div>

            {/* Legend */}
            <ProductLegendLayout />
        </div>
    );
}
