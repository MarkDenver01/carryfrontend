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
      {/* Background FX */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl"
          animate={{ y: [0, 10, 0], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-0 h-52 w-52 rounded-full bg-green-600/10 blur-3xl"
          animate={{ y: [0, -15, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 14, repeat: Infinity }}
        />
      </div>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            CarryGrocer • Super Admin Panel
          </p>
        </div>

        {/* Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow hover:shadow-lg"
        >
          {isDarkMode ? (
            <>
              <Sun size={16} className="text-yellow-400" />
              <span className="text-xs">Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={16} className="text-slate-700" />
              <span className="text-xs">Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {/* WELCOME CARD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-500 text-white shadow-xl px-6 py-5"
      >
        <div className="absolute -bottom-16 right-[-40px] h-40 w-64 bg-white/15 rounded-full blur-3xl"></div>

        <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center shadow-lg">
                <ShoppingCart size={22} />
              </div>
              <div>
                <p className="text-xs text-emerald-100 uppercase">
                  CarryGrocer Super Admin
                </p>
                <h2 className="text-lg font-semibold">
                  {greeting}, Admin 👋
                </h2>
              </div>
            </div>

            <p className="text-xs text-emerald-50 mb-2">
              Here’s your operational snapshot for today.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span>📅 {dateLabel}</span>
              <span className="opacity-60">•</span>
              <span>⏰ {currentTime}</span>
              <span className="opacity-60">•</span>
              <span>
                Updated:{" "}
                {secondsSinceUpdate === 0
                  ? "just now"
                  : `${secondsSinceUpdate}s ago`}
              </span>
            </div>

            {/* Status */}
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {systemStatus.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-300/40 bg-emerald-900/30"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${item.color}`}
                  ></span>
                  <span className="font-semibold">{item.label}</span>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weather */}
          <div className="w-full md:w-64">
            <div className="h-full border border-emerald-300/40 bg-emerald-900/30 rounded-xl px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-emerald-100 uppercase">Weather</p>
                <span className="text-xs">Tanauan, Batangas</span>
              </div>

              <div className="flex justify-between items-center mt-2">
                <div>
                  <p className="text-3xl font-bold">28°C</p>
                  <p className="text-xs opacity-80">Cloudy • Humid</p>
                </div>
                <div className="text-4xl">🌥️</div>
              </div>

              <p className="text-[0.7rem] mt-2 opacity-90">
                Best delivery time: <strong>4 PM – 8 PM</strong>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* STATS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {stats.map((s) => (
          <DashboardStatCard key={s.id} {...s} />
        ))}
      </motion.div>

      {/** SYSTEM HEALTH SUMMARY (Option A) */}
      <SectionWrapper title="System Health Summary">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <HealthCard label="API Response Time" value="120ms" status="Optimal" />
          <HealthCard label="Database Ping" value="42ms" status="Stable" />
          <HealthCard label="SMS Gateway" value="89ms" status="Normal" />
          <HealthCard label="System Uptime" value="99.98%" status="Healthy" />
        </div>
      </SectionWrapper>

      {/** ADMIN ACTIVITY SUMMARY (Option B) */}
      <SectionWrapper title="Admin Activity Summary">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <HealthCard label="Admin Accounts" value="2" status="All Active" />
          <HealthCard label="Sub Admin Accounts" value="4" status="No Issues" />
          <HealthCard label="Roles Assigned" value="6" status="Verified" />
          <HealthCard label="Active Permissions" value="18" status="Normal" />
        </div>
      </SectionWrapper>

      {/** INVENTORY ALERTS (Option C) */}
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

      {/** STORE PERFORMANCE SNAPSHOT (Option D) */}
      <SectionWrapper title="Store Performance Snapshot">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <PerformanceCard label="Today's Revenue" value="₱12,450" />
          <PerformanceCard label="Orders Today" value="32" />
          <PerformanceCard label="New Users" value="6" />
          <PerformanceCard label="Driver Availability" value="82%" />
        </div>
      </SectionWrapper>

      {/* LOGS */}
      <SectionWrapper title="Recent Activity Logs">
        <div className="space-y-3 text-sm">
          <LogItem
            icon="✔"
            text='Admin Denver added product "Milo 1KG"'
            time="4:32 PM"
          />
          <LogItem
            icon="✔"
            text='Sub Admin Anne updated "Pancit Canton" stock'
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
      </SectionWrapper>

      {/* TABLE */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
        <DashboardTable />
      </div>
    </div>
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700"
    >
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {children}
    </motion.div>
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
}: StatConfig) {
  const displayValue = useCountUp(value);

  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -4 }}
      className={`flex flex-col gap-4 p-4 rounded-2xl shadow-xl bg-gradient-to-br ${gradient} text-white`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-3 rounded-full ${iconBg}`}>{icon}</div>

        <div>
          <p className="text-xs opacity-80">{title}</p>
          <p className="text-3xl font-extrabold">
            {displayValue}
            {suffix || ""}
          </p>
        </div>
      </div>

      <p className="text-xs opacity-80 mt-2">Updated a moment ago</p>
    </motion.div>
  );
}

/* ============================
   HEALTH CARD
============================ */
function HealthCard({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
      <p className="text-xs text-emerald-500 mt-1">{status}</p>
    </div>
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
    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl">
      <p className="text-sm text-red-700 dark:text-red-400">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
      <p className="text-xs text-red-500 dark:text-red-300 mt-1">{desc}</p>
    </div>
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
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-xl">
      <p className="text-sm text-blue-700 dark:text-blue-400">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

/* ============================
   LOG ITEM
============================ */
function LogItem({
  icon,
  text,
  time,
  type = "info",
}: {
  icon: string;
  text: string;
  time: string;
  type?: "info" | "warning" | "error";
}) {
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
        <p>{text}</p>
        <p className="text-xs text-gray-400">{time}</p>
      </div>
    </div>
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
