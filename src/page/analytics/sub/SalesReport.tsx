/* ============================================================
   SUPER-CLEAN & PREMIUM SALES REPORT (TIME-RANGE + BACKEND)
============================================================ */

import React, { useState, useMemo, useEffect } from "react";
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
  LabelList,
} from "recharts";

import { Package, Tag as TagIcon, Activity, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ⬇️ IMPORT API TYPE & FUNCTION
import {
  getSalesAnalytics,
  type TimeRangeId,
  type SalesAnalyticsResponseDTO,
} from "../../../libs/ApiGatewayDatasource";

/* ============================================================
   TYPES
============================================================ */

type SummaryCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
  color: "emerald" | "amber";
};

type AnalyticsCardProps = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
};

type TimeRangeOption = {
  id: TimeRangeId;
  label: string;
  description: string;
};

type CategoryChartItem = {
  name: string;
  value: number;
  fill: string;
};

type ProductChartItem = {
  name: string;
  value: number;
  fill: string;
};

/* ============================================================
   CONSTS
============================================================ */

const TIME_RANGES: TimeRangeOption[] = [
  { id: "7d", label: "Last 7 Days", description: "Performance grouped by transaction date." },
  { id: "6m", label: "Last 6 Months", description: "Mid-term performance grouped by month." },
  { id: "3y", label: "Last 3 Years", description: "Long-term trend grouped by year." },
];

// Simple color palettes – umiikot lang sa categories/products
const CATEGORY_COLORS = [
  "#3B82F6", // blue
  "#F59E0B", // amber
  "#A855F7", // purple
  "#EC4899", // pink
  "#10B981", // emerald
  "#6B7280", // gray
  "#EAB308", // yellow
  "#22C55E", // green
  "#06B6D4", // cyan
];

const PRODUCT_COLORS = [
  "#4CAF50",
  "#FFEB3B",
  "#BDBDBD",
  "#F44336",
  "#03A9F4",
  "#8B5CF6",
  "#F97316",
];

/* ============================================================
   MAIN COMPONENT (WITH BACKEND INTEGRATION)
============================================================ */

