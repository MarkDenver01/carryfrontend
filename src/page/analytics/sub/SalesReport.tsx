/* ============================================================
   SUPER-CLEAN & PREMIUM SALES REPORT (NO STRUCTURE CHANGES)
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

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

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative p-6 md:p-8 flex flex-col gap-10 overflow-hidden"
    >
      {/* ---------------- BACKGROUND GRID HUD ---------------- */}
      <div className="absolute inset-0 pointer-events-none -z-30">
        <div className="w-full h-full opacity-40 bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:44px_44px]" />

        {/* Soft glow animated blobs */}
        <motion.div
          className="absolute -top-20 -left-10 h-64 w-64 bg-emerald-500/20 blur-3xl"
          animate={{
            x: [0, 25, -10, 15, 0],
            y: [0, -10, 20, -12, 0],
            borderRadius: ["40%", "55%", "60%", "50%", "40%"],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute bottom-[-6rem] right-0 h-72 w-72 bg-sky-400/20 blur-3xl"
          animate={{
            x: [0, -20, 12, -10, 0],
            y: [0, 20, -15, 10, 0],
            borderRadius: ["50%", "65%", "55%", "70%", "50%"],
          }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* ---------------- SPOTLIGHT FOLLOW CURSOR ---------------- */}
      <motion.div
        className="absolute inset-0 pointer-events-none -z-20"
        style={{
          background: `radial-gradient(550px at ${cursorPos.x}px ${cursorPos.y}px, rgba(16,185,129,0.18), transparent 70%)`,
        }}
      />

      {/* ---------------- HEADER ---------------- */}
      <div className="relative">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-500 bg-clip-text text-transparent">
          Sales Report
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Enhanced analytics of category and product performance.
        </p>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "90px" }}
          transition={{ duration: 0.5 }}
          className="mt-3 h-[3px] bg-gradient-to-r from-emerald-400 to-transparent rounded-full"
        />
      </div>

      {/* ---------------- MAIN HUD WRAPPER ---------------- */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative rounded-[26px] border border-emerald-500/25 bg-white/90 shadow-[0_22px_60px_rgba(15,23,42,0.35)] p-6 backdrop-blur-md"
      >
        {/* ---------------- SUMMARY CARDS (SWAPPED ORDER) ---------------- */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 🔄 SWAPPED: TOP CATEGORY FIRST */}
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

        {/* ---------------- CHARTS GRID ---------------- */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <Bar
                  dataKey="value"
                  radius={[10, 10, 10, 10]}
                  style={{
                    filter: "drop-shadow(0px 6px 8px rgba(0,0,0,0.12))",
                  }}
                >
                  <LabelList
                    dataKey="value"
                    position="right"
                    style={{ fill: "#374151", fontSize: 12 }}
                  />

                  {categoryData.map((c, i) => (
                    <Cell key={i} fill={c.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </AnalyticsCard>

          <AnalyticsCard
            title="Top Selling Products"
            subtitle="Visual breakdown of sales distribution."
            icon={<TagIcon className="w-5 h-5 text-indigo-600" />}
          >
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={topProducts}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  innerRadius={45}
                  label
                  style={{
                    filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.18))",
                  }}
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
      </motion.div>
    </motion.div>
  );
}

/* ============================================================
   SUMMARY CARD COMPONENT (PRETTIER)
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
   ANALYTICS CARD COMPONENT (PRETTIER)
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
      className="relative p-6 rounded-2xl border border-gray-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.25)] hover:shadow-[0_26px_70px_rgba(15,23,42,0.3)] transition-shadow duration-300"
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
