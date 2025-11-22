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

import {
  Package,
  Tag as TagIcon,
  TrendingUp,
  Activity,

} from "lucide-react";

import { motion } from "framer-motion";

/* ============================================================
   SALES REPORT WITH MATCHING CUSTOMER REPORT HEADER
============================================================ */

export default function SalesReport() {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

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
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative p-6 md:p-8 flex flex-col gap-10 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* ---------- GLOBAL HUD BACKGROUND MATCHED ---------- */}
      <div className="pointer-events-none absolute inset-0 -z-30">
        <div className="w-full h-full opacity-40 mix-blend-soft-light bg-[linear-gradient(to_right,rgba(148,163,184,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.15)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Scanlines */}
        <div className="absolute inset-0 opacity-[0.08] mix-blend-soft-light bg-[repeating-linear-gradient(to_bottom,rgba(15,23,42,0.85)_0px,rgba(15,23,42,0.85)_1px,transparent_1px,transparent_3px)]" />

        {/* Ambient blobs */}
        <motion.div
          className="absolute -top-20 -left-16 h-64 w-64 bg-emerald-500/28 blur-3xl"
          animate={{
            x: [0, 20, 10, -5, 0],
            y: [0, 10, 20, 5, 0],
            borderRadius: ["45%", "60%", "55%", "65%", "45%"],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute right-0 bottom-[-5rem] h-72 w-72 bg-sky-400/24 blur-3xl"
          animate={{
            x: [0, -15, -25, -10, 0],
            y: [0, -10, -20, -5, 0],
            borderRadius: ["50%", "65%", "55%", "70%", "50%"],
          }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* ---------- CURSOR SPOTLIGHT MATCHED ---------- */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background: `radial-gradient(550px at ${cursorPos.x}px ${cursorPos.y}px, rgba(34,197,94,0.26), transparent 70%)`,
        }}
        animate={{ opacity: [0.7, 1, 0.85] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* ---------- PAGE HEADER (EXACT MATCH) ---------- */}
      <div className="relative">
        <motion.h1
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-600 bg-clip-text text-transparent"
        >
          Sales Report
        </motion.h1>

        <p className="text-gray-500 text-sm mt-1">
          Overview of category performance and top product analytics.
        </p>

        <div className="mt-3 h-[3px] w-20 bg-gradient-to-r from-emerald-400 via-emerald-500 to-transparent rounded-full" />
      </div>

      {/* ---------- MAIN HUD CONTAINER MATCHED ---------- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative rounded-[26px] border border-emerald-500/30 bg-white/90 shadow-[0_22px_70px_rgba(15,23,42,0.4)] overflow-hidden"
      >
        {/* HUD corner brackets */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-3 left-3 h-5 w-5 border-t-2 border-l-2 border-emerald-400/80" />
          <div className="absolute top-3 right-3 h-5 w-5 border-t-2 border-r-2 border-emerald-400/80" />
          <div className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-emerald-400/80" />
          <div className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-emerald-400/80" />
        </div>

        <div className="relative flex flex-col gap-10 p-5 md:p-6">
          {/* SCANNER LINE */}
          <motion.div
            className="pointer-events-none absolute top-10 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent opacity-70"
            animate={{ x: ["-20%", "20%", "-20%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* ------- SUMMARY CARDS ------- */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <SummaryCard
              icon={<Package size={44} />}
              label="Total Product Sales"
              value={totalSales.toLocaleString()}
              accent="₱ Overall revenue"
              color="emerald"
            />

            <SummaryCard
              icon={<TagIcon size={44} />}
              label="Top Sales Category"
              value={mostSalesCategory.toLocaleString()}
              accent="Best performing department"
              color="amber"
            />

            <SummaryCard
              icon={<TrendingUp size={44} />}
              label="Growth Rate"
              value="+12%"
              accent="Monthly projection"
              color="indigo"
            />
          </section>

          {/* DIVIDER */}
          <div className="relative h-px w-full bg-gradient-to-r from-transparent via-gray-300/90 to-transparent" />

          {/* ------- CHARTS GRID ------- */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnalyticsCard
              title="Sales by Category"
              subtitle="Performance of each product group."
              icon={<Activity className="w-5 h-5 text-emerald-600" />}
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
                    {categoryData.map((e, i) => (
                      <Cell key={i} fill={e.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </AnalyticsCard>

            <AnalyticsCard
              title="Top Products"
              subtitle="Highest selling items."
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
                    {topProducts.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-4 space-y-2">
                {topProducts.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    {item.name}
                  </div>
                ))}
              </div>
            </AnalyticsCard>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============================================================
   SUMMARY CARD (MATCHED VARIANT)
============================================================ */

function SummaryCard({
  icon,
  label,
  value,
  accent,
  color = "emerald",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
  color: "emerald" | "amber" | "indigo";
}) {
  const colors = {
    emerald: "from-emerald-500 to-emerald-700",
    amber: "from-amber-500 to-amber-700",
    indigo: "from-indigo-500 to-indigo-700",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -6,
        scale: 1.03,
        boxShadow: "0 22px 60px rgba(15,23,42,0.35)",
      }}
      transition={{ duration: 0.35 }}
      className={`relative p-5 rounded-2xl border border-white/20 text-white bg-gradient-to-br ${colors[color]} shadow-xl`}
    >
      <div className="flex items-center gap-3">
        <div className="p-3 bg-white/20 rounded-xl">{icon}</div>

        <div>
          <p className="text-xs">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-[0.7rem] text-white/80">{accent}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   ANALYTICS CARD (MATCHED VARIANT)
============================================================ */

function AnalyticsCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl border border-gray-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.25)] p-5 md:p-6 overflow-hidden"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="h-9 w-9 rounded-full bg-gray-50 flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>

      <p className="text-sm text-gray-500 mb-4">{subtitle}</p>

      {children}
    </motion.div>
  );
}
