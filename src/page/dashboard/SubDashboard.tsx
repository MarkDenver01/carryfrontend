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

/* ===============================
   GENERIC HELPERS
================================ */

const normalizeStatus = (status: any): string => {
  if (!status) return "";
  return String(status).trim().toUpperCase().replace(/\s+/g, "_");
};

const normalizeRiderStatus = (status: any): string => {
  if (!status) return "";
  return String(status).trim().toUpperCase();
};

const getOrderStatusNorm = (order: any): string =>
  normalizeStatus(order?.status ?? order?.orderStatus ?? order?.deliveryStatus);

const getOrderDate = (order: any): Date | null => {
  const raw =
    order?.createdAt ??
    order?.orderDate ??
    order?.created_at ??
    order?.timestamp ??
    null;

  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatTimeHM = (d: Date | null) =>
  d
    ? d.toLocaleTimeString("en-PH", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const clamp = (val: number, min: number, max: number) =>
  Math.min(max, Math.max(min, val));

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function SubDashboard() {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [inTransitOrders, setInTransitOrders] = useState(0);
  const [activeDrivers, setActiveDrivers] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);

  // Raw data for analytics widgets
  const [orders, setOrders] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);

  // For rotating activity feed
  const [activityIndex, setActivityIndex] = useState(0);

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

  // COMPUTE SUMMARY STATS
  const computeOrderStats = (ordersList: any[]) => {
    let pending = 0;
    let inTransit = 0;

    ordersList.forEach((order) => {
      const norm = getOrderStatusNorm(order);
      if (norm === "PENDING") pending += 1;
      if (norm === "IN_TRANSIT") inTransit += 1;
    });

    return {
      totalOrders: ordersList.length,
      pending,
      inTransit,
    };
  };

  // LOAD ALL STATS (ORDERS + RIDERS)
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoadingStats(true);

        const [ordersData, ridersData] = await Promise.all([
          fetchAllOrders(),
          fetchAllRiders(),
        ]);

        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setRiders(Array.isArray(ridersData) ? ridersData : []);

        const stats = computeOrderStats(ordersData || []);

        setTotalOrders(stats.totalOrders);
        setPendingOrders(stats.pending);
        setInTransitOrders(stats.inTransit);

        const availableCount = (ridersData || []).filter(
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

  // ACTIVITY FEED ROTATION TIMER
  const activityEvents = React.useMemo(
    () => buildActivityEvents(orders, riders),
    [orders, riders]
  );

  useEffect(() => {
    if (!activityEvents.length) return;
    const interval = setInterval(() => {
      setActivityIndex((prev) =>
        activityEvents.length === 0 ? 0 : (prev + 1) % activityEvents.length
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [activityEvents]);

  // ORDER GROUPS FOR ANALYTICS
  const now = new Date();
  const todayOrders = orders.filter((o) => {
    const d = getOrderDate(o);
    return d && isSameDay(d, now);
  });

  const yesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1
  );
  const yesterdayOrders = orders.filter((o) => {
    const d = getOrderDate(o);
    return d && isSameDay(d, yesterday);
  });

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
          <motion.span className="px-3 py-1 text-[0.7rem] font-semibold rounded-full border border-emerald-300/70 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700">
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

          {/* ANALYTICS & AI SUMMARY ROW */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2">
            <div className="lg:col-span-2">
              <AiSummaryCard
                orders={orders}
                riders={riders}
                todayOrders={todayOrders}
                yesterdayOrders={yesterdayOrders}
                loading={loadingStats}
              />
            </div>
            <div className="lg:col-span-1">
              <ActivityFeedCard
                events={activityEvents}
                activityIndex={activityIndex}
              />
            </div>
          </section>

          {/* RIDER PERFORMANCE + PRODUCT AFFINITY */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-1">
            <RiderPerformanceCard orders={orders} riders={riders} />
            <ProductAffinityCard orders={orders} />
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============================================================
   SUB ADMIN STAT CARD
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

/* ============================================================
   AI-STYLE SUMMARY CARD
============================================================ */

type AiSummaryCardProps = {
  orders: any[];
  riders: any[];
  todayOrders: any[];
  yesterdayOrders: any[];
  loading: boolean;
};

function AiSummaryCard({
  orders,
  riders,
  todayOrders,
  yesterdayOrders,
  loading,
}: AiSummaryCardProps) {
  // Total growth vs yesterday
 // Total growth vs yesterday
const todayCount = todayOrders.length;
const yesterdayCount = yesterdayOrders.length;

let growthLabel = "No previous data to compare.";

if (yesterdayCount === 0 && todayCount > 0) {
  growthLabel = `Up from 0 orders yesterday.`;
} else if (yesterdayCount > 0) {
  const diff = todayCount - yesterdayCount;
  const pct = (diff / yesterdayCount) * 100;
  const pctRounded = Math.round(pct);

  if (pctRounded > 0) {
    growthLabel = `${pctRounded}% higher than yesterday.`;
  } else if (pctRounded < 0) {
    growthLabel = `${Math.abs(pctRounded)}% lower than yesterday.`;
  } else {
    growthLabel = `Same as yesterday.`;
  }
}


  // Peak hour
  const hourBuckets: Record<number, number> = {};
  todayOrders.forEach((o) => {
    const d = getOrderDate(o);
    if (!d) return;
    const hour = d.getHours();
    hourBuckets[hour] = (hourBuckets[hour] || 0) + 1;
  });

  let peakHour: number | null = null;
  let peakCount = 0;
  Object.entries(hourBuckets).forEach(([hourStr, count]) => {
    const hour = Number(hourStr);
    if (count > peakCount) {
      peakCount = count;
      peakHour = hour;
    }
  });

  const activeRidersCount = riders.filter(
    (r: any) => normalizeRiderStatus(r.status) === "AVAILABLE"
  ).length;

  // Rider load today
  const riderOrderMap: Record<string, number> = {};
  todayOrders.forEach((o) => {
    const riderId =
      o?.rider?.riderId ??
      o?.rider?.id ??
      o?.riderId ??
      o?.assignedRiderId ??
      null;
    if (!riderId) return;
    riderOrderMap[String(riderId)] =
      (riderOrderMap[String(riderId)] || 0) + 1;
  });

  let busiestRiderName = "";
  let busiestRiderCount = 0;
  Object.entries(riderOrderMap).forEach(([riderId, count]) => {
    const r = riders.find(
      (rr: any) =>
        String(rr.riderId ?? rr.id ?? rr.rider_id ?? "") === riderId
    );
    if (count > busiestRiderCount && r) {
      busiestRiderCount = count;
      busiestRiderName = r.name ?? "Rider";
    }
  });

  const loadingText = loading ? "Analyzing live data…" : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/60 dark:from-emerald-900/20 dark:via-slate-900 dark:to-emerald-900/10 p-4 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <div>
          <h2 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            AI-style Operations Summary
          </h2>
          <p className="text-[0.72rem] text-emerald-700/80 dark:text-emerald-200/70">
            High-level overview of today&apos;s activity based on live data.
          </p>
        </div>
        <span className="inline-flex items-center rounded-full border border-emerald-300/70 bg-emerald-50 px-2 py-0.5 text-[0.65rem] font-semibold text-emerald-700">
          Live Insight
        </span>
      </div>

      <div className="mt-1 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="rounded-xl bg-white/90 dark:bg-slate-950/70 border border-emerald-100/80 dark:border-emerald-800/60 px-3 py-2">
          <p className="text-[0.7rem] text-emerald-600 dark:text-emerald-300">
            Today&apos;s Orders
          </p>
          <p className="mt-0.5 text-xl font-extrabold text-emerald-800 dark:text-emerald-100">
            {todayCount}
          </p>
          <p className="mt-0.5 text-[0.68rem] text-emerald-700/80 dark:text-emerald-200/80">
            {growthLabel}
          </p>
        </div>

        <div className="rounded-xl bg-white/90 dark:bg-slate-950/70 border border-emerald-100/80 dark:border-emerald-800/60 px-3 py-2">
          <p className="text-[0.7rem] text-emerald-600 dark:text-emerald-300">
            Traffic Pattern
          </p>
          <p className="mt-0.5 text-base font-semibold text-emerald-800 dark:text-emerald-100">
            {peakHour !== null ? `${peakHour}:00 hour` : "No clear peak yet"}
          </p>
          <p className="mt-0.5 text-[0.68rem] text-emerald-700/80 dark:text-emerald-200/80">
            {peakHour !== null
              ? `${peakCount} orders created during the busiest hour.`
              : "Orders are still evenly distributed so far."}
          </p>
        </div>

        <div className="rounded-xl bg-white/90 dark:bg-slate-950/70 border border-emerald-100/80 dark:border-emerald-800/60 px-3 py-2">
          <p className="text-[0.7rem] text-emerald-600 dark:text-emerald-300">
            Fleet & Workload
          </p>
          <p className="mt-0.5 text-base font-semibold text-emerald-800 dark:text-emerald-100">
            {activeRidersCount} active riders
          </p>
          <p className="mt-0.5 text-[0.68rem] text-emerald-700/80 dark:text-emerald-200/80">
            {busiestRiderName && busiestRiderCount > 0
              ? `${busiestRiderName} is handling the most orders today (${busiestRiderCount}).`
              : "Rider workload is currently balanced or no riders assigned yet."}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-emerald-100/60 dark:border-emerald-800/60 bg-emerald-900/5 px-3 py-2 text-[0.7rem] text-emerald-800/90 dark:text-emerald-100/80">
        <p className="font-semibold mb-0.5">System insight</p>
        {loadingText ? (
          <p>{loadingText}</p>
        ) : orders.length === 0 ? (
          <p>No orders available yet. Summary will update once data flows in.</p>
        ) : (
          <ul className="list-disc list-inside space-y-0.5">
            <li>
              Monitoring <strong>{orders.length}</strong> total orders across
              the system.
            </li>
            <li>
              Tracking rider availability to keep deliveries on-time and evenly
              distributed.
            </li>
            <li>
              Use this summary to prioritize staffing, packing, and rider
              dispatch.
            </li>
          </ul>
        )}
      </div>
    </motion.article>
  );
}

/* ============================================================
   ACTIVITY FEED CARD
============================================================ */

type ActivityEvent = {
  id: string;
  label: string;
  timeLabel: string;
  type: "order" | "rider";
};

type ActivityFeedCardProps = {
  events: ActivityEvent[];
  activityIndex: number;
};

function ActivityFeedCard({
  events,
  activityIndex,
}: ActivityFeedCardProps) {
  const visibleEvents =
    events.length === 0
      ? []
      : [...events.slice(activityIndex), ...events.slice(0, activityIndex)].slice(
          0,
          5
        );

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-900/80 p-4 shadow-sm"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Live Activity Feed
          </h2>
          <p className="text-[0.72rem] text-slate-500 dark:text-slate-400">
            Recent order and rider activities.
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-emerald-100/80 dark:bg-emerald-900/60 px-2 py-0.5 text-[0.65rem] font-semibold text-emerald-700 dark:text-emerald-200">
          ● Live
        </span>
      </div>

      {events.length === 0 ? (
        <div className="mt-2 text-[0.7rem] text-slate-500 dark:text-slate-400">
          No recent activity yet. Events will appear here as orders and rider
          updates occur.
        </div>
      ) : (
        <ul className="mt-2 space-y-1.5 text-[0.7rem]">
          {visibleEvents.map((ev) => (
            <li
              key={ev.id}
              className="flex items-start gap-2 rounded-lg px-2 py-1.5 bg-white/80 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-700/80"
            >
              <span
                className={`mt-1 h-1.5 w-1.5 rounded-full ${
                  ev.type === "order"
                    ? "bg-emerald-500"
                    : "bg-sky-400"
                } shadow-[0_0_6px_rgba(16,185,129,0.7)]`}
              />
              <div className="flex-1">
                <p className="text-slate-800 dark:text-slate-100">
                  {ev.label}
                </p>
                <p className="text-[0.65rem] text-slate-500 dark:text-slate-400">
                  {ev.timeLabel}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </motion.article>
  );
}

function buildActivityEvents(orders: any[], riders: any[]): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  orders.forEach((o: any) => {
    const d = getOrderDate(o);
    const timeLabel = d ? formatTimeHM(d) : "Time unknown";
    const id = String(
      o.id ?? o.orderId ?? o.order_id ?? `${o.customerName ?? "order"}-${timeLabel}`
    );
    const normStatus = getOrderStatusNorm(o);

    const customerName =
      o.customerName ??
      o.customer_name ??
      o.customer?.name ??
      "Customer";

    const riderName =
      o.rider?.name ??
      o.riderName ??
      o.assignedRiderName ??
      "Rider";

    if (normStatus === "DELIVERED") {
      events.push({
        id: `delivered-${id}`,
        label: `Order #${id} delivered by ${riderName}.`,
        timeLabel,
        type: "order",
      });
    } else if (normStatus === "IN_TRANSIT") {
      events.push({
        id: `intransit-${id}`,
        label: `Order #${id} is in transit with ${riderName}.`,
        timeLabel,
        type: "order",
      });
    } else if (normStatus === "PENDING") {
      events.push({
        id: `pending-${id}`,
        label: `${customerName} placed a new order #${id}.`,
        timeLabel,
        type: "order",
      });
    } else {
      events.push({
        id: `order-${id}`,
        label: `Order #${id} updated with status ${normStatus || "UNKNOWN"}.`,
        timeLabel,
        type: "order",
      });
    }
  });

  riders.forEach((r: any) => {
    const status = normalizeRiderStatus(r.status);
    const name = r.name ?? "Rider";

    if (status === "AVAILABLE") {
      events.push({
        id: `rider-available-${name}`,
        label: `${name} is available for new deliveries.`,
        timeLabel: "Now",
        type: "rider",
      });
    } else if (status === "ON_DELIVERY" || status === "ON DELIVERY") {
      events.push({
        id: `rider-on-${name}`,
        label: `${name} is currently on a delivery.`,
        timeLabel: "In-progress",
        type: "rider",
      });
    }
  });

  // Sort newest orders first, riders last
  return events.slice(0, 40);
}

/* ============================================================
   RIDER PERFORMANCE CARD
============================================================ */

type RiderPerformanceCardProps = {
  orders: any[];
  riders: any[];
};

function RiderPerformanceCard({
  orders,
  riders,
}: RiderPerformanceCardProps) {
  type RiderStat = {
    id: string;
    name: string;
    totalOrders: number;
    deliveredOrders: number;
  };

  const statsMap: Record<string, RiderStat> = {};

  orders.forEach((o) => {
    const normStatus = getOrderStatusNorm(o);
    const riderIdRaw =
      o?.rider?.riderId ??
      o?.rider?.id ??
      o?.riderId ??
      o?.assignedRiderId ??
      null;
    if (!riderIdRaw) return;
    const riderId = String(riderIdRaw);

    if (!statsMap[riderId]) {
      const r =
        o?.rider ||
        riders.find(
          (rr: any) =>
            String(rr.riderId ?? rr.id ?? rr.rider_id ?? "") === riderId
        ) ||
        {};
      statsMap[riderId] = {
        id: riderId,
        name: r.name ?? `Rider ${riderId}`,
        totalOrders: 0,
        deliveredOrders: 0,
      };
    }

    statsMap[riderId].totalOrders += 1;
    if (normStatus === "DELIVERED") {
      statsMap[riderId].deliveredOrders += 1;
    }
  });

  const stats = Object.values(statsMap).sort((a, b) => {
    if (b.deliveredOrders === a.deliveredOrders) {
      return b.totalOrders - a.totalOrders;
    }
    return b.deliveredOrders - a.deliveredOrders;
  });

  const topStats = stats.slice(0, 4);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full rounded-2xl border border-sky-200/80 dark:border-sky-800/80 bg-sky-50/70 dark:bg-slate-950/70 p-4 shadow-sm"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-semibold text-sky-900 dark:text-sky-100">
            Rider Performance
          </h2>
          <p className="text-[0.72rem] text-sky-700/90 dark:text-sky-300/80">
            Ranking based on completed and total assigned deliveries.
          </p>
        </div>
      </div>

      {topStats.length === 0 ? (
        <p className="mt-2 text-[0.7rem] text-sky-800/80 dark:text-sky-200/80">
          No rider assignments found yet. Performance data will appear once
          orders are linked to riders.
        </p>
      ) : (
        <ul className="mt-2 space-y-1.5 text-[0.7rem]">
          {topStats.map((rider, idx) => {
            const completionRate =
              rider.totalOrders === 0
                ? 0
                : (rider.deliveredOrders / rider.totalOrders) * 100;
            const completionRounded = clamp(
              Math.round(completionRate),
              0,
              100
            );

            return (
              <li
                key={rider.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-sky-100/80 dark:border-sky-800/80 bg-white/90 dark:bg-slate-950/70 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[0.68rem] font-semibold text-sky-600 dark:text-sky-300">
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-sky-900 dark:text-sky-100">
                      {rider.name}
                    </p>
                    <p className="text-[0.68rem] text-sky-700/80 dark:text-sky-200/80">
                      {rider.deliveredOrders} delivered / {rider.totalOrders}{" "}
                      assigned
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[0.68rem] font-semibold text-sky-900 dark:text-sky-100">
                    {completionRounded}%
                  </span>
                  <span className="mt-0.5 inline-flex h-1.5 w-16 overflow-hidden rounded-full bg-sky-100 dark:bg-sky-900">
                    <span
                      className="h-full rounded-full bg-sky-500"
                      style={{ width: `${completionRounded}%` }}
                    />
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </motion.article>
  );
}

/* ============================================================
   PRODUCT AFFINITY CARD (WHAT'S BOUGHT TOGETHER)
============================================================ */

type ProductAffinityCardProps = {
  orders: any[];
};

function ProductAffinityCard({ orders }: ProductAffinityCardProps) {
  type Pair = {
    a: string;
    b: string;
    count: number;
  };

  const pairMap: Record<string, Pair> = {};

  orders.forEach((o: any) => {
    const rawItems =
      o.items ?? o.orderItems ?? o.orderItemResponses ?? o.order_items ?? [];

    if (!Array.isArray(rawItems) || rawItems.length < 2) return;

    const productNames: string[] = [];

    rawItems.forEach((item: any) => {
      const name =
        item.productName ??
        item.product_name ??
        item.name ??
        item.product?.name ??
        `Product ${item.productId ?? item.id ?? "?"}`;
      if (name) productNames.push(String(name));
    });

    const uniqueNames = Array.from(new Set(productNames));
    if (uniqueNames.length < 2) return;

    for (let i = 0; i < uniqueNames.length; i++) {
      for (let j = i + 1; j < uniqueNames.length; j++) {
        const a = uniqueNames[i];
        const b = uniqueNames[j];
        const [first, second] = [a, b].sort();
        const key = `${first}__${second}`;

        if (!pairMap[key]) {
          pairMap[key] = { a: first, b: second, count: 0 };
        }
        pairMap[key].count += 1;
      }
    }
  });

  const pairs = Object.values(pairMap).sort((a, b) => b.count - a.count);
  const topPairs = pairs.slice(0, 5);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full rounded-2xl border border-emerald-200/80 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-slate-950/70 p-4 shadow-sm"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
            Frequently Bought Together
          </h2>
          <p className="text-[0.72rem] text-emerald-700/90 dark:text-emerald-300/80">
            Simple affinity view from past orders.
          </p>
        </div>
      </div>

      {topPairs.length === 0 ? (
        <p className="mt-2 text-[0.7rem] text-emerald-800/80 dark:text-emerald-200/80">
          Not enough multi-item orders yet to compute product affinities. As
          more orders contain multiple items, this section will reveal common
          bundles.
        </p>
      ) : (
        <ul className="mt-2 space-y-1.5 text-[0.7rem]">
          {topPairs.map((p) => (
            <li
              key={`${p.a}-${p.b}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-emerald-100/80 dark:border-emerald-800/80 bg-white/90 dark:bg-slate-950/70 px-3 py-2"
            >
              <div>
                <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                  {p.a}
                </p>
                <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                  + {p.b}
                </p>
                <p className="text-[0.68rem] text-emerald-700/80 dark:text-emerald-200/80 mt-0.5">
                  Bought together in{" "}
                  <strong className="font-semibold">{p.count}</strong>{" "}
                  {p.count === 1 ? "order" : "orders"}.
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </motion.article>
  );
}
