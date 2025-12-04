import React, { useEffect, useMemo, useState } from "react";
import {
  ShoppingCart,
  Percent,
  Users,
  Truck,
  Moon,
  Sun,
} from "lucide-react";
import { motion } from "framer-motion";

// ⭐ IMPORT DASHBOARD STATS APIs
import {
  getTotalSales,
  getTotalOrders,
  getTotalCustomers,
  getAvailableRidersDashboard,
} from "../../libs/ApiGatewayDatasource";

// ============================
//        TYPES
// ============================
type StatConfig = {
  id: string;
  title: string;
  value: number;
  suffix?: string;
  gradient: string;
  iconBg: string;
  icon: React.ReactNode;
};

// ============================
//   CUSTOM HOOK: COUNT UP
// ============================
function useCountUp(target: number, duration: number = 700): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame: number;
    const start = performance.now();

    const animate = (t: number) => {
      const progress = Math.min((t - start) / duration, 1);
      setValue(Math.round(progress * target));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

// ============================
//   CUSTOM HOOK: DASHBOARD STATS
// ============================
function useDashboardStats() {
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [availableRiders, setAvailableRiders] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const [sales, orders, customers, riders] = await Promise.all([
          getTotalSales(),
          getTotalOrders(),
          getTotalCustomers(),
          getAvailableRidersDashboard(),
        ]);

        if (cancelled) return;

        setTotalSales(Number(sales) || 0);
        setTotalOrders(Number(orders) || 0);
        setTotalCustomers(Number(customers) || 0);
        setAvailableRiders(Number(riders) || 0);
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
        if (!cancelled) {
          setError("Failed to load stats");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    totalSales,
    totalOrders,
    totalCustomers,
    availableRiders,
    loading,
    error,
  };
}

// ============================
//        MAIN DASHBOARD
// ============================
const Dashboard: React.FC = () => {
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);
  const [currentTime, setCurrentTime] = useState("");

  // SSR-safe dark mode init
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("darkMode") === "true";
  });

  // ⭐ DASHBOARD STATS (hook)
  const {
    totalSales,
    totalOrders,
    totalCustomers,
    availableRiders,
    loading,
    error,
  } = useDashboardStats();
// SHOW ERROR UI
if (error) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-20 gap-3">
      <p className="text-red-500 font-semibold text-lg">Failed to load dashboard stats</p>
      <p className="text-slate-500 text-sm">{error}</p>
    </div>
  );
}

