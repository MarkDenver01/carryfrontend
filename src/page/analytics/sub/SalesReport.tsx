/* ============================================================
   SUPER-CLEAN & PREMIUM SALES REPORT (TIME-RANGE VERSION)
============================================================ */

import React, { useState } from "react";
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

type TimeRangeId = "7d" | "6m" | "3y";

type TimeRangeOption = {
  id: TimeRangeId;
  label: string;
  description: string;
};

/* ============================================================
   CONSTS
============================================================ */

const TIME_RANGES: TimeRangeOption[] = [
  {
    id: "7d",
    label: "Last 7 Days",
    description: "Performance grouped by transaction date.",
  },
  {
    id: "6m",
    label: "Last 6 Months",
    description: "Mid-term performance grouped by month.",
  },
  {
    id: "3y",
    label: "Last 3 Years",
    description: "Long-term trend grouped by year.",
  },
];

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function SalesReportUpgraded() {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [selectedRange, setSelectedRange] = useState<TimeRangeOption>(
    TIME_RANGES[0]
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  /* ---------------- BASE MOCK DATA ---------------- */
  const baseCategoryData = [
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

  const baseTopProducts = [
    { name: "Bear Brand", value: 3000, fill: "#4CAF50" },
    { name: "Argentina Corned Beef", value: 2500, fill: "#FFEB3B" },
    { name: "Tide Powder", value: 1800, fill: "#BDBDBD" },
    { name: "Marlboro Red", value: 1600, fill: "#F44336" },
    { name: "Piattos Cheese", value: 1400, fill: "#03A9F4" },
  ];

  /* ---------------- SIMPLE RANGE SCALING ----------------
     Sa actual backend, papalitan mo lang tong scaling logic
     ng tunay na aggregations per date / month / year.
  -------------------------------------------------------- */

  const rangeMultiplier = (rangeId: TimeRangeId) => {
    switch (rangeId) {
      case "7d":
        return 0.35; // maliit dahil 1 week lang
      case "6m":
        return 1.0; // base
      case "3y":
        return 3.2; // mas malaki dahil 3 years
      default:
        return 1;
    }
  };

  const multiplier = rangeMultiplier(selectedRange.id);

  const categoryData = baseCategoryData.map((c) => ({
    ...c,
    value: Math.round(c.value * multiplier),
  }));

  const topProducts = baseTopProducts.map((p) => ({
    ...p,
    value: Math.round(p.value * multiplier),
  }));

  const totalProductSales = topProducts.reduce((a, b) => a + b.value, 0);
  const totalSales = totalProductSales; // you can separate this if needed
  const topCategorySales =
    categoryData.reduce((max, c) => (c.value > max ? c.value : max), 0) || 0;

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative p-6 md:p-8 flex flex-col gap-10 overflow-hidden"
    >
      {/* ---------------- SPOTLIGHT BACKGROUND ---------------- */}
      <motion.div
        className="absolute inset-0 pointer-events-none -z-20"
        style={{
          background: `radial-gradient(550px at ${cursorPos.x}px ${cursorPos.y}px, rgba(16,185,129,0.18), transparent 70%)`,
        }}
      />

      {/* ---------------- HEADER + FILTER (RIGHT) ---------------- */}
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

        {/* Emerald-themed filter dropdown (RIGHT) */}
        <div className="relative md:self-start">
          <motion.button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            whileHover={{ scale: 1.03, boxShadow: "0 18px 40px rgba(16,185,129,0.35)" }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium shadow-md border border-emerald-300/40 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-emerald-50"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-200 shadow-sm" />
            {selectedRange.label}
            <ChevronDown className="w-4 h-4 opacity-90" />
          </motion.button>

          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 8, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 mt-1 w-60 rounded-2xl bg-white shadow-2xl border border-emerald-100/90 overflow-hidden z-20"
              >
                <div className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wide text-emerald-700/70 bg-emerald-50/80">
                  Time Range
                </div>
                <div className="py-1">
                  {TIME_RANGES.map((range) => {
                    const isActive = range.id === selectedRange.id;
                    return (
                      <button
                        key={range.id}
                        type="button"
                        onClick={() => {
                          setSelectedRange(range);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm flex flex-col gap-0.5 transition-all ${
                          isActive
                            ? "bg-emerald-50 text-emerald-800"
                            : "hover:bg-emerald-50/70 text-gray-700"
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
      </div>

      {/* ---------------- MAIN WRAPPER ---------------- */}
      <div className="rounded-[26px] border border-emerald-500/25 bg-white/90 shadow-xl p-6 backdrop-blur-md">
        {/* ============================================================
            SUMMARY CARDS
        ============================================================ */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <SummaryCard
            icon={<TagIcon size={44} />}
            label="Top Sales Category"
            value={`₱ ${topCategorySales.toLocaleString()}`}
            accent="Most profitable department for selected period"
            color="amber"
          />

          <SummaryCard
            icon={<Package size={44} />}
            label="Total Product Sales"
            value={`₱ ${totalSales.toLocaleString()}`}
            accent="Overall revenue generated in this time range"
            color="emerald"
          />
        </section>

        {/* ============================================================
            CHARTS
        ============================================================ */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* -------------- CATEGORY BAR CHART (LABELS ALWAYS VISIBLE) -------------- */}
          <AnalyticsCard
            title="Category Performance"
            subtitle="Revenue contribution per category for the selected time range."
            icon={<Activity className="w-5 h-5 text-emerald-600" />}
          >
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 5, right: 25, left: 80, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip cursor={{ fill: "#f1fdf4" }} />

                <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                  <LabelList
                    dataKey="value"
                    position="right"
                    className="fill-gray-700"
                    formatter={(value: any) => `₱ ${Number(value).toLocaleString()}`}
                  />
                  {categoryData.map((c, i) => (
                    <Cell key={i} fill={c.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </AnalyticsCard>

          {/* -------------- PIE CHART (LABELS ALWAYS VISIBLE) -------------- */}
          <AnalyticsCard
            title="Top Selling Products"
            subtitle="Percentage distribution of top-performing SKUs."
            icon={<TagIcon className="w-5 h-5 text-indigo-600" />}
          >
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={topProducts.map((p) => ({
                    ...p,
                    percent: totalProductSales
                      ? ((p.value / totalProductSales) * 100).toFixed(1)
                      : "0.0",
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
          </AnalyticsCard>
        </section>
      </div>
    </motion.div>
  );
}

/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
  icon,
  label,
  value,
  accent,
  color,
}: SummaryCardProps) {
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

/* ============================================================
   ANALYTICS CARD
============================================================ */

function AnalyticsCard({
  title,
  subtitle,
  icon,
  children,
}: AnalyticsCardProps) {
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
