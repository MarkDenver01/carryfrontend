import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList
} from "recharts";
import { Package, Tag } from "lucide-react";

export default function SalesReport() {
    const totalSales = 40732;
    const mostSalesCategory = 5756;

    const categoryData = [
        { name: "Beverages", value: 1200, fill: "#00008B" },
        { name: "Snacks", value: 1800, fill: "#5C4033" },
        { name: "Wines", value: 3100, fill: "#A020F0" },
        { name: "Sweets", value: 2700, fill: "#F5F5F5" },
        { name: "Milks", value: 5400, fill: "#228B22" },
        { name: "Cigars", value: 3900, fill: "#000000" },
        { name: "Condiments", value: 4500, fill: "#FFFF00" },
        { name: "Canned Goods", value: 4600, fill: "#ADFF2F" },
        { name: "Laundry", value: 3700, fill: "#40E0D0" },
    ];

    const topProducts = [
        { name: "Bear Brand", value: 3000, fill: "#4CAF50" },
        { name: "Argentina Corned Beef", value: 2500, fill: "#FFEB3B" },
        { name: "Tide Powder", value: 1800, fill: "#BDBDBD" },
        { name: "Marlboro Red", value: 1600, fill: "#F44336" },
        { name: "Piattos Cheese", value: 1400, fill: "#03A9F4" },
    ];

    return (
        <div className="p-6 flex flex-col gap-6">
            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-800">Sales Product/Category Reports</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col justify-between gap-4 py-6 px-4 bg-emerald-600 rounded-xl shadow-lg hover:shadow-xl transition">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-green-100 text-green-600 rounded-full">
                            <Package size={64} />
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white">{totalSales.toLocaleString()}</div>
                            <div className="text-sm font-semibold text-white">Total Product Sales</div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-between gap-4 py-6 px-4 bg-amber-600 rounded-xl shadow-lg hover:shadow-xl transition">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-orange-100 text-orange-600 rounded-full">
                            <Tag size={64} />
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white">{mostSalesCategory.toLocaleString()}</div>
                            <div className="text-sm font-semibold text-white">Most Sales Category</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Sales by Category</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={categoryData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                        >
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" />
                            <Tooltip />
                            <Bar dataKey="value">
                                <LabelList dataKey="value" position="right" />
                                {categoryData.map((entry, index) => (
                                    <Cell key={`bar-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Products</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={topProducts}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={70}
                                innerRadius={40}
                                label
                            >
                                {topProducts.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <ul className="mt-4 text-sm space-y-1 text-gray-800">
                        {topProducts.map((item, index) => (
                            <li key={index} className="flex items-center gap-2">
                                <span
                                    className="w-3 h-3 inline-block rounded-full"
                                    style={{ backgroundColor: item.fill }}
                                />
                                {item.name}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
