import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  Percent,
  Users,
  ArrowRight,
  Truck,
  Moon,
  Sun,
} from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

import DashboardTable from "../../layout/dashboard/DashboardTableLayout.tsx";

// TYPES
type StatConfig = {
  id: string;
  title: string;
  value: number;
  suffix?: string;
  gradient: string;
  iconBg: string;
  sparkColor: string;
  sparkData: { value: number }[];
  icon: React.ReactNode;
};

const Dashboard: React.FC = () => {
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  // Apply dark mode to <html> tag
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

    // initialize
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
      sparkColor: "#22c55e",
      sparkData: [
        { value: 3 },
        { value: 6 },
        { value: 4 },
        { value: 8 },
        { value: 7 },
      ],
      icon: <ShoppingCart size={32} />,
    },
    {
      id: "saleRate",
      title: "Sale Rate",
      value: 30,
      suffix: "%",
      gradient: "from-amber-400 to-yellow-500",
      iconBg: "bg-yellow-100 text-amber-500",
      sparkColor: "#fbbf24",
      sparkData: [
        { value: 10 },
        { value: 20 },
        { value: 15 },
        { value: 30 },
        { value: 28 },
      ],
      icon: <Percent size={32} />,
    },
    {
      id: "users",
      title: "Users",
      value: 100,
      gradient: "from-green-800 to-green-600",
      iconBg: "bg-green-100 text-green-700",
      sparkColor: "#16a34a",
      sparkData: [
        { value: 40 },
        { value: 60 },
        { value: 55 },
        { value: 80 },
        { value: 100 },
      ],
      icon: <Users size={32} />,
    },
    {
      id: "drivers",
      title: "Available Drivers",
      value: 10,
      gradient: "from-blue-900 to-blue-700",
      iconBg: "bg-blue-100 text-blue-700",
      sparkColor: "#1d4ed8",
      sparkData: [
        { value: 2 },
        { value: 4 },
        { value: 6 },
        { value: 8 },
        { value: 10 },
      ],
      icon: <Truck size={32} />,
    },
  ];

  // Mini analytics panel data (weekly overview)
  const activityData = [
    { name: "Mon", orders: 12, users: 30 },
    { name: "Tue", orders: 18, users: 42 },
    { name: "Wed", orders: 9, users: 25 },
    { name: "Thu", orders: 20, users: 55 },
    { name: "Fri", orders: 26, users: 70 },
    { name: "Sat", orders: 22, users: 64 },
    { name: "Sun", orders: 14, users: 38 },
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
      {/* subtle animated background particles */}
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

      {/* HEADER: title + dark mode toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            CarryGrocer • Operations & Performance
          </p>
        </div>

        {/* Dark mode toggle */}
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

      {/* WELCOME WAVE CARD: greeting + time + weather + system status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-500 text-white shadow-xl px-5 py-4 md:px-6 md:py-5"
      >
        {/* wave highlight */}
        <div className="pointer-events-none absolute -bottom-16 right-[-40px] h-40 w-64 bg-white/15 rounded-[100%] blur-3xl" />

        <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-8 relative z-10">
          {/* left: greeting + time/date + system status */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center shadow-lg">
                <ShoppingCart size={22} className="text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-100">
                  CarryGrocer Admin
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

            {/* system status chips */}
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

          {/* right: weather card */}
          <div className="w-full md:w-64 lg:w-72">
            <div className="h-full rounded-xl bg-emerald-900/30 border border-emerald-300/40 px-4 py-3 flex flex-col justify-between">
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
                <span className="font-semibold">4 PM – 8 PM</span> due to
                cooler conditions.
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

      {/* MINI ANALYTICS PANEL (weekly overview) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="p-4 md:p-5 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-3">
          <div>
            <h3 className="text-sm md:text-base font-semibold">
              Weekly Activity Overview
            </h3>
            <p className="text-[0.75rem] text-gray-500 dark:text-gray-400">
              Orders and user engagement trend for the past 7 days.
            </p>
          </div>
        </div>
        <div className="h-40 md:h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData}>
              <Area
                type="monotone"
                dataKey="orders"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#0ea5e9"
                fill="#0ea5e9"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Divider */}
      <div className="h-[1px] bg-gray-200 dark:bg-slate-800 rounded-full" />

      {/* TABLE */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
        <DashboardTable />
      </div>
    </div>
  );
};

export default Dashboard;

/* ===========================================
   STAT CARD COMPONENT
=========================================== */
function DashboardStatCard({
  title,
  value,
  suffix,
  gradient,
  iconBg,
  sparkColor,
  sparkData,
  icon,
}: StatConfig) {
  const displayValue = useCountUp(value, 600);

  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -4 }}
      transition={{ type: "spring", stiffness: 200, damping: 16 }}
      className={`flex flex-col gap-4 p-4 rounded-2xl shadow-xl bg-gradient-to-br ${gradient} text-white backdrop-blur-md`}
    >
      <div className="flex items-start gap-3">
        <motion.div
          whileHover={{ scale: 1.08 }}
          className={`p-3 rounded-full shadow ${iconBg}`}
        >
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

      <div className="h-14 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData}>
            <Area
              type="monotone"
              dataKey="value"
              stroke={sparkColor}
              fill={sparkColor}
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <button className="group flex items-center gap-2 text-xs font-medium text-white/90 hover:text-white">
        More Info
        <ArrowRight
          size={18}
          className="transition-transform group-hover:translate-x-1"
        />
      </button>
    </motion.div>
  );
}

/* ===========================================
   COUNT-UP HOOK
=========================================== */
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