export default function SalesReportUpgraded() {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [selectedRange, setSelectedRange] = useState<TimeRangeOption>(TIME_RANGES[0]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 🔥 NEW: State for backend data
  const [categoryData, setCategoryData] = useState<CategoryChartItem[]>([]);
  const [topProducts, setTopProducts] = useState<ProductChartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- SPOTLIGHT ---------------- */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  /* ---------------- FETCH SALES ANALYTICS FROM BACKEND ---------------- */
  useEffect(() => {
    let isMounted = true;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const data: SalesAnalyticsResponseDTO = await getSalesAnalytics(selectedRange.id);

        if (!isMounted) return;

        // Map categorySales → Recharts data
        const mappedCategories: CategoryChartItem[] =
          data.categorySales?.map((c, idx) => ({
            name: c.categoryName,
            value: Number(c.totalSales ?? 0),
            fill: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
          })) ?? [];

        // Map productSales → Recharts data (top products)
        const mappedProducts: ProductChartItem[] =
          data.productSales?.map((p, idx) => ({
            name: p.productName,
            value: Number(p.totalSales ?? 0),
            fill: PRODUCT_COLORS[idx % PRODUCT_COLORS.length],
          })) ?? [];

        setCategoryData(mappedCategories);
        setTopProducts(mappedProducts);
      } catch (err: any) {
        console.error("❌ Error loading sales analytics:", err);
        if (isMounted) {
          setError(err?.message || "Failed to load sales analytics");
          setCategoryData([]);
          setTopProducts([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAnalytics();

    return () => {
      isMounted = false;
    };
  }, [selectedRange.id]);

  /* ---------------- DERIVED VALUES ---------------- */

  const totalProductSales = useMemo(
    () => topProducts.reduce((sum, p) => sum + (p.value || 0), 0),
    [topProducts]
  );

  const topCategorySales = useMemo(
    () => categoryData.reduce((max, c) => (c.value > max ? c.value : max), 0),
    [categoryData]
  );

  const hasData = categoryData.length > 0 || topProducts.length > 0;

  /* ============================================================
      FINAL RENDER
  ============================================================= */

  return (
    <div className="relative overflow-hidden" onMouseMove={handleMouseMove}>
      {/* NON-RE-RENDERING SPOTLIGHT */}
      <motion.div
        className="absolute inset-0 pointer-events-none -z-20"
        style={{
          background: `radial-gradient(550px at ${cursorPos.x}px ${cursorPos.y}px,
          rgba(16,185,129,0.18), transparent 70%)`,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="p-6 md:p-8 flex flex-col gap-10"
      >
        {/* ---------------- HEADER ---------------- */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-500 bg-clip-text text-transparent">
              Sales Report
            </h1>
            <p className="text-sm text-gray-500">
              Enhanced analytics of category and product performance.
            </p>
            <p className="text-xs text-emerald-700/90 font-medium mt-1">
              {selectedRange.label} •{" "}
              <span className="text-gray-500">{selectedRange.description}</span>
            </p>
          </div>

          {/* FILTER */}
          <TimeRangeFilter
            selectedRange={selectedRange}
            setSelectedRange={setSelectedRange}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
          />
        </div>

        {/* ---------------- MAIN WRAPPER ---------------- */}
        <div className="rounded-[26px] border border-emerald-500/25 bg-white/90 shadow-xl p-6 backdrop-blur-md">
          {/* LOADING / ERROR STATES */}
          {loading && (
            <div className="text-sm text-gray-500 mb-4">
              Loading sales analytics...
            </div>
          )}
          {error && (
            <div className="text-sm text-red-500 mb-4">
              {error}
            </div>
          )}

          {/* SUMMARY CARDS */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <SummaryCard
              icon={<TagIcon size={44} />}
              label="Top Sales Category"
              value={`₱ ${topCategorySales.toLocaleString()}`}
              accent="Most Top Sales Product Category"
              color="amber"
            />

            <SummaryCard
              icon={<Package size={44} />}
              label="Total Product Sales"
              value={`₱ ${totalProductSales.toLocaleString()}`}
              accent="Overall Top Selling Products"
              color="emerald"
            />
          </section>

          {/* CHARTS */}
          {hasData ? (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ------------ CATEGORY BAR CHART ------------ */}
              <AnalyticsCard
                title="Category Performance"
                subtitle="Revenue contribution per category for the selected time range."
                icon={<Activity className="w-5 h-5 text-emerald-600" />}
              >
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={categoryData}
                    layout="vertical"
                    margin={{ top: 5, right: 25, left: 80 }}
                  >
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip
                      formatter={(value: any) =>
                        `₱ ${Number(value).toLocaleString()}`
                      }
                    />

                    <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                      <LabelList
                        dataKey="value"
                        position="right"
                        formatter={(value: any) =>
                          `₱ ${Number(value).toLocaleString()}`
                        }
                      />
                      {categoryData.map((c, i) => (
                        <Cell key={i} fill={c.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </AnalyticsCard>

              {/* ------------ PIE CHART ------------ */}
              <AnalyticsCard
                title="Top Selling Products"
                subtitle="Percentage distribution of top-performing SKUs."
                icon={<TagIcon className="w-5 h-5 text-indigo-600" />}
              >
                {topProducts.length > 0 && totalProductSales > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={topProducts.map((p) => ({
                            ...p,
                            percent: ((p.value / totalProductSales) * 100).toFixed(1),
                          }))}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={90}
                          innerRadius={45}
                          labelLine={false}
                          label={(entry: any) => `${entry.percent}%`}
                        >
                          {topProducts.map((p, i) => (
                            <Cell key={i} fill={p.fill} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="mt-4 space-y-2">
                      {topProducts.map((p, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ background: p.fill }}
                            />
                            <span>{p.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            ₱ {p.value.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500">
                    No product sales data found for this time range.
                  </div>
                )}
              </AnalyticsCard>
            </section>
          ) : (
            !loading && (
              <div className="text-center text-sm text-gray-500 py-8">
                No sales data found for this time range.
              </div>
            )
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ============================================================
   TIME RANGE DROPDOWN (same as before)
============================================================ */

function TimeRangeFilter({
  selectedRange,
  setSelectedRange,
  isFilterOpen,
  setIsFilterOpen,
}: any) {
  return (
    <div className="relative md:self-start">
      <motion.button
        type="button"
        onClick={() => setIsFilterOpen((prev: boolean) => !prev)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium shadow-md"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-200 shadow-sm" />
        {selectedRange.label}
        <ChevronDown className="w-4 h-4 opacity-90" />
      </motion.button>

      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 8 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute right-0 mt-1 w-60 rounded-2xl bg-white shadow-2xl border overflow-hidden z-20"
          >
            <div className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wide text-emerald-700/70 bg-emerald-50">
              Time Range
            </div>

            <div className="py-1">
              {TIME_RANGES.map((range) => {
                const isActive = range.id === selectedRange.id;

                return (
                  <button
                    key={range.id}
                    onClick={() => {
                      setSelectedRange(range);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm flex flex-col ${
                      isActive ? "bg-emerald-50 text-emerald-800" : "hover:bg-emerald-50/70"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isActive ? "bg-emerald-500" : "bg-gray-300"
                        }`}
                      />
                      <span className="font-medium">{range.label}</span>
                    </span>

                    <span className="text-[11px] text-gray-500">
                      {range.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   SUMMARY CARD & ANALYTICS CARD
   (same as sa code mo, no changes)
============================================================ */

function SummaryCard({ icon, label, value, accent, color }: SummaryCardProps) {
  const bg = {
    emerald: "from-emerald-500 to-emerald-700",
    amber: "from-amber-500 to-amber-700",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -6,
        scale: 1.04,
        boxShadow: "0 28px 65px rgba(15,23,42,0.35)",
      }}
      transition={{ duration: 0.35 }}
      className={`relative p-5 rounded-2xl text-white border border-white/20 bg-gradient-to-br ${bg[color]} shadow-xl`}
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/25 rounded-xl shadow-inner">{icon}</div>

        <div>
          <p className="text-xs opacity-90">{label}</p>
          <p className="text-3xl font-extrabold tracking-tight">{value}</p>
          <p className="text-[0.75rem] text-white/85 mt-1">{accent}</p>
        </div>
      </div>
    </motion.div>
  );
}

function AnalyticsCard({ title, subtitle, icon, children }: AnalyticsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative p-6 rounded-2xl border border-gray-200 bg-white shadow-xl"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center shadow-inner">
          {icon}
        </div>

        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>

      <p className="text-sm text-gray-500 mb-4">{subtitle}</p>

      {children}
    </motion.div>
  );
}
