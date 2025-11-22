import React from "react";
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

import {
  Package,
  Tag as TagIcon,
  TrendingUp,
  BarChart3,
} from "lucide-react";

import { motion } from "framer-motion";

/* ============================================================
   MAIN COMPONENT — SALES REPORT PAGE
============================================================ */

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
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative p-6 md:p-8 flex flex-col gap-8 md:gap-10"
    >
      {/* HEADER */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 p-6 md:p-7 rounded-3xl shadow-xl text-white"
      >
        <div className="absolute -top-10 -right-10 h-32 w-32 bg-white/15 rounded-full blur-3xl" />

        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Sales Reports &amp; Analytics
        </h1>
        <p className="mt-1 text-sm md:text-base text-emerald-50/95">
          Comprehensive overview of product and category performance.
        </p>

        <div className="mt-3 h-[3px] w-20 bg-gradient-to-r from-white via-emerald-100 to-transparent rounded-full" />
      </motion.header>

      {/* SUMMARY CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          icon={<Package size={38} className="text-emerald-600" />}
          label="Total Product Sales"
          value={totalSales.toLocaleString()}
          badge="All categories"
          accentColor="emerald"
        />

        <SummaryCard
          icon={<TagIcon size={38} className="text-amber-600" />}
          label="Top Sales Category"
          value={mostSalesCategory.toLocaleString()}
          badge="Best performing"
          accentColor="amber"
        />

        <SummaryCard
          icon={<TrendingUp size={38} className="text-indigo-600" />}
          label="Growth Rate (Est.)"
          value="+12%"
          badge="Last 30 days"
          accentColor="indigo"
        />
      </section>

      {/* DIVIDER */}
      <div className="border-t border-gray-200" />

      {/* CHARTS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BAR CHART */}
        <ChartCard
          title="Sales by Category"
          subtitle="Performance of each product group."
          icon={<BarChart3 className="w-5 h-5 text-emerald-600" />}
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={categoryData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip cursor={{ fill: "#f0fdf4" }} />
              <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                <LabelList
                  dataKey="value"
                  position="right"
                  style={{ fill: "#374151", fontSize: 12 }}
                />
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* PIE CHART */}
        <ChartCard
          title="Top 5 Products"
          subtitle="Highest selling SKUs."
          icon={<TagIcon className="w-5 h-5 text-indigo-600" />}
        >
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={topProducts}
                dataKey="value"
                nameKey="name"
                outerRadius={85}
                innerRadius={45}
                labelLine={false}
                label={({ name }) => name}
              >
                {topProducts.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2">
            {topProducts.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ x: 4 }}
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
        </ChartCard>
      </section>
    </motion.div>
  );
}

/* ============================================================
   SUMMARY CARD COMPONENT
============================================================ */

type SummaryCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: string;
  accentColor?: "emerald" | "amber" | "indigo";
};

function SummaryCard({
  icon,
  label,
  value,
  badge,
  accentColor = "emerald",
}: SummaryCardProps) {
  const accentClasses: Record<
    "emerald" | "amber" | "indigo",
    { ring: string; chip: string; chipText: string }
  > = {
    emerald: {
      ring: "ring-emerald-100",
      chip: "bg-emerald-50",
      chipText: "text-emerald-700",
    },
    amber: {
      ring: "ring-amber-100",
      chip: "bg-amber-50",
      chipText: "text-amber-700",
    },
    indigo: {
      ring: "ring-indigo-100",
      chip: "bg-indigo-50",
      chipText: "text-indigo-700",
    },
  };

  const accent = accentClasses[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{
        y: -4,
        scale: 1.02,
        boxShadow: "0 20px 45px rgba(15,23,42,0.18)",
      }}
      className={`relative p-5 rounded-2xl bg-white shadow-md border border-gray-200 ring-1 ${accent.ring}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center shadow-sm">
          {icon}
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {label}
          </p>

          <p className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            {value}
          </p>

          {badge && (
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[0.7rem] font-medium ${accent.chip} ${accent.chipText}`}
            >
              {badge}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   CHART CARD COMPONENT
============================================================ */

type ChartCardProps = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
};

function ChartCard({ title, subtitle, icon, children }: ChartCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-200 p-5 md:p-6 transition-all duration-200"
    >
      <div className="flex items-center gap-2 mb-2">
        {icon && (
          <div className="h-9 w-9 rounded-full bg-gray-50 flex items-center justify-center">
            {icon}
          </div>
        )}
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>

      {subtitle && (
        <p className="text-xs md:text-sm text-gray-500 mb-4">{subtitle}</p>
      )}

      <div>{children}</div>
    </motion.section>
  );
}
