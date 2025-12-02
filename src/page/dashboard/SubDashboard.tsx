// src/page/dashboard/SubDashboard.tsx

import React, { useState, useEffect } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import {
  ShoppingCart,
  ClipboardCheck,
  Package,
  Truck,
} from "lucide-react";
import { motion } from "framer-motion";

import {
  fetchAllOrders,
  fetchAllRiders,
} from "../../libs/ApiGatewayDatasource";

export default function SubDashboard() {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [inTransitOrders, setInTransitOrders] = useState(0);
  const [activeDrivers, setActiveDrivers] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);

  // CLOCK
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

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // STATUS NORMALIZERS
  const normalizeStatus = (status: any): string => {
    if (!status) return "";
    return String(status).trim().toUpperCase().replace(/\s+/g, "_");
  };

  const normalizeRiderStatus = (status: any): string => {
    if (!status) return "";
    return String(status).trim().toUpperCase();
  };

  // COMPUTE SUMMARY STATS
  const computeOrderStats = (orders: any[]) => {
    let pending = 0;
    let inTransit = 0;

    orders.forEach((order) => {
      const rawStatus =
        order.status ?? order.orderStatus ?? order.deliveryStatus;
      const norm = normalizeStatus(rawStatus);

      if (norm === "PENDING") pending += 1;
      if (norm === "IN_TRANSIT") inTransit += 1;
    });

    return {
      totalOrders: orders.length,
      pending,
      inTransit,
    };
  };

  // LOAD ALL STATS (ORDERS + RIDERS)
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoadingStats(true);

        const [orders, riders] = await Promise.all([
          fetchAllOrders(),
          fetchAllRiders(),
        ]);

        const stats = computeOrderStats(orders);

        setTotalOrders(stats.totalOrders);
        setPendingOrders(stats.pending);
        setInTransitOrders(stats.inTransit);

        const availableCount = riders.filter(
          (r: any) => normalizeRiderStatus(r.status) === "AVAILABLE"
        ).length;

        setActiveDrivers(availableCount);
      } catch (err) {
        console.error("❌ Failed to load sub admin stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      className="relative p-6 md:p-8 flex flex-col gap-8 md:gap-10 overflow-hidden"
    >
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 -z-30">
        <div className="w-full h-full opacity-40 mix-blend-soft-light bg-[linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 opacity-[0.07] bg-[repeating-linear-gradient(to_bottom,rgba(15,23,42,0.9)_0px,rgba(15,23,42,0.9)_1px,transparent_1px,transparent_3px)]" />

        <motion.div
          className="absolute -top-20 -left-16 h-64 w-64 bg-emerald-500/28 blur-3xl"
          animate={{
            x: [0, 25, 10, -5, 0],
            y: [0, 10, 20, 5, 0],
            borderRadius: ["45%", "60%", "55%", "65%", "45%"],
          }}
          transition={{ duration: 22, repeat: Infinity }}
        />
        <motion.div
          className="absolute right-0 bottom-[-5rem] h-72 w-72 bg-sky-400/24 blur-3xl"
          animate={{
            x: [0, -20, -30, -10, 0],
            y: [0, -10, -25, -5, 0],
            borderRadius: ["55%", "70%", "60%", "65%", "55%"],
          }}
          transition={{ duration: 24, repeat: Infinity }}
        />
      </div>

      {/* CURSOR LIGHT */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background: `radial-gradient(520px at ${cursorPos.x}px ${cursorPos.y}px, rgba(34,197,94,0.24), transparent 70%)`,
        }}
        animate={{ opacity: [0.7, 1, 0.82] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* HEADER */}
      <div className="relative">
        <motion.h1
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-600 bg-clip-text text-transparent"
        >
          Sub Admin Dashboard
        </motion.h1>

        <div className="mt-1 flex items-center gap-2">
          <motion.span
            className="px-3 py-1 text-[0.7rem] font-semibold rounded-full border border-emerald-300/70 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700"
          >
            SUB ADMIN
          </motion.span>

          <span className="text-xs text-gray-500">
            Operations overview for daily order handling.
          </span>
        </div>

        <p className="text-gray-600 text-sm mt-1">{greeting()}, Anne 👋</p>
        <p className="text-xs text-gray-500">
          📅 {currentDate} • ⏰ {currentTime}
        </p>

        <div className="mt-3 h-[3px] w-24 bg-gradient-to-r from-emerald-400 via-emerald-500 to-transparent rounded-full" />
      </div>

      {/* MAIN HUD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative rounded-[26px] border border-emerald-500/30 bg-white/95 dark:bg-slate-950/90 shadow-[0_22px_70px_rgba(15,23,42,0.5)] overflow-hidden mt-1"
      >
        <div className="relative flex flex-col gap-6 p-5 md:p-6">

          {/* NOTIF BANNER */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-yellow-50 border border-yellow-300 shadow-sm"
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

          {/* STAT CARDS */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SubStatCard
              gradient="from-emerald-600 to-green-700"
              iconBg="bg-emerald-100 text-emerald-600"
              Icon={ShoppingCart}
              value={totalOrders}
              label="Total Orders"
              helper="All orders in the system"
              loading={loadingStats}
            />
            <SubStatCard
              gradient="from-blue-700 to-blue-900"
              iconBg="bg-blue-100 text-blue-600"
              Icon={Package}
              value={pendingOrders}
              label="Pending Orders"
              helper="Waiting for processing"
              loading={loadingStats}
            />
            <SubStatCard
              gradient="from-amber-500 to-amber-700"
              iconBg="bg-amber-100 text-amber-700"
              Icon={ClipboardCheck}
              value={inTransitOrders}
              label="In Transit"
              helper="Currently on the way"
              loading={loadingStats}
            />
            <SubStatCard
              gradient="from-indigo-700 to-indigo-900"
              iconBg="bg-indigo-100 text-indigo-600"
              Icon={Truck}
              value={activeDrivers}
              label="Active Drivers"
              helper="Available riders today"
              loading={loadingStats}
            />
          </section>

        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============================================================
   SUB ADMIN STAT CARD (CLEAN)
============================================================ */

type SubStatCardProps = {
  gradient: string;
  iconBg: string;
  Icon: React.ElementType;
  value: string | number;
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
  const displayValue = loading ? "…" : value;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -6,
        scale: 1.03,
        rotateX: -4,
        rotateY: 4,
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`relative flex flex-col gap-3 p-4 rounded-2xl border border-white/25 text-white bg-gradient-to-br ${gradient} shadow-xl transform-gpu`}
    >
      <div className="relative flex items-center gap-3 mt-1">
        <div className={`p-3 rounded-xl ${iconBg} shadow-md`}>
          <Icon size={40} />
        </div>

        <div>
          <p className="text-xs text-white/90">{label}</p>
          <p className="text-3xl font-extrabold mt-0.5">{displayValue}</p>
          {helper && (
            <p className="text-[0.7rem] text-white/80 mt-0.5">{helper}</p>
          )}
        </div>
      </div>
    </motion.article>
  );
}
