// src/page/dashboard/SubDashboard.tsx

import React, { useState, useEffect } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { ShoppingCart, ClipboardCheck, Package, Truck } from "lucide-react";
import { motion } from "framer-motion";

import {
  fetchAllOrders,
  fetchAllRiders,
} from "../../libs/ApiGatewayDatasource";

export default function SubDashboard() {
  /* ============================================================
     CLOCK + CURSOR STATES
  ============================================================ */
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  /* ============================================================
     ORDERS & RIDERS OVERVIEW
  ============================================================ */
  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [inTransitOrders, setInTransitOrders] = useState(0);
  const [activeDrivers, setActiveDrivers] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);

  /* ============================================================
     CUSTOMER GROWTH PERFORMANCE (UI ONLY, NO BACKEND YET)
  ============================================================ */
  const [customerToday] = useState(12);
  const [customerMonth] = useState(340);
  const [customerYear] = useState(1248);

  const [customerTrend] = useState([
    50, 70, 90, 110, 140, 155, 170, 200, 230, 260, 280, 320,
  ]);

  /* ============================================================
     CLOCK DISPLAY
  ============================================================ */
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-PH", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      setCurrentDate(
        now.toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  /* ============================================================
     CURSOR LIGHT EFFECT
  ============================================================ */
  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  /* ============================================================
     NORMALIZE STATUS VALUES
  ============================================================ */
  const normalizeStatus = (status: any): string =>
    status ? String(status).trim().toUpperCase().replace(/\s+/g, "_") : "";

  const normalizeRiderStatus = (status: any): string =>
    status ? String(status).trim().toUpperCase() : "";

  /* ============================================================
     COMPUTE ORDER STATISTICS
  ============================================================ */
  const computeOrderStats = (orders: any[]) => {
    let pending = 0;
    let inTransit = 0;

    orders.forEach((order) => {
      const raw = order.status ?? order.orderStatus ?? order.deliveryStatus;
      const s = normalizeStatus(raw);
      if (s === "PENDING") pending++;
      if (s === "IN_TRANSIT") inTransit++;
    });

    return { total: orders.length, pending, inTransit };
  };

  /* ============================================================
     LOAD DASHBOARD STATS
  ============================================================ */
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoadingStats(true);

        const [orders, riders] = await Promise.all([
          fetchAllOrders(),
          fetchAllRiders(),
        ]);

        const stats = computeOrderStats(orders);
        setTotalOrders(stats.total);
        setPendingOrders(stats.pending);
        setInTransitOrders(stats.inTransit);

        const availableRiders = riders.filter(
          (r: any) => normalizeRiderStatus(r.status) === "AVAILABLE"
        ).length;
        setActiveDrivers(availableRiders);
      } catch (err) {
        console.error("❌ Failed to load SubDashboard stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, []);

  /* ============================================================
     UI RENDER
  ============================================================ */
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      onMouseMove={handleMouseMove}
      className="relative p-6 md:p-8 flex flex-col gap-10 overflow-hidden"
    >
      {/* BACKGROUND GLOW */}
      <DashboardBackground cursorPos={cursorPos} />

      {/* HEADER */}
      <DashboardHeader
        greeting={greeting()}
        currentDate={currentDate}
        currentTime={currentTime}
      />

      {/* MAIN HUD CONTAINER */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative rounded-[26px] border border-emerald-500/30 bg-white/95 
                   dark:bg-slate-950/90 shadow-[0_22px_70px_rgba(15,23,42,0.5)] overflow-hidden"
      >
        <div className="flex flex-col gap-8 p-6">

          {/* NOTIFICATION BANNER */}
          <NotifBanner />

          {/* ORDER + DRIVER STAT CARDS */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SubStatCard
              gradient="from-emerald-600 to-green-700"
              iconBg="bg-emerald-100 text-emerald-600"
              Icon={ShoppingCart}
              value={totalOrders}
              label="Total Orders"
              helper="All system orders"
              loading={loadingStats}
            />
            <SubStatCard
              gradient="from-blue-700 to-blue-900"
              iconBg="bg-blue-100 text-blue-600"
              Icon={Package}
              value={pendingOrders}
              label="Pending Orders"
              helper="Awaiting processing"
              loading={loadingStats}
            />
            <SubStatCard
              gradient="from-amber-500 to-amber-700"
              iconBg="bg-amber-100 text-amber-700"
              Icon={ClipboardCheck}
              value={inTransitOrders}
              label="In Transit"
              helper="Currently delivering"
              loading={loadingStats}
            />
            <SubStatCard
              gradient="from-indigo-700 to-indigo-900"
              iconBg="bg-indigo-100 text-indigo-600"
              Icon={Truck}
              value={activeDrivers}
              label="Active Drivers"
              helper="Available riders"
              loading={loadingStats}
            />
          </section>

          {/* ========================================================
               CUSTOMER GROWTH PERFORMANCE (UI-ONLY)
          ======================================================== */}
          <CustomerGrowthSection
            today={customerToday}
            month={customerMonth}
            year={customerYear}
            trend={customerTrend}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============================================================
   COMPONENTS
============================================================ */

/* BACKGROUND GLOW */
function DashboardBackground({ cursorPos }: any) {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 -z-30">
        <div className="w-full h-full opacity-40 mix-blend-soft-light
                        bg-[linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),
                        linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)]
                        bg-[size:40px_40px]" />

        <motion.div
          className="absolute -top-20 -left-16 h-64 w-64 bg-emerald-500/30 blur-3xl"
          animate={{
            x: [0, 25, 10, -5, 0],
            y: [0, 10, 20, 5, 0],
            borderRadius: ["45%", "60%", "55%", "65%", "45%"],
          }}
          transition={{ duration: 22, repeat: Infinity }}
        />

        <motion.div
          className="absolute right-0 bottom-[-6rem] h-72 w-72 bg-sky-400/30 blur-3xl"
          animate={{
            x: [0, -20, -30, -10, 0],
            y: [0, -10, -25, -5, 0],
            borderRadius: ["55%", "70%", "60%", "65%", "55%"],
          }}
          transition={{ duration: 24, repeat: Infinity }}
        />
      </div>

      <motion.div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background: `radial-gradient(500px at ${cursorPos.x}px ${cursorPos.y}px,
            rgba(34,197,94,0.24), transparent 70%)`,
        }}
        animate={{ opacity: [0.6, 1, 0.85] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
    </>
  );
}

/* DASHBOARD HEADER */
function DashboardHeader({ greeting, currentDate, currentTime }: any) {
  return (
    <div className="relative">
      <h1 className="text-3xl font-extrabold bg-gradient-to-r
                     from-emerald-400 via-emerald-500 to-green-600
                     bg-clip-text text-transparent">
        Sub Admin Dashboard
      </h1>

      <div className="mt-1 flex items-center gap-2">
        <span className="px-3 py-1 text-[0.7rem] font-semibold rounded-full
                       border border-emerald-300/70 bg-emerald-50 text-emerald-700">
          SUB ADMIN
        </span>
        <span className="text-xs text-gray-500">Daily operations overview</span>
      </div>

      <p className="text-gray-600 text-sm mt-1">{greeting}, Anne 👋</p>
      <p className="text-xs text-gray-500">
        📅 {currentDate} • ⏰ {currentTime}
      </p>

      <div className="mt-3 h-[3px] w-24 rounded-full
                       bg-gradient-to-r from-emerald-400 via-emerald-500 to-transparent" />
    </div>
  );
}

/* NOTIFICATION */
function NotifBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-3 p-3 rounded-xl bg-yellow-50
                 border border-yellow-300 shadow-sm"
    >
      <span className="mt-0.5 text-lg">⚠️</span>
      <div>
        <p className="text-sm font-medium text-yellow-800">
          Operational Reminder
        </p>
        <p className="text-xs text-yellow-700 mt-0.5">
          Prioritize packing and dispatching pending orders today.
        </p>
      </div>
    </motion.div>
  );
}

