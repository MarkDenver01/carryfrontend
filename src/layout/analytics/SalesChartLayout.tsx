import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { Dropdown, DropdownItem } from "flowbite-react";

const dummyData = {
    date: [
        { label: "Jun 1", salesA: 4000, salesB: 3200 },
        { label: "Jun 2", salesA: 3000, salesB: 2800 },
        { label: "Jun 3", salesA: 2000, salesB: 2100 },
        { label: "Jun 4", salesA: 2780, salesB: 2600 },
        { label: "Jun 5", salesA: 1890, salesB: 2200 },
    ],
    month: [
        { label: "Jan", salesA: 10000, salesB: 7000 },
        { label: "Feb", salesA: 15000, salesB: 12000 },
        { label: "Mar", salesA: 8000, salesB: 6000 },
        { label: "Apr", salesA: 12000, salesB: 11000 },
        { label: "May", salesA: 18000, salesB: 15000 },
        { label: "Jun", salesA: 17241, salesB: 16000 },
    ],
    year: [
        { label: "2021", salesA: 24000, salesB: 20000 },
        { label: "2022", salesA: 30000, salesB: 27000 },
        { label: "2023", salesA: 34241, salesB: 31000 },
        { label: "2024", salesA: 37241, salesB: 35000 },
    ],
};

export default function SalesChartLayout() {
    const [filter, setFilter] = useState<"date" | "month" | "year">("month");

    const data = dummyData[filter];

    return (
        <div className="p-6 rounded-2xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <span className="bg-green-200 text-green-900 font-semibold text-sm px-4 py-1 rounded-full shadow-sm">
                    Sales Chart
                </span>
                <Dropdown
                    dismissOnClick={true}
                    renderTrigger={() => (
                        <button className="flex items-center gap-2 border border-green-500 bg-green-100 text-green-900 font-semibold text-sm px-4 py-1 rounded-full shadow-sm">
                            {filterLabel(filter)}
                            <ChevronDown className="w-4 h-4 text-black" />
                        </button>
                    )}
                >
                    <DropdownItem onClick={() => setFilter("date")}>By Date</DropdownItem>
                    <DropdownItem onClick={() => setFilter("month")}>By Month</DropdownItem>
                    <DropdownItem onClick={() => setFilter("year")}>By Year</DropdownItem>
                </Dropdown>

            </div>

            {/* Two Charts Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chart A */}
                <div className="bg-white p-4 rounded-xl shadow">
                    <h3 className="text-lg font-semibold mb-2">Product A</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="salesA" fill="#60a5fa" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Chart B */}
                <div className="bg-white p-4 rounded-xl shadow">
                    <h3 className="text-lg font-semibold mb-2">Product B</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="salesB" fill="#34d399" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
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
