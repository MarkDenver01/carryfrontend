/* ============================================================
   SUPER-CLEAN & PREMIUM SALES REPORT (FIXED VERSION)
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

import { Package, Tag as TagIcon, Activity } from "lucide-react";
import { motion } from "framer-motion";

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

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function SalesReportUpgraded() {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const [selectedMonth, setSelectedMonth] = useState("January");
  const [selectedYear, setSelectedYear] = useState("2025");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  /* ---------------- MOCK DATA ---------------- */
  const totalSales = 40732;
  const topCategorySales = 5756;

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

  const totalProductSales = topProducts.reduce((a, b) => a + b.value, 0);

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative p-6 md:p-8 flex flex-col gap-10 overflow-hidden"
    >
      {/* ---------------- SPOTLIGHT BACKGROUND (fixed, uses cursorPos) ---------------- */}
      <motion.div
        className="absolute inset-0 pointer-events-none -z-20"
        style={{
          background: `radial-gradient(550px at ${cursorPos.x}px ${cursorPos.y}px, rgba(16,185,129,0.18), transparent 70%)`,
        }}
      />

      {/* ---------------- FILTERS ---------------- */}
      <div className="flex gap-4">
        <select
          className="px-3 py-2 border rounded-lg shadow-sm"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {[
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ].map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>

        <select
          className="px-3 py-2 border rounded-lg shadow-sm"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          {["2023", "2024", "2025", "2026"].map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* ---------------- HEADER ---------------- */}
      <div className="relative">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-500 bg-clip-text text-transparent">
          Sales Report – {selectedMonth} {selectedYear}
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Enhanced analytics of category and product performance.
        </p>
      </div>

      {/* ---------------- MAIN WRAPPER ---------------- */}
      <div className="rounded-[26px] border border-emerald-500/25 bg-white/90 shadow-xl p-6 backdrop-blur-md">
        {/* ============================================================
            SUMMARY CARDS — SWAPPED
        ============================================================ */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <SummaryCard
            icon={<TagIcon size={44} />}
            label="Top Sales Category"
            value={`₱ ${topCategorySales.toLocaleString()}`}
            accent="Most profitable department"
            color="amber"
          />

          <SummaryCard
            icon={<Package size={44} />}
            label="Total Product Sales"
            value={`₱ ${totalSales.toLocaleString()}`}
            accent="Overall revenue generated"
            color="emerald"
          />
        </section>

        {/* ============================================================
            CHARTS
        ============================================================ */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* -------------- CATEGORY BAR CHART (VALUE LABELS) -------------- */}
          <AnalyticsCard
            title="Category Performance"
            subtitle="Vertical bar analytics per category."
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
                    style={{ fill: "#374151", fontSize: 13 }}
                  />
                  {categoryData.map((c, i) => (
                    <Cell key={i} fill={c.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </AnalyticsCard>

          {/* -------------- PIE CHART (PERCENTAGE LABELS) -------------- */}
          <AnalyticsCard
            title="Top Selling Products"
            subtitle="Percentage distribution of top sellers."
            icon={<TagIcon className="w-5 h-5 text-indigo-600" />}
          >
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
                  label={(entry) => `${entry.percent}%`}
                >
                  {topProducts.map((p, i) => (
                    <Cell key={i} fill={p.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: p.fill }}
                  />
                  {p.name}
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