/* CUSTOMER GROWTH SECTION */
function CustomerGrowthSection({ today, month, year, trend }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="mt-2 p-5 rounded-2xl border border-emerald-400/40
                 bg-white/90 dark:bg-slate-900/70 shadow-lg"
    >
      <h2 className="text-lg font-bold text-emerald-600">
        📈 Customer Growth Performance
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <GrowthCard label="New Customers Today" value={today} />
        <GrowthCard label="Customers This Month" value={month} />
        <GrowthCard label="Customers This Year" value={year} />
      </div>

      {/* Mini Bar Chart */}
      <div className="mt-6">
        <p className="text-xs text-gray-500 mb-2">12-Month Trend</p>

        <div className="flex items-end gap-2 h-28">
          {trend.map((v: number, i: number) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{
                height: `${(v / Math.max(...trend)) * 100}%`,
              }}
              transition={{ duration: 0.7, delay: i * 0.05 }}
              className="bg-emerald-500/80 rounded-md shadow-sm w-[18px]"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* SMALL CARD FOR CUSTOMER METRICS */
function GrowthCard({ label, value }: any) {
  return (
    <div className="p-4 border rounded-xl bg-emerald-50 border-emerald-200">
      <p className="text-sm text-emerald-700">{label}</p>
      <p className="text-3xl font-bold text-emerald-800">{value}</p>
    </div>
  );
}

/* STAT CARD GENERIC */
type SubStatCardProps = {
  gradient: string;
  iconBg: string;
  Icon: React.ElementType;
  value: any;
  label: string;
  helper?: string;
  loading?: boolean;
};

function SubStatCard({
  gradient,
  iconBg,
  Icon,
  value,
  label,
  helper,
  loading,
}: SubStatCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.03, rotateX: -4, rotateY: 4 }}
      transition={{ duration: 0.35 }}
      className={`relative flex flex-col gap-3 p-4 rounded-2xl border border-white/20
                 text-white bg-gradient-to-br ${gradient} shadow-xl`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon size={40} />
        </div>

        <div>
          <p className="text-xs text-white/90">{label}</p>
          <p className="text-3xl font-extrabold mt-0.5">
            {loading ? "…" : value}
          </p>
          {helper && (
            <p className="text-[0.7rem] text-white/80 mt-0.5">{helper}</p>
          )}
        </div>
      </div>
    </motion.article>
  );
}
