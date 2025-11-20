import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  Percent,
  Users,
  ArrowRight,
  Truck,
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
      title: "Users",
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
    <div className={`p-6 flex flex-col gap-8 bg-gray-50 text-gray-900`}>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Dashboard Overview
          </h1>

          <p className="text-sm text-gray-500">Today • {dateLabel}</p>

          <p className="text-xs text-gray-400 mt-1">
            Last updated:{" "}
            {secondsSinceUpdate === 0 ? "Just now" : `${secondsSinceUpdate}s ago`}
          </p>
        </div>

        {/* Dark Mode Placeholder (UI only – optional) */}
        {/* Removed notifications, filters, quick actions */}
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <DashboardStatCard key={stat.id} {...stat} />
        ))}
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-gray-200 rounded-full" />

      {/* TABLE */}
      <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-200">
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
      whileHover={{ scale: 1.03, y: -3 }}
      transition={{ type: "spring", stiffness: 200, damping: 16 }}
      className={`flex flex-col gap-4 p-4 rounded-2xl shadow-lg text-white bg-gradient-to-br ${gradient}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-3 rounded-full shadow ${iconBg}`}>{icon}</div>

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
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <button className="group flex items-center gap-2 text-xs font-semibold text-white/90 hover:text-white">
        More Info
        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
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
