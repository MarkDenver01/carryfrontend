import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { Dropdown, DropdownItem } from "flowbite-react";

// TOTAL SALES DUMMY DATA (WALANG PRODUCT A/B)
const dummyData = {
    date: [
        { label: "Jun 1", totalSales: 4000 },
        { label: "Jun 2", totalSales: 3000 },
        { label: "Jun 3", totalSales: 2000 },
        { label: "Jun 4", totalSales: 2780 },
        { label: "Jun 5", totalSales: 1890 },
        { label: "Jun 6", totalSales: 3500 },
        { label: "Jun 7", totalSales: 4200 },
    ],
    month: [
        { label: "Jan", totalSales: 10000 },
        { label: "Feb", totalSales: 15000 },
        { label: "Mar", totalSales: 8000 },
        { label: "Apr", totalSales: 12000 },
        { label: "May", totalSales: 18000 },
        { label: "Jun", totalSales: 17241 },
    ],
    year: [
        { label: "2022", totalSales: 240000 },
        { label: "2023", totalSales: 300000 },
        { label: "2024", totalSales: 342410 },
        { label: "2025", totalSales: 372410 },
    ],
};

export default function SalesChartLayout() {
    const [filter, setFilter] = useState<"date" | "month" | "year">("month");
    const data = dummyData[filter];

    return (
        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur shadow-md">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <span className="bg-emerald-200 text-emerald-900 font-semibold text-sm px-4 py-1 rounded-full shadow-sm">
                    Total Sales Chart
                </span>

                <Dropdown
                    dismissOnClick={true}
                    renderTrigger={() => (
                        <button className="flex items-center gap-2 border border-emerald-500 bg-emerald-100 text-emerald-900 font-semibold text-sm px-4 py-1 rounded-full shadow-sm">
                            {filterLabel(filter)}
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    )}
                >
                    <DropdownItem onClick={() => setFilter("date")}>By Date</DropdownItem>
                    <DropdownItem onClick={() => setFilter("month")}>By Month</DropdownItem>
                    <DropdownItem onClick={() => setFilter("year")}>By Year</DropdownItem>
                </Dropdown>
            </div>

            {/* SINGLE PREMIUM GRAPH */}
            <div className="bg-white p-4 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">
                    {filterLabel(filter)}
                </h3>

                <ResponsiveContainer width="100%" height={330}>
                    {
                        filter === "year" ? (
                            // LINE CHART FOR YEARLY OVERVIEW
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                                <XAxis dataKey="label" />
                                <YAxis />
                                <Tooltip formatter={(val) => `₱${val.toLocaleString()}`} />
                                <Line
                                    type="monotone"
                                    dataKey="totalSales"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ r: 4 }}
                                />
                            </LineChart>
                        ) : (
                            // BAR CHART FOR DAILY & MONTHLY
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                                <XAxis dataKey="label" />
                                <YAxis />
                                <Tooltip formatter={(val) => `₱${val.toLocaleString()}`} />
                                <Bar
                                    dataKey="totalSales"
                                    fill="#10b981"
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        )
                    }
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function filterLabel(filter: string) {
    switch (filter) {
        case "date":
            return "Last 7 Days";
        case "month":
            return "Last 6 Months";
        case "year":
            return "Last 3 Years";
        default:
            return "Filter";
    }
}
