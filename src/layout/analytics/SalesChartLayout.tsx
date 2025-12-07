import { useState, useEffect, useMemo } from "react";
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
import { getSalesReport } from "../../libs/ApiGatewayDatasource";

type RangeType = "date" | "month" | "year";

export default function SalesChartLayout() {
  const [filter, setFilter] = useState<RangeType>("month");
  const [data, setData] = useState<{ label: string; totalSales: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");

      try {
        const res = await getSalesReport(filter);

        const formatted = res.map((item: any) => ({
          label: item.label,
          totalSales: Number(item.totalSales || 0),
        }));

        setData(formatted);
      } catch (err: any) {
        console.error("❌ Sales chart load error:", err);
        setError("Failed to load sales data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [filter]);

  // ✅ AUTO WIDTH BASED ON DATA COUNT
  const dynamicWidth = useMemo(() => {
    if (data.length <= 6) return "100%";
    if (data.length <= 20) return data.length * 90;
    if (data.length <= 100) return data.length * 60;
    return data.length * 40; // ✅ FOR 1000+ ITEMS
  }, [data.length]);

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
          <DropdownItem onClick={() => setFilter("date")}>Last 7 Days</DropdownItem>
          <DropdownItem onClick={() => setFilter("month")}>Last 6 Months</DropdownItem>
          <DropdownItem onClick={() => setFilter("year")}>Last 3 Years</DropdownItem>
        </Dropdown>
      </div>

      {/* Graph Card */}
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">
          {filterLabel(filter)}
        </h3>

        {loading && (
          <div className="text-center py-10 text-gray-500">Loading chart...</div>
        )}

        {!loading && error && (
          <div className="text-center py-10 text-red-500">{error}</div>
        )}

        {/* ✅ AUTO SCROLL + AUTO EXPAND */}
        {!loading && !error && data.length > 0 && (
          <div className="overflow-x-auto">
            <div style={{ minWidth: dynamicWidth }}>
              <ResponsiveContainer width="100%" height={330}>
                {filter === "year" ? (
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
                )}
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            No sales data available.
          </div>
        )}
      </div>
    </div>
  );
}

function filterLabel(filter: RangeType) {
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
