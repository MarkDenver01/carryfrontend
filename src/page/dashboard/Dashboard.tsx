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

      {/* AMBIENT LIGHT OVERLAY */}
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_30%_20%,rgba(52,211,153,0.12),transparent_60%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.18),transparent_65%)]" />

      {/* FLOATING PARALLAX BLOBS */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute -top-28 -left-20 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        />

        <motion.div
          className="absolute top-1/4 -right-24 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, -25, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        />

        <motion.div
          className="absolute bottom-[-5rem] left-1/3 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl"
          animate={{ x: [0, 20, -20, 0], y: [0, -10, 10, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          {/* GRADIENT TEXT HEADER */}
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent"
          >
            Dashboard Overview
          </motion.h1>

          <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400">
            CarryGrocer • Super Admin Panel
          </p>
        </div>

        {/* DARK MODE TOGGLE */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 px-3 py-2 rounded-full border border-slate-300/70 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/70 shadow-sm hover:shadow-md backdrop-blur-md text-xs font-medium transition-all"
          onClick={() => setIsDarkMode(!isDarkMode)}
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

      {/* SECTION DIVIDER */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-700" />

      {/* WELCOME CARD */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-500 text-white shadow-xl px-6 py-5 md:px-7 md:py-6 backdrop-blur-xl"
      >
        {/* Gloss overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.15),transparent_70%)]" />

        <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">

          {/* LEFT SIDE */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="h-11 w-11 rounded-xl bg-white/20 flex items-center justify-center shadow-lg shadow-emerald-900/40 backdrop-blur-sm"
              >
                <ShoppingCart size={22} />
              </motion.div>

              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.15em] text-white/70">
                  CarryGrocer Super Admin
                </p>

                <motion.h2
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-lg md:text-xl font-semibold"
                >
                  {greeting}, Admin 👋
                </motion.h2>
              </div>
            </div>

            <p className="text-xs md:text-sm text-white/80 mb-3">
              Here’s your operational snapshot for today.
            </p>

            {/* TIME INFO */}
            <div className="flex flex-wrap items-center gap-3 text-[0.7rem] md:text-xs text-white/90">
              <span>📅 {dateLabel}</span>
              <span className="opacity-70">•</span>
              <span>⏰ {currentTime}</span>
              <span className="opacity-70">•</span>

              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.9)]"></span>
                Updated{" "}
                {secondsSinceUpdate <= 1 ? "just now" : `${secondsSinceUpdate}s ago`}
              </span>
            </div>

            {/* SYSTEM STATUS */}
            <div className="mt-3 flex flex-wrap gap-2 text-[0.7rem] md:text-xs">
              {systemStatus.map((item) => (
                <motion.div
                  whileHover={{ scale: 1.03, y: -1 }}
                  key={item.label}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md shadow-sm"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${item.color} shadow-[0_0_10px_rgba(52,211,153,0.9)]`}
                  ></span>
                  <span className="font-semibold">{item.label}</span>
                  <span>{item.value}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* WEATHER */}
          <div className="w-full md:w-64">
            <div className="h-full border border-white/20 bg-white/10 rounded-xl px-4 py-3 backdrop-blur-md shadow-lg">
              <div className="flex items-center justify-between">
                <p className="text-[0.7rem] uppercase tracking-[0.12em] text-white/70">
                  Weather
                </p>
                <span className="text-[0.7rem] text-white/80">
                  Tanauan, Batangas
                </span>
              </div>

              <div className="flex justify-between items-center mt-3">
                <div>
                  <p className="text-3xl font-semibold leading-none text-white">
                    28°C
                  </p>
                  <p className="text-[0.7rem] opacity-90 mt-1 text-white/90">
                    Cloudy • Humid
                  </p>
                </div>

                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="text-4xl"
                >
                  🌥️
                </motion.div>
              </div>

              <p className="text-[0.7rem] mt-3 text-white/90">
                Best delivery window: <span className="font-semibold">4 PM – 8 PM</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SECTION DIVIDER */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-700" />

      {/* STATS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
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
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 bg-white/80 dark:bg-slate-900/60 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 backdrop-blur-md"
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
      className="p-6 rounded-xl shadow-lg border border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/70 backdrop-blur-md"
    >
      <div className="flex items-center justify-between mb-4">
        {/* SECTION LABEL CHIP */}
        <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300">
          {title}
        </span>
      </div>

      {/* Divider line inside section */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-700 mb-4" />

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
      className={`relative flex flex-col gap-4 p-5 rounded-2xl shadow-lg bg-gradient-to-br ${gradient} text-white overflow-hidden`}
    >
      {/* Animated glossy overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),transparent_60%)] opacity-90 pointer-events-none" />

      <div className="relative flex items-start gap-3">
        <motion.div
          whileHover={{ rotate: 6, scale: 1.08 }}
          className={`p-3 rounded-xl ${iconBg} shadow-md`}
        >
          {icon}
        </motion.div>

        <div>
          <p className="text-xs opacity-80">{title}</p>
          <p className="text-3xl font-extrabold mt-1">
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

      <p className="relative text-xs opacity-85 mt-1">Updated a moment ago</p>
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
      className="p-4 rounded-xl border border-red-200/70 dark:border-red-700/70 bg-red-50/70 dark:bg-red-900/20 backdrop-blur-md shadow"
    >
      <p className="text-sm font-medium text-red-800 dark:text-red-300">
        {label}
      </p>
      <p className="text-2xl font-bold mt-1 text-red-900 dark:text-red-200">
        {value}
      </p>
      <p className="text-xs mt-1 text-red-700 dark:text-red-400">{desc}</p>
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
      className="p-4 rounded-xl border border-sky-200/70 dark:border-sky-700/70 bg-sky-50/70 dark:bg-sky-900/20 backdrop-blur-md shadow"
    >
      <p className="text-sm font-medium text-sky-800 dark:text-sky-300">
        {label}
      </p>
      <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100">
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
