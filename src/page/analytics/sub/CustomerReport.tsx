import React, { useState } from "react";
import type { ReactNode } from "react";
import { Users, PhilippinePeso, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import SalesChartLayout from "../../../layout/analytics/SalesChartLayout";

export default function CustomerReport() {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative p-6 md:p-8 flex flex-col gap-8 md:gap-10 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* GLOBAL HUD BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 -z-30">
        {/* Grid */}
        <div className="w-full h-full opacity-40 mix-blend-soft-light bg-[linear-gradient(to_right,rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:40px_40px]" />
        {/* Scanlines */}
        <div className="absolute inset-0 opacity-[0.08] mix-blend-soft-light bg-[repeating-linear-gradient(to_bottom,rgba(15,23,42,0.9)_0px,rgba(15,23,42,0.9)_1px,transparent_1px,transparent_3px)]" />
        {/* Ambient light blobs */}
        <motion.div
          className="absolute -top-24 -left-16 h-64 w-64 bg-emerald-500/28 blur-3xl"
          animate={{
            x: [0, 25, 10, -5, 0],
            y: [0, 10, 20, 5, 0],
            borderRadius: ["45%", "60%", "50%", "65%", "45%"],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-5rem] right-0 h-72 w-72 bg-sky-400/24 blur-3xl"
          animate={{
            x: [0, -15, -25, -10, 0],
            y: [0, -10, -20, -5, 0],
            borderRadius: ["50%", "65%", "55%", "70%", "50%"],
          }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* CURSOR SPOTLIGHT */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background: `radial-gradient(550px at ${cursorPos.x}px ${cursorPos.y}px, rgba(34,197,94,0.26), transparent 70%)`,
        }}
        animate={{ opacity: [0.7, 1, 0.8] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* PAGE HEADER */}
      <div className="relative">
        <motion.h1
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-600 bg-clip-text text-transparent"
        >
          Customer Report
        </motion.h1>
        <p className="text-gray-500 text-sm mt-1">
          Insights on customers, sales performance, and purchasing behavior.
        </p>
        <div className="mt-3 h-[3px] w-20 bg-gradient-to-r from-emerald-400 via-emerald-500 to-transparent rounded-full" />
      </div>

      {/* HUD MAIN CONTAINER */}
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

        <div className="relative flex flex-col gap-8 p-5 md:p-6">
          {/* SCANNER BAR */}
          <motion.div
            className="pointer-events-none absolute top-10 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent opacity-70"
            animate={{ x: ["-20%", "20%", "-20%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* STATS GRID */}
          <section className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-5 md:gap-6">
            <StatCard
              colorFrom="from-emerald-500"
              colorTo="to-green-600"
              icon={<PhilippinePeso size={48} />}
              value="37,241"
              label="Total Sales"
              accentLabel="₱ Overall revenue"
              delay={0}
            />

            <StatCard
              colorFrom="from-rose-500"
              colorTo="to-rose-700"
              icon={<Users size={48} />}
              value="5,523"
              label="Total Customers"
              accentLabel="All-time unique customers"
              delay={0.05}
            />

            <StatCard
              colorFrom="from-amber-500"
              colorTo="to-amber-700"
              icon={<ShoppingCart size={48} />}
              value="1,293"
              label="Total Orders"
              accentLabel="Completed transactions"
              delay={0.1}
            />

            <TopCustomersCard delay={0.15} />
          </section>

          {/* DIVIDER */}
          <div className="relative h-px w-full bg-gradient-to-r from-transparent via-gray-300/90 to-transparent mt-2" />

          {/* SALES CHART SECTION */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative rounded-2xl border border-gray-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.25)] p-5 md:p-6 overflow-hidden"
          >
            {/* subtle halo */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_60%)]" />
            <div className="relative">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Customer Sales Trend
                  </h2>
                  <p className="text-sm text-gray-500">
                    Monthly sales activity of your customers.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                  <span>Live analytics overview</span>
                </div>
              </div>

              <SalesChartLayout />
            </div>
          </motion.section>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------------------------
   STAT CARD (ULTRA MODE)
---------------------------- */
type StatCardProps = {
  colorFrom: string;
  colorTo: string;
  icon: ReactNode;
  value: string;
  label: string;
  accentLabel?: string;
  delay?: number;
};

function StatCard({
  colorFrom,
  colorTo,
  icon,
  value,
  label,
  accentLabel,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
      whileHover={{
        y: -6,
        scale: 1.03,
        rotateX: -4,
        rotateY: 4,
        boxShadow:
          "0 22px 65px rgba(15,23,42,0.35), 0 0 25px rgba(52,211,153,0.35)",
      }}
      className={`
        relative flex flex-col gap-4 p-5 rounded-2xl 
        bg-gradient-to-br ${colorFrom} ${colorTo}
        text-white shadow-[0_18px_50px_rgba(15,23,42,0.28)] 
        overflow-hidden group transform-gpu
        border border-white/15
      `}
    >
      {/* glossy top & shine sweep */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_60%)] opacity-90" />
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.45),transparent)] translate-x-[-200%] group-hover:translate-x-[200%]" />

      <div className="relative flex items-start gap-3">
        <motion.div
          whileHover={{ rotate: 6, scale: 1.08 }}
          className="p-3 rounded-xl bg-white/20 shadow-md shadow-black/40"
        >
          {icon}
        </motion.div>
        <div>
          <p className="text-xs text-white/85">{label}</p>
          <p className="text-3xl font-extrabold mt-1 tracking-tight">
            {value}
          </p>
          {accentLabel && (
            <p className="text-[0.7rem] text-white/80 mt-1">{accentLabel}</p>
          )}
        </div>
      </div>

      <p className="relative text-[0.7rem] text-white/80 mt-1">
        Updated a moment ago
      </p>
    </motion.article>
  );
}

/* ---------------------------
   TOP CUSTOMERS CARD (ULTRA)
---------------------------- */
type TopCustomersCardProps = {
  delay?: number;
};

function TopCustomersCard({ delay = 0 }: TopCustomersCardProps) {
  const customers = [
    { name: "Nathaniel", percent: 75 },
    { name: "Alyssa", percent: 50 },
    { name: "John", percent: 30 },
  ];

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
      whileHover={{
        y: -6,
        scale: 1.02,
        rotateX: -3,
        rotateY: 3,
        boxShadow:
          "0 22px 65px rgba(15,23,42,0.35), 0 0 25px rgba(59,130,246,0.4)",
      }}
      className="
        relative flex flex-col gap-5 p-5 
        bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 
        rounded-2xl shadow-lg border border-white/15
        text-white overflow-hidden transform-gpu group
      "
    >
      {/* subtle overlay + shine */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(191,219,254,0.25),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 bg-[linear-gradient(130deg,transparent,rgba(255,255,255,0.25),transparent)] translate-x-[-200%] group-hover:translate-x-[200%]" />

      <div className="relative flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Top Customers</h2>
        <span className="text-[0.7rem] bg-blue-900/70 px-2 py-1 rounded-full border border-blue-300/50">
          Contribution by revenue
        </span>
      </div>

      {customers.map((c) => (
        <div key={c.name} className="relative">
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium">{c.name}</span>
            <span className="text-sm">{c.percent}%</span>
          </div>

          <div className="w-full bg-white/15 rounded-full h-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${c.percent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-white h-4 rounded-full"
            />
          </div>
        </div>
      ))}
    </motion.article>
  );
}
