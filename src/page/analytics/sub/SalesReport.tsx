import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LabelList
} from "recharts";
import { Package, Tag, TrendingUp, Activity } from "lucide-react";

export default function SalesReport() {
    const totalSales = 40732;
    const mostSalesCategory = 5756;

    const categoryData = [
        { name: "Beverages", value: 1200, fill: "#3B82F6" },
        { name: "Snacks", value: 1800, fill: "#F59E0B" },
        { name: "Wines", value: 3100, fill: "#A855F7" },
        { name: "Sweets", value: 2700, fill: "#EC4899" },
        { name: "Milks", value: 5400, fill: "#10B981" },
        { name: "Cigars", value: 3900, fill: "#6B7280" },
        { name: "Condiments", value: 4500, fill: "#EAB308" },
        { name: "Canned Goods", value: 4600, fill: "#22C55E" },
        { name: "Laundry", value: 3700, fill: "#06B6D4" },
    ];

    const topProducts = [
        { name: "Bear Brand", value: 3000, fill: "#4CAF50" },
        { name: "Argentina Corned Beef", value: 2500, fill: "#FFEB3B" },
        { name: "Tide Powder", value: 1800, fill: "#BDBDBD" },
        { name: "Marlboro Red", value: 1600, fill: "#F44336" },
        { name: "Piattos Cheese", value: 1400, fill: "#03A9F4" },
    ];

    return (
        <div className="p-6 flex flex-col gap-8">

            {/* HEADER */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-xl text-white">
                <h1 className="text-3xl font-bold">Sales Reports & Analytics</h1>
                <p className="opacity-90 mt-1 text-sm">
                    Comprehensive overview of product and category performance.
                </p>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Total Sales Card */}
                <div className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition border border-gray-200 backdrop-blur-lg">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-green-100 text-green-600 rounded-full shadow">
                            <Package size={48} />
                        </div>
                        <div>
                            <h2 className="text-gray-700 font-semibold text-sm">Total Product Sales</h2>
                            <p className="text-4xl font-bold text-gray-800">
                                {totalSales.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Most Sales Category */}
                <div className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition border border-gray-200 backdrop-blur-lg">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-amber-100 text-amber-600 rounded-full shadow">
                            <Tag size={48} />
                        </div>
                        <div>
                            <h2 className="text-gray-700 font-semibold text-sm">Top Sales Category</h2>
                            <p className="text-4xl font-bold text-gray-800">
                                {mostSalesCategory.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Insights Card */}
                <div className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition border border-gray-200 backdrop-blur-lg">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-indigo-100 text-indigo-600 rounded-full shadow">
                            <TrendingUp size={48} />
                        </div>
                        <div>
                            <h2 className="text-gray-700 font-semibold text-sm">Growth Rate (Est.)</h2>
                            <p className="text-4xl font-bold text-indigo-600">+12%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ANALYTICS CHARTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* BAR CHART */}
                <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-600" />
                        Sales by Category
                    </h2>

                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart
                            data={categoryData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                        >
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" />
                            <Tooltip cursor={{ fill: "#f0fdf4" }} />
                            <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                                <LabelList dataKey="value" position="right" style={{ fill: "#444" }} />
                                {categoryData.map((entry, index) => (
                                    <Cell key={`bar-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* PIE CHART */}
                <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-indigo-600" />
                        Top 5 Products
                    </h2>

                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie
                                data={topProducts}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={80}
                                innerRadius={45}
                                labelLine={false}
                                label={({ name }) => name}
                            >
                                {topProducts.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="mt-4 space-y-1">
                        {topProducts.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                                <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: item.fill }}
                                />
                                {item.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
