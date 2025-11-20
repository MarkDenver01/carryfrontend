import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  Percent,
  Users,
  ArrowRight,
  Truck,
  Filter,
  PlusCircle,
  FileBarChart2,
  Bell,
  Moon,
  Sun,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";

import DashboardTable from "../../layout/dashboard/DashboardTableLayout.tsx";

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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);

  // Just for display – UI only
  useEffect(() => {
    setSecondsSinceUpdate(0);
    const interval = setInterval(() => {
      setSecondsSinceUpdate((prev) => prev + 1);
    }, 1000);

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
      sparkData: [{ value: 3 }, { value: 6 }, { value: 4 }, { value: 8 }, { value: 7 }],
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
      sparkData: [{ value: 10 }, { value: 20 }, { value: 15 }, { value: 30 }, { value: 28 }],
      icon: <Percent size={32} />,
    },
    {
      id: "users",
      title: "Number of Users",
      value: 100,
      gradient: "from-green-800 to-green-600",
      iconBg: "bg-green-100 text-green-700",
      sparkColor: "#16a34a",
      sparkData: [{ value: 40 }, { value: 60 }, { value: 55 }, { value: 80 }, { value: 100 }],
      icon: <Users size={32} />,
    },
    {
      id: "drivers",
      title: "Available Drivers",
      value: 10,
      gradient: "from-blue-900 to-blue-700",
      iconBg: "bg-blue-100 text-blue-700",
      sparkColor: "#1d4ed8",
      sparkData: [{ value: 2 }, { value: 4 }, { value: 6 }, { value: 8 }, { value: 10 }],
      icon: <Truck size={32} />,
    },
  ];

  const dateLabel = new Date().toLocaleDateString("en-PH", {
    weekday: "long",
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  return (
    <div
      className={`p-6 flex flex-col gap-8 transition-colors duration-300 ${
        isDarkMode ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* HEADER: TITLE + DATE + CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Today • {dateLabel}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Last updated:{" "}
            {secondsSinceUpdate === 0
              ? "Just now"
              : `${secondsSinceUpdate} second${secondsSinceUpdate > 1 ? "s" : ""} ago`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filter buttons (UI-only) */}
          <div className="flex items-center gap-2 bg-white/70 dark:bg-slate-900/70 border border-gray-200/60 dark:border-slate-700 rounded-full px-2 py-1 shadow-sm">
            <button className="text-xs md:text-sm px-3 py-1 rounded-full bg-emerald-500 text-white font-medium shadow">
              Today
            </button>
            <button className="text-xs md:text-sm px-3 py-1 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-slate-800/80">
              This Week
            </button>
            <button className="text-xs md:text-sm px-3 py-1 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-slate-800/80">
              This Month
            </button>
            <button className="hidden md:inline-flex items-center gap-1 text-xs md:text-sm px-3 py-1 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-slate-800/80">
              <Filter size={14} />
              Custom
            </button>
          </div>

          {/* Notification button (UI-only) */}
          <button className="relative inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/80 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition">
            <Bell size={18} className="text-gray-600 dark:text-gray-300" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[0.6rem] text-white flex items-center justify-center">
              3
            </span>
          </button>

          {/* Dark mode toggle (local to this dashboard) */}
          <button
            onClick={() => setIsDarkMode((prev) => !prev)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md text-xs md:text-sm font-medium"
          >
            {isDarkMode ? (
              <>
                <Sun size={14} className="text-yellow-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon size={14} className="text-slate-700" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="flex flex-wrap gap-3">
        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs md:text-sm font-medium shadow hover:bg-emerald-700 transition">
          <PlusCircle size={16} />
          Add New Order
        </button>
        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs md:text-sm font-medium shadow hover:bg-blue-700 transition">
          <Truck size={16} />
          Register Driver
        </button>
        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500 text-white text-xs md:text-sm font-medium shadow hover:bg-amber-600 transition">
          <ShoppingCart size={16} />
          Add Product
        </button>
        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 dark:bg-slate-900/80 text-gray-700 dark:text-gray-200 text-xs md:text-sm font-medium border border-gray-200 dark:border-slate-700 shadow hover:bg-gray-50 dark:hover:bg-slate-800 transition">
          <FileBarChart2 size={16} />
          Generate Report
        </button>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <DashboardStatCard
            key={stat.id}
            {...stat}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>

      {/* DIVIDER */}
      <div className="h-[1px] bg-gray-200/70 dark:bg-slate-800/80 rounded-full" />

      {/* TABLE + SIDE PANEL */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main table */}
        <div className="flex-1 p-4 bg-white/80 dark:bg-slate-900/80 rounded-xl shadow-lg border border-gray-200/70 dark:border-slate-700 backdrop-blur-md">
          <DashboardTable />
        </div>

        {/* Side panel (notifications / info) */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-gray-200/70 dark:border-slate-700 shadow-md backdrop-blur-md">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Bell size={16} className="text-amber-500" />
              Alerts & Notifications
            </h2>
            <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                <span>
                  3 orders have been pending for more than{" "}
                  <span className="font-semibold">30 minutes</span>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span>
                  5 products are hitting{" "}
                  <span className="font-semibold">low stock levels</span>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>
                  2 new drivers have been{" "}
                  <span className="font-semibold">approved today</span>.
                </span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 text-white shadow-lg">
            <h3 className="text-sm font-semibold mb-1">
              Operational Note
            </h3>
            <p className="text-xs text-emerald-50">
              Monitor peak hours between <span className="font-semibold">4 PM – 8 PM</span> for
              increased orders and coordinate driver assignments accordingly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ========================================================
   REUSABLE STAT CARD WITH COUNTER + SPARKLINE
======================================================== */

type DashboardStatCardProps = StatConfig & {
  isDarkMode: boolean;
};

const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
  title,
  value,
  suffix,
  gradient,
  iconBg,
  sparkColor,
  sparkData,
  icon,
}) => {
  const displayValue = useCountUp(value, 700); // 700ms animation

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -3 }}
      transition={{ type: "spring", stiffness: 220, damping: 16 }}
      className={`
        flex flex-col justify-between gap-4 p-4 
        rounded-2xl shadow-lg text-white 
        bg-gradient-to-br ${gradient}
        border border-white/20 backdrop-blur-md
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full shadow ${iconBg}`}>
            {icon}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-white/80">
              {title}
            </p>
            <p className="text-3xl md:text-4xl font-extrabold leading-tight">
              {displayValue}
              {suffix ? suffix : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Sparkline chart */}
      <div className="h-14 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData}>
            <Area
              type="monotone"
              dataKey="value"
              stroke={sparkColor}
              fill={sparkColor}
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <button className="group flex items-center gap-2 text-xs md:text-sm font-semibold text-white/90 hover:text-white mt-1">
        More Info
        <ArrowRight
          size={18}
          className="transition-transform group-hover:translate-x-1"
        />
      </button>
    </motion.div>
  );
};

/* ========================================================
   SIMPLE COUNT-UP HOOK (UI ONLY)
======================================================== */

function useCountUp(target: number, duration: number = 800): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let animationFrame: number;
    const start = performance.now();

    const animate = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.round(progress * target);
      setValue(current);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return value;
}

export default Dashboard;
