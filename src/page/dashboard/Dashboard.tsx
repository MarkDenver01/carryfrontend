import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  Percent,
  Users,
  Truck,
  Moon,
  Sun,
} from "lucide-react";
import { motion } from "framer-motion";

import DashboardTable from "../../layout/dashboard/DashboardTableLayout.tsx";

// TYPES
type StatConfig = {
  id: string;
  title: string;
  value: number;
  suffix?: string;
  gradient: string;
  iconBg: string;
  icon: React.ReactNode;
};

const Dashboard: React.FC = () => {
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(
    typeof window !== "undefined" && localStorage.getItem("darkMode") === "true"
  );

  // Apply dark mode
  useEffect(() => {
    localStorage.setItem("darkMode", isDarkMode.toString());
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  // Timer + clock
  useEffect(() => {
    const updateTime = () => {
      setSecondsSinceUpdate((prev) => (prev === 0 ? 1 : prev + 1));
      setCurrentTime(
        new Date().toLocaleTimeString("en-PH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const stats: StatConfig[] = [
    {
      id: "newOrders",
      title: "New Orders",
      value: 15,
      gradient: "from-emerald-500 to-emerald-600",
      iconBg: "bg-emerald-100 text-emerald-600",
      icon: <ShoppingCart size={28} />,
    },
    {
      id: "saleRate",
      title: "Sale Rate",
      value: 30,
      suffix: "%",
      gradient: "from-amber-400 to-amber-500",
      iconBg: "bg-amber-100 text-amber-500",
      icon: <Percent size={28} />,
    },
    {
      id: "users",
      title: "Users",
      value: 100,
      gradient: "from-sky-500 to-sky-600",
      iconBg: "bg-sky-100 text-sky-500",
      icon: <Users size={28} />,
    },
    {
      id: "drivers",
      title: "Available Drivers",
      value: 10,
      gradient: "from-indigo-500 to-indigo-600",
      iconBg: "bg-indigo-100 text-indigo-500",
      icon: <Truck size={28} />,
    },
  ];

  const systemStatus = [
    { label: "API Server", value: "Online", color: "bg-emerald-500" },
    { label: "Database", value: "Healthy", color: "bg-emerald-400" },
    { label: "SMS Gateway", value: "Active", color: "bg-emerald-500" },
  ];

  const dateLabel = new Date().toLocaleDateString("en-PH", {
    weekday: "long",
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`relative overflow-hidden p-6 md:p-8 flex flex-col gap-8 transition-colors duration-500 ${
        isDarkMode
          ? "bg-slate-950 text-slate-100"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* BACKGROUND FX */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Soft gradient base */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${
            isDarkMode
              ? "from-slate-900 via-slate-950 to-slate-950"
              : "from-slate-50 via-white to-slate-100"
          }`}
        />
        {/* Floating blobs */}
        <motion.div
          className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, -25, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-[-4rem] left-1/4 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl"
          animate={{ x: [0, 20, -20, 0], y: [0, -10, 10, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="text-2xl md:text-3xl font-semibold tracking-tight"
          >
            Dashboard Overview
          </motion.h1>
          <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400">
            CarryGrocer • Super Admin Panel
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="flex items-center gap-2 px-3 py-2 rounded-full border border-slate-300/70 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 shadow-sm hover:shadow-md backdrop-blur-md text-xs font-medium transition-all"
        >
          {isDarkMode ? (
            <>
              <Sun size={16} className="text-yellow-400" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={16} className="text-slate-700" />
              <span>Dark Mode</span>
            </>
          )}
        </motion.button>
      </div>

      {/* WELCOME CARD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-500 text-white shadow-xl px-6 py-5 md:px-7 md:py-6"
      >
        {/* Glow */}
        <div className="absolute -bottom-24 right-[-40px] h-52 w-80 bg-white/20 rounded-full blur-3xl opacity-70" />
        <div className="absolute -top-10 left-[-20px] h-24 w-24 bg-emerald-300/20 rounded-full blur-3xl" />

        <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
          {/* Left side */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="h-11 w-11 rounded-xl bg-white/15 flex items-center justify-center shadow-lg shadow-emerald-900/40"
              >
                <ShoppingCart size={22} />
              </motion.div>
              <div>
                <p className="text-[0.65rem] md:text-[0.7rem] text-emerald-100/90 uppercase tracking-[0.15em]">
                  CarryGrocer Super Admin
                </p>
                <motion.h2
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35 }}
                  className="text-lg md:text-xl font-semibold"
                >
                  {greeting}, Admin 👋
                </motion.h2>
              </div>
            </div>

            <p className="text-xs md:text-sm text-emerald-50/90 mb-3">
              Here’s your operational snapshot for today.
            </p>

            {/* Time info */}
            <div className="flex flex-wrap items-center gap-3 text-[0.7rem] md:text-xs text-emerald-50/95">
              <span>📅 {dateLabel}</span>
              <span className="opacity-60">•</span>
              <span>⏰ {currentTime}</span>
              <span className="opacity-60">•</span>
              <span className="inline-flex items-center gap-1">
                <span
                  className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse"
                  aria-hidden
                />
                Updated{" "}
                {secondsSinceUpdate <= 1
                  ? "just now"
                  : `${secondsSinceUpdate}s ago`}
              </span>
            </div>

            {/* System Status */}
            <div className="mt-3 flex flex-wrap gap-2 text-[0.7rem] md:text-xs">
              {systemStatus.map((item) => (
                <motion.div
                  key={item.label}
                  whileHover={{ y: -2, scale: 1.01 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200/30 bg-emerald-900/30 backdrop-blur-md"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${item.color} shadow-[0_0_10px_rgba(16,185,129,0.9)]`}
                  />
                  <span className="font-semibold">{item.label}</span>
                  <span className="text-emerald-100/90">{item.value}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Weather */}
          <div className="w-full md:w-64">
            <div className="h-full border border-emerald-200/35 bg-emerald-950/40 rounded-xl px-4 py-3 backdrop-blur-2xl shadow-md shadow-emerald-900/50">
              <div className="flex items-center justify-between">
                <p className="text-[0.65rem] md:text-[0.7rem] text-emerald-100/90 uppercase tracking-[0.12em]">
                  Weather
                </p>
                <span className="text-[0.7rem] text-emerald-50/90">
                  Tanauan, Batangas
                </span>
              </div>

              <div className="flex justify-between items-center mt-3">
                <div>
                  <p className="text-3xl md:text-4xl font-semibold leading-none">
                    28°C
                  </p>
                  <p className="text-[0.7rem] md:text-xs opacity-90 mt-1">
                    Cloudy • Humid
                  </p>
                </div>
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="text-4xl md:text-5xl"
                >
                  🌥️
                </motion.div>
              </div>

              <p className="text-[0.65rem] md:text-[0.7rem] mt-3 opacity-95 leading-relaxed">
                Best delivery window:{" "}
                <span className="font-semibold">4 PM – 8 PM</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* STATS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5"
      >
        {stats.map((s, index) => (
          <DashboardStatCard key={s.id} index={index} {...s} />
        ))}
      </motion.div>

      {/* INVENTORY ALERTS */}
      <SectionWrapper title="Inventory Alerts">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AlertCard
            label="Low Stock Items"
            value="12 items"
            desc="Requires restocking soon"
          />
          <AlertCard
            label="Out of Stock"
            value="4 items"
            desc="Needs immediate ordering"
          />
          <AlertCard
            label="Expiring Soon"
            value="7 items"
            desc="Expires within 10 days"
          />
        </div>
      </SectionWrapper>

      {/* STORE PERFORMANCE */}
      <SectionWrapper title="Store Performance Snapshot">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <PerformanceCard label="Today's Revenue" value="₱12,450" />
          <PerformanceCard label="Orders Today" value="32" />
          <PerformanceCard label="New Users" value="6" />
          <PerformanceCard label="Driver Availability" value="82%" />
        </div>
      </SectionWrapper>

      {/* TABLE */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.18 }}
        className="p-4 md:p-5 bg-white/80 dark:bg-slate-900/80 rounded-xl shadow-lg border border-slate-200/70 dark:border-slate-700/80 backdrop-blur-md"
      >
        <DashboardTable />
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;

/* ============================
   WRAPPER SECTION
============================ */
function SectionWrapper({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-5 md:p-6 rounded-xl shadow-lg border border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-slate-50">
          {title}
        </h3>
      </div>
      {children}
    </motion.section>
  );
}

/* ============================
   STAT CARD
============================ */
function DashboardStatCard({
  title,
  value,
  suffix,
  gradient,
  iconBg,
  icon,
  index,
}: StatConfig & { index: number }) {
  const displayValue = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.04 * index }}
      whileHover={{
        y: -4,
        scale: 1.02,
        boxShadow: "0 18px 50px rgba(15, 23, 42, 0.25)",
      }}
      className={`flex flex-col gap-4 p-4 md:p-5 rounded-2xl shadow-lg bg-gradient-to-br ${gradient} text-white relative overflow-hidden`}
    >
      {/* overlay for subtle gloss */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),transparent_55%)] opacity-80" />

      <div className="relative flex items-start gap-3">
        <motion.div
          whileHover={{ rotate: 6, scale: 1.05 }}
          className={`p-2.5 md:p-3 rounded-2xl ${iconBg} shadow-md shadow-black/15`}
        >
          {icon}
        </motion.div>

        <div>
          <p className="text-[0.7rem] md:text-xs opacity-80">{title}</p>
          <p className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">
            <motion.span
              key={displayValue}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {displayValue}
              {suffix || ""}
            </motion.span>
          </p>
        </div>
      </div>

      <p className="relative text-[0.7rem] md:text-xs opacity-85 mt-1">
        Updated a moment ago
      </p>
    </motion.div>
  );
}

/* ============================
   ALERT CARD
============================ */
function AlertCard({
  label,
  value,
  desc,
}: {
  label: string;
  value: string;
  desc: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      className="p-4 rounded-xl border border-red-200/70 dark:border-red-700/70 bg-red-50/90 dark:bg-red-900/25 backdrop-blur-md"
    >
      <p className="text-xs md:text-sm text-red-800 dark:text-red-200 font-medium">
        {label}
      </p>
      <p className="text-xl md:text-2xl font-bold mt-1 text-red-900 dark:text-red-100">
        {value}
      </p>
      <p className="text-[0.7rem] md:text-xs text-red-700 dark:text-red-300 mt-1">
        {desc}
      </p>
    </motion.div>
  );
}

/* ============================
   PERFORMANCE CARD
============================ */
function PerformanceCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      className="p-4 rounded-xl border border-sky-200/70 dark:border-sky-700/70 bg-sky-50/90 dark:bg-sky-900/25 backdrop-blur-md"
    >
      <p className="text-xs md:text-sm text-sky-800 dark:text-sky-200 font-medium">
        {label}
      </p>
      <p className="text-xl md:text-2xl font-bold mt-1 text-slate-900 dark:text-slate-50">
        {value}
      </p>
    </motion.div>
  );
}

/* ============================
   COUNT-UP HOOK
============================ */
function useCountUp(target: number, duration: number = 700): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame: number;
    const start = performance.now();

    const animate = (t: number) => {
      const progress = Math.min((t - start) / duration, 1);
      setValue(Math.round(progress * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}