// SHOW LOADING SKELETON
if (loading) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 p-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-32 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse"
        />
      ))}
    </div>
  );
}
  // Apply dark mode to <html>
  useEffect(() => {
    if (typeof document === "undefined") return;
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
    const interval = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(interval);
  }, []);

  // Date & greeting
  const now = useMemo(() => new Date(), []);
  const dateLabel = useMemo(
    () =>
      now.toLocaleDateString("en-PH", {
        weekday: "long",
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    [now]
  );

  const greeting = useMemo(() => {
    const hour = now.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, [now]);

  // Stats list
  const stats: StatConfig[] = useMemo(
    () => [
      {
        id: "totalOrders",
        title: "Total Orders",
        value: totalOrders,
        gradient: "from-emerald-500 to-emerald-600",
        iconBg: "bg-emerald-100 text-emerald-600",
        icon: <ShoppingCart size={28} />,
      },
      {
        id: "totalSales",
        title: "Total Sales (₱)",
        value: totalSales,
        gradient: "from-amber-400 to-amber-500",
        iconBg: "bg-amber-100 text-amber-500",
        icon: <Percent size={28} />,
      },
      {
        id: "totalCustomers",
        title: "Total Customers",
        value: totalCustomers,
        gradient: "from-sky-500 to-sky-600",
        iconBg: "bg-sky-100 text-sky-500",
        icon: <Users size={28} />,
      },
      {
        id: "drivers",
        title: "Available Drivers",
        value: availableRiders, // ✅ now dynamic from backend
        gradient: "from-indigo-500 to-indigo-600",
        iconBg: "bg-indigo-100 text-indigo-500",
        icon: <Truck size={28} />,
      },
    ],
    [totalOrders, totalSales, totalCustomers, availableRiders]
  );

  const systemStatus = useMemo(
    () => [
      { label: "API Server", value: "Online", color: "bg-emerald-500" },
      { label: "Database", value: "Healthy", color: "bg-emerald-400" },
      { label: "SMS Gateway", value: "Active", color: "bg-emerald-500" },
    ],
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className={`relative overflow-hidden p-6 md:p-8 flex flex-col gap-8 transition-colors duration-500 ${
        isDarkMode
          ? "bg-slate-950 text-slate-100"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* AMBIENT EDGE GLOW */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-40 -z-30 bg-gradient-to-t from-emerald-500/10 via-transparent to-transparent" />

      {/* GLOBAL AMBIENT LIGHT */}
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_5%_0%,rgba(52,211,153,0.18),transparent_55%),radial-gradient(circle_at_95%_0%,rgba(56,189,248,0.18),transparent_55%)]" />

      {/* FLOATING / MORPHING BLOBS */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute -top-32 -left-24 h-80 w-80 bg-emerald-400/25 blur-3xl"
          animate={{
            x: [0, 30, 10, -10, 0],
            y: [0, 10, 25, 10, 0],
            borderRadius: ["45%", "60%", "50%", "65%", "45%"],
          }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -right-28 h-96 w-96 bg-sky-400/20 blur-3xl"
          animate={{
            x: [0, -40, -20, 10, 0],
            y: [0, -10, -25, -10, 0],
            borderRadius: ["50%", "65%", "55%", "70%", "50%"],
          }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-4rem] left-1/3 h-80 w-80 bg-emerald-500/18 blur-3xl"
          animate={{
            x: [0, 20, -10, -20, 0],
            y: [0, -15, -5, -10, 0],
            borderRadius: ["55%", "70%", "60%", "75%", "55%"],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* HEADER BAR */}
      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-700 bg-clip-text text-transparent"
          >
            Dashboard Overview
          </motion.h1>
          <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400">
            CarryGrocer • Super Admin Panel
          </p>
          <div className="mt-1 h-[2px] w-10 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full animate-pulse" />
        </div>

        <motion.button
          whileHover={{ x: 2, y: -2, scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsDarkMode((prev) => !prev)}
          className="relative flex items-center gap-2 px-3 py-2 rounded-full border border-slate-300/70 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/70 shadow-[0_8px_30px_rgba(15,23,42,0.18)] hover:shadow-[0_12px_40px_rgba(15,23,42,0.25)] backdrop-blur-xl text-xs font-medium transition-all overflow-hidden group"
        >
          <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_55%)]" />
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

      {/* TOP DIVIDER */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-300/80 to-transparent dark:via-slate-700/80" />

      {/* WELCOME / SNAPSHOT CARD */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl border border-emerald-400/35 bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-500 text-white shadow-[0_20px_60px_-15px_rgba(4,120,87,0.75)] px-6 py-5 md:px-7 md:py-6 backdrop-blur-2xl group"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.20),transparent_65%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.25),transparent)] translate-x-[-200%] group-hover:translate-x-[200%]" />

        <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
          {/* LEFT SIDE */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="h-11 w-11 rounded-xl bg-white/20 flex items-center justify-center shadow-lg shadow-emerald-900/50 backdrop-blur-sm"
              >
                <ShoppingCart size={22} />
              </motion.div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/70">
                  CarryGrocer Super Admin
                </p>
                <motion.h2
                  initial={{ opacity: 0, x: -6 }}
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

            {/* TIME ROW */}
            <div className="flex flex-wrap items-center gap-3 text-[0.7rem] md:text-xs text-white/90">
              <span>📅 {dateLabel}</span>
              <span className="opacity-70">•</span>
              <span>⏰ {currentTime}</span>
              <span className="opacity-70">•</span>
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                Updated{" "}
                {secondsSinceUpdate <= 1
                  ? "just now"
                  : `${secondsSinceUpdate}s ago`}
              </span>
            </div>

            {/* SYSTEM STATUS PILL ROW */}
            <div className="mt-3 flex flex-wrap gap-2 text-[0.7rem] md:text-xs">
              {systemStatus.map((item) => (
                <motion.div
                  key={item.label}
                  whileHover={{ scale: 1.04, y: -1 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md shadow-sm"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${item.color} shadow-[0_0_10px_rgba(52,211,153,0.9)]`}
                  />
                  <span className="font-semibold">{item.label}</span>
                  <span>{item.value}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* WEATHER CARD */}
          <div className="w-full md:w-64">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="relative h-full border border-white/25 bg-white/12 rounded-xl px-4 py-3 backdrop-blur-2xl shadow-[0_16px_40px_rgba(4,120,87,0.6)] overflow-hidden"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_55%)]" />
              <div className="flex items-center justify-between relative z-10">
                <p className="text-[0.7rem] uppercase tracking-[0.14em] text-white/75">
                  Weather
                </p>
                <span className="text-[0.7rem] text-white/85">
                  Tanauan, Batangas
                </span>
              </div>

              <div className="flex justify-between items-center mt-3 relative z-10">
                <div>
                  <p className="text-3xl font-semibold leading-none text-white">
                    28°C
                  </p>
                  <p className="text-[0.7rem] opacity-90 mt-1 text-white/90">
                    Cloudy • Humid
                  </p>
                </div>
                <motion.div
                  animate={{ y: [0, -4, 0], rotate: [-2, 2, -2] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="text-4xl"
                >
                  🌥️
                </motion.div>
              </div>

              <p className="text-[0.7rem] mt-3 text-white/90 relative z-10">
                Best delivery window:{" "}
                <span className="font-semibold">4 PM – 8 PM</span>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* MID DIVIDER */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-300/80 to-transparent dark:via-slate-700/80" />

      {/* STATS GRID */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
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
    </motion.div>
  );
};

export default Dashboard;

// ============================
//   WRAPPER SECTION
// ============================
function SectionWrapper({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative p-6 rounded-xl border border-slate-200/85 dark:border-slate-700/85 bg-white/80 dark:bg-slate-900/75 backdrop-blur-xl shadow-[0_18px_55px_rgba(15,23,42,0.28)] overflow-hidden group"
    >
      <div className="pointer-events-none absolute inset-0 rounded-xl border border-white/10 dark:border-white/5" />
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_top_left,rgba(248,250,252,0.45),transparent_60%)]" />

      <div className="relative flex items-center justify-between mb-4">
        <div className="flex flex-col gap-1">
          <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
            {title}
          </span>
        </div>
      </div>

      <div className="relative h-[1px] w-full bg-gradient-to-r from-transparent via-slate-300/90 to-transparent dark:via-slate-700/90 mb-4" />

      <div className="relative">{children}</div>
    </motion.section>
  );
}

