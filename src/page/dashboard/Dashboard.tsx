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
    localStorage.getItem("darkMode") === "true"
  );

  // Apply dark mode to HTML
  useEffect(() => {
    localStorage.setItem("darkMode", isDarkMode.toString());
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  // Timer + current time
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

    setSecondsSinceUpdate(0);
    setCurrentTime(
      new Date().toLocaleTimeString("en-PH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );

    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const stats: StatConfig[] = [
    {
      id: "newOrders",
      title: "New Orders",
      value: 15,
      gradient: "from-emerald-500 to-green-600",
      iconBg: "bg-emerald-100 text-emerald-600",
      icon: <ShoppingCart size={32} />,
    },
    {
      id: "saleRate",
      title: "Sale Rate",
      value: 30,
      suffix: "%",
      gradient: "from-amber-400 to-yellow-500",
      iconBg: "bg-yellow-100 text-amber-500",
      icon: <Percent size={32} />,
    },
    {
      id: "users",
      title: "Users",
      value: 100,
      gradient: "from-green-800 to-green-600",
      iconBg: "bg-green-100 text-green-700",
      icon: <Users size={32} />,
    },
    {
      id: "drivers",
      title: "Available Drivers",
      value: 10,
      gradient: "from-blue-900 to-blue-700",
      iconBg: "bg-blue-100 text-blue-700",
      icon: <Truck size={32} />,
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
    <div
      className={`relative overflow-hidden p-6 flex flex-col gap-8 transition-all duration-500 ${
        isDarkMode ? "bg-slate-950 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Background particles */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl"
          animate={{ y: [0, 10, 0], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 h-52 w-52 rounded-full bg-green-600/10 blur-3xl"
          animate={{ y: [0, -15, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            CarryGrocer • Super Admin Panel
          </p>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setIsDarkMode((prev) => !prev)}
          className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow hover:shadow-lg transition"
        >
          {isDarkMode ? (
            <>
              <Sun size={16} className="text-yellow-400" />
              <span className="text-xs font-medium">Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={16} className="text-slate-700" />
              <span className="text-xs font-medium">Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {/* WELCOME CARD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-500 text-white shadow-xl px-5 py-4 md:px-6 md:py-5"
      >
        <div className="pointer-events-none absolute -bottom-16 right-[-40px] h-40 w-64 bg-white/15 rounded-[100%] blur-3xl" />

        <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-8 relative z-10">
          {/* LEFT */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center shadow-lg">
                <ShoppingCart size={22} className="text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-100">
                  CarryGrocer Super Admin
                </p>
                <h2 className="text-lg md:text-xl font-semibold">
                  {greeting}, Admin 👋
                </h2>
              </div>
            </div>

            <p className="text-xs md:text-sm text-emerald-50 mb-2">
              Here’s your operational snapshot for today.
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.7rem] md:text-xs text-emerald-50/90">
              <span>📅 {dateLabel}</span>
              <span className="opacity-60">•</span>
              <span>⏰ Current Time: {currentTime}</span>
              <span className="opacity-60">•</span>
              <span>
                Last updated:{" "}
                {secondsSinceUpdate === 0
                  ? "just now"
                  : `${secondsSinceUpdate}s ago`}
              </span>
            </div>

            {/* SYSTEM STATUS */}
            <div className="mt-3 flex flex-wrap gap-2 text-[0.7rem] md:text-xs">
              {systemStatus.map((item) => (
                <div
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-900/30 px-3 py-1 border border-emerald-300/40"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${item.color}`}
                  ></span>
                  <span className="font-semibold text-emerald-50">
                    {item.label}
                  </span>
                  <span className="text-emerald-100/80">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Weather */}
          <div className="w-full md:w-64 lg:w-72">
            <div className="h-full rounded-xl bg-emerald-900/30 border border-emerald-300/40 px-4 py-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs uppercase tracking-wide text-emerald-100">
                  Store Weather
                </p>
                <span className="text-xs text-emerald-100/80">
                  Tanauan, Batangas
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold leading-tight">28°C</p>
                  <p className="text-xs text-emerald-100/80">
                    Mostly cloudy • Humid
                  </p>
                </div>
                <div className="text-4xl">🌥️</div>
              </div>
              <p className="mt-2 text-[0.7rem] text-emerald-100/80">
                Best time for deliveries:{" "}
                <span className="font-semibold">4 PM – 8 PM</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* METRIC CARDS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {stats.map((stat) => (
          <DashboardStatCard key={stat.id} {...stat} />
        ))}
      </motion.div>

      {/* SYSTEM OVERVIEW (NO GRAPH) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="p-5 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700"
      >
        <h3 className="text-lg font-semibold mb-1">System Overview</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Current status of the CarryGrocer system.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <OverviewBox
            title="Total Users"
            value="100"
            status="Active this week"
          />
          <OverviewBox
            title="Orders Processed"
            value="286"
            status="Smooth operations"
          />
          <OverviewBox
            title="Active Sub Admins"
            value="4"
            status="No issues"
          />
        </div>

        {/* QUICK ACTIONS */}
        <div className="mt-6">
          <h4 className="text-sm font-semibold mb-2">Quick Actions</h4>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white shadow hover:bg-emerald-700">
              Add New Admin
            </button>
            <button className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white shadow hover:bg-blue-700">
              View Logs
            </button>
            <button className="px-4 py-2 text-sm rounded-lg bg-slate-700 text-white shadow hover:bg-slate-800">
              Manage Roles
            </button>
          </div>
        </div>
      </motion.div>

      {/* RECENT ACTIVITY LOGS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="p-5 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700"
      >
        <h3 className="text-lg font-semibold mb-2">Recent Activity Logs</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Latest system and user activities.
        </p>

        <div className="space-y-3 text-sm">
          <LogItem
            icon="✔"
            text='Admin Denver added new product "Milo Powder 1KG"'
            time="4:32 PM"
          />
          <LogItem
            icon="✔"
            text='Sub Admin Anne updated stock for "Pancit Canton"'
            time="4:12 PM"
          />
          <LogItem
            icon="❗"
            text="SMS Gateway Timeout — retrying..."
            time="3:55 PM"
            type="warning"
          />
          <LogItem
            icon="✔"
            text="Login success – Admin Denver"
            time="3:50 PM"
          />
          <LogItem
            icon="❌"
            text="Login failed – wrong password attempt"
            time="3:46 PM"
            type="error"
          />
        </div>
      </motion.div>

      {/* TABLE */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
        <DashboardTable />
      </div>
    </div>
  );
};

export default Dashboard;

/* ============================
   STAT CARD COMPONENT
============================ */
function DashboardStatCard({
  title,
  value,
  suffix,
  gradient,
  iconBg,
  icon,
}: StatConfig) {
  const displayValue = useCountUp(value, 600);

  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -4 }}
      transition={{ type: "spring", stiffness: 200, damping: 16 }}
      className={`flex flex-col gap-4 p-4 rounded-2xl shadow-xl bg-gradient-to-br ${gradient} text-white`}
    >
      <div className="flex items-start gap-3">
        <motion.div whileHover={{ scale: 1.08 }} className={`p-3 rounded-full shadow ${iconBg}`}>
          {icon}
        </motion.div>

        <div>
          <p className="text-xs text-white/80">{title}</p>
          <p className="text-3xl font-extrabold">
            {displayValue}
            {suffix || ""}
          </p>
        </div>
      </div>

      <p className="text-xs text-white/80 mt-2">Updated a moment ago</p>
    </motion.div>
  );
}

/* ============================
   OVERVIEW BOX
============================ */
function OverviewBox({
  title,
  value,
  status,
}: {
  title: string;
  value: string;
  status: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className="text-xs text-green-600 dark:text-green-400 mt-1">{status}</p>
    </div>
  );
}

/* ============================
   LOG ITEM COMPONENT
============================ */
const LogItem = ({
  icon,
  text,
  time,
  type = "info",
}: {
  icon: string;
  text: string;
  time: string;
  type?: "info" | "warning" | "error";
}) => {
  const color =
    type === "warning"
      ? "text-amber-500"
      : type === "error"
      ? "text-red-500"
      : "text-emerald-500";

  return (
    <div className="flex items-start gap-3">
      <span className={`text-lg ${color}`}>{icon}</span>
      <div>
        <p className="text-gray-700 dark:text-gray-200">{text}</p>
        <p className="text-xs text-gray-400">{time}</p>
      </div>
    </div>
  );
};

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
