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

import {
    Package,
    Tag as TagIcon,
    TrendingUp,
    BarChart3
} from "lucide-react";

import { motion } from "framer-motion";

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
        <div className="p-6 flex flex-col gap-10">

            {/* HEADER */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 p-7 rounded-3xl shadow-xl text-white"
            >
                {/* floating glow */}
                <motion.div
                    className="absolute inset-0 bg-white/10 blur-3xl"
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 6, repeat: Infinity }}
                />

                <h1 className="text-3xl font-extrabold tracking-tight drop-shadow">
                    Sales Reports & Analytics
                </h1>
                <p className="opacity-90 mt-1 text-sm">
                    Comprehensive overview of product and category performance.
                </p>
            </motion.div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* TOTAL SALES */}
                <motion.div
                    whileHover={{ scale: 1.03, y: -5 }}
                    className="p-6 bg-white/90 rounded-2xl shadow-lg hover:shadow-2xl border backdrop-blur-xl border-emerald-200 relative overflow-hidden"
                >
                    <motion.div
                        className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/20 blur-3xl"
                        animate={{ scale: [1, 1.4, 1] }}
                        transition={{ duration: 6, repeat: Infinity }}
                    />

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full shadow">
                            <Package size={48} />
                        </div>
                        <div>
                            <h2 className="text-gray-700 font-semibold text-sm">
                                Total Product Sales
                            </h2>
                            <p className="text-4xl font-extrabold text-gray-900">
                                {totalSales.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* TOP SALES CATEGORY */}
                <motion.div
                    whileHover={{ scale: 1.03, y: -5 }}
                    className="p-6 bg-white/90 rounded-2xl shadow-lg hover:shadow-2xl border backdrop-blur-xl border-amber-200 relative"
                >
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-4 bg-amber-100 text-amber-600 rounded-full shadow">
                            <TagIcon size={48} />
                        </div>
                        <div>
                            <h2 className="text-gray-700 font-semibold text-sm">
                                Top Sales Category
                            </h2>
                            <p className="text-4xl font-extrabold text-gray-900">
                                {mostSalesCategory.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* GROWTH RATE */}
                <motion.div
                    whileHover={{ scale: 1.03, y: -5 }}
                    className="p-6 bg-white/90 rounded-2xl shadow-lg hover:shadow-2xl border backdrop-blur-xl border-indigo-200"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-indigo-100 text-indigo-600 rounded-full shadow">
                            <TrendingUp size={48} />
                        </div>
                        <div>
                            <h2 className="text-gray-700 font-semibold text-sm">
                                Growth Rate (Est.)
                            </h2>
                            <p className="text-4xl font-extrabold text-indigo-600">
                                +12%
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* CHARTS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* BAR CHART */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition border border-gray-200 backdrop-blur-lg"
                >
                    <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-emerald-600" />
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
                                    <Cell key={index} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* PIE CHART */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition border border-gray-200 backdrop-blur-lg"
                >
                    <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <TagIcon className="w-5 h-5 text-indigo-600" />
                        Top 5 Products
                    </h2>

                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie
                                data={topProducts}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={45}
                                outerRadius={80}
                                label
                                labelLine={false}
                            >
                                {topProducts.map((entry, index) => (
                                    <Cell key={index} fill={entry.fill} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    {/* LEGEND */}
                    <div className="mt-4 space-y-2">
                        {topProducts.map((item, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ x: 6 }}
                                className="flex items-center gap-2 text-sm text-gray-700"
                            >
                                <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: item.fill }}
                                />
                                {item.name}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