// ============================
//   STAT CARD
// ============================
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 * index }}
      whileHover={{
        y: -6,
        scale: 1.03,
        boxShadow:
          "0 22px 65px rgba(15,23,42,0.32), 0 0 25px rgba(52,211,153,0.35)",
      }}
      className={`relative flex flex-col gap-4 p-5 rounded-2xl shadow-[0_18px_50px_rgba(15,23,42,0.28)] bg-gradient-to-br ${gradient} text-white overflow-hidden group`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.3),transparent_60%)] opacity-90 pointer-events-none" />
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.4),transparent)] translate-x-[-200%] group-hover:translate-x-[200%]" />

      <div className="relative flex items-start gap-3">
        <motion.div
          whileHover={{ rotate: 5, scale: 1.08 }}
          className={`p-3 rounded-xl ${iconBg} shadow-md shadow-black/30`}
        >
          {icon}
        </motion.div>

        <div>
          <p className="text-xs opacity-85">{title}</p>
          <p className="text-3xl font-extrabold mt-1 tracking-tight">
            <motion.span
              key={displayValue}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {displayValue}
              {suffix || ""}
            </motion.span>
          </p>
        </div>
      </div>

      <p className="relative text-xs opacity-90 mt-1">Updated a moment ago</p>
    </motion.div>
  );
}

// ============================
//   ALERT CARD
// ============================
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
      whileHover={{ y: -4, scale: 1.02 }}
      className="p-4 rounded-xl border border-red-200/80 dark:border-red-700/80 bg-red-50/80 dark:bg-red-900/25 backdrop-blur-md shadow-[0_14px_38px_rgba(127,29,29,0.35)]"
    >
      <p className="text-sm font-medium text-red-800 dark:text-red-200">
        {label}
      </p>
      <p className="text-2xl font-bold mt-1 text-red-900 dark:text-red-100">
        {value}
      </p>
      <p className="text-xs mt-1 text-red-700 dark:text-red-300">{desc}</p>
    </motion.div>
  );
}
