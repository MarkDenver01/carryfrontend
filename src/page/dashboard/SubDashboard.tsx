// src/page/dashboard/SubDashboard.tsx

import React, { useState, useEffect, useMemo } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import {
  ShoppingCart,
  ClipboardCheck,
  Package,
  Truck,
  AlertTriangle,
  Bell,
  MessageCircle,
  Clock,
  Users,
  Sun,
  CloudRain,
  Cloud,
  Thermometer,
  Activity,
  ShieldAlert,
  Megaphone,
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

  // store full data for semi-dynamic panels
  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [ridersData, setRidersData] = useState<any[]>([]);

  // simple local-only notes (placeholder for future backend)
  const [storeNotes, setStoreNotes] = useState(
    "Remind packers to double-check fragile items before dispatch."
  );
  const [shiftReminder] = useState<string>(
    "Today's goal: Keep pending orders under 5 at any time."
  );

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

  // HELPERS
  const parseDate = (raw: any): Date | null => {
    if (!raw) return null;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  };

  const getOrderCreatedAt = (order: any): Date | null => {
    return (
      parseDate(order.createdAt) ||
      parseDate(order.orderDate) ||
      parseDate(order.placedAt) ||
      parseDate(order.created_at) ||
      null
    );
  };

  const getLastActive = (rider: any): Date | null => {
    return (
      parseDate(rider.lastActive) ||
      parseDate(rider.lastSeenAt) ||
      parseDate(rider.lastOnlineAt) ||
      null
    );
  };

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

        const safeOrders = Array.isArray(orders) ? orders : [];
        const safeRiders = Array.isArray(riders) ? riders : [];

        setOrdersData(safeOrders);
        setRidersData(safeRiders);

        const stats = computeOrderStats(safeOrders);

        setTotalOrders(stats.totalOrders);
        setPendingOrders(stats.pending);
        setInTransitOrders(stats.inTransit);

        const availableCount = safeRiders.filter(
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

  // DERIVED SEMI-DYNAMIC DATA
  const {
    todayOrders,
    todayPending,
    todayInTransit,
    idleRiders,
    urgentOrders,
    unassignedPendingCount,
    checkInIssuesCount,
    recentRiderActivity,
    shiftsSummary,
  } = useMemo(() => {
    const now = new Date();
    const isSameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    let todayOrders = 0;
    let todayPending = 0;
    let todayInTransit = 0;
    let urgentOrders: any[] = [];
    let unassignedPendingCount = 0;

    const THIRTY_MIN = 30 * 60 * 1000;

    ordersData.forEach((order) => {
      const createdAt = getOrderCreatedAt(order);
      const rawStatus =
        order.status ?? order.orderStatus ?? order.deliveryStatus;
      const norm = normalizeStatus(rawStatus);

      if (createdAt && isSameDay(createdAt, now)) {
        todayOrders += 1;
        if (norm === "PENDING") todayPending += 1;
        if (norm === "IN_TRANSIT") todayInTransit += 1;
      }

      // unassigned + urgent logic
      const hasAssignedRider =
        order.riderId ||
        order.rider ||
        order.assignedRiderId ||
        order.assignedRider;

      if (norm === "PENDING" && !hasAssignedRider) {
        unassignedPendingCount += 1;
      }

      if (norm === "PENDING" && createdAt) {
        const age = now.getTime() - createdAt.getTime();
        if (age > THIRTY_MIN) {
          urgentOrders.push(order);
        }
      }
    });

    // sort urgent by oldest first
    urgentOrders.sort((a, b) => {
      const aDate = getOrderCreatedAt(a);
      const bDate = getOrderCreatedAt(b);
      if (!aDate || !bDate) return 0;
      return aDate.getTime() - bDate.getTime();
    });

    // riders side
    const idleRiders = ridersData.filter(
      (r) => normalizeRiderStatus(r.status) === "AVAILABLE"
    );

    let checkInIssuesCount = 0;
    const recentActivityCandidates: any[] = [];
    const shiftsSummary = {
      morning: 0,
      afternoon: 0,
      evening: 0,
    };

    const ONE_DAY = 24 * 60 * 60 * 1000;

    ridersData.forEach((r) => {
      const last = getLastActive(r);
      if (!last) {
        checkInIssuesCount += 1;
      } else {
        const age = now.getTime() - last.getTime();
        if (age > ONE_DAY) {
          checkInIssuesCount += 1;
        }

        // for "recent activity"
        recentActivityCandidates.push({ rider: r, last });

        // simple time-of-day "timeline"
        const hour = last.getHours();
        if (hour >= 6 && hour < 12) shiftsSummary.morning += 1;
        else if (hour >= 12 && hour < 18) shiftsSummary.afternoon += 1;
        else shiftsSummary.evening += 1;
      }
    });

    // latest 3
    recentActivityCandidates.sort((a, b) => b.last.getTime() - a.last.getTime());
    const recentRiderActivity = recentActivityCandidates
      .slice(0, 3)
      .map(({ rider, last }) => ({ rider, last }));

    return {
      todayOrders,
      todayPending,
      todayInTransit,
      idleRiders,
      urgentOrders,
      unassignedPendingCount,
      checkInIssuesCount,
      recentRiderActivity,
      shiftsSummary,
    };
  }, [ordersData, ridersData]);

  // CUTOFF INFO (7PM)
  const cutoffInfo = useMemo(() => {
    const now = new Date();
    const cutoff = new Date();
    cutoff.setHours(19, 0, 0, 0); // 7:00 PM

    let label = "";
    let percent = 0;

    const startOfDay = new Date();
    startOfDay.setHours(6, 0, 0, 0); // assume operations start 6AM

    const totalMs = cutoff.getTime() - startOfDay.getTime();
    const passedMs = now.getTime() - startOfDay.getTime();

    if (now >= cutoff) {
      label = "Cut-off reached for today";
      percent = 100;
    } else if (now <= startOfDay) {
      label = "Operations will start soon";
      percent = 0;
    } else {
      const remainingMs = cutoff.getTime() - now.getTime();
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const mins = Math.floor(
        (remainingMs - hours * 60 * 60 * 1000) / (1000 * 60)
      );
      label = `${hours}h ${mins}m remaining until delivery cut-off`;
      percent = Math.min(100, Math.max(0, (passedMs / totalMs) * 100));
    }

    return { label, percent: Number.isNaN(percent) ? 0 : percent };
  }, [currentTime]); // updates every second via clock

  // WEATHER PLACEHOLDER (BASED ON TIME)
  const weatherInfo = useMemo(() => {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 12) {
      return {
        label: "Morning • Clear skies",
        temp: "28°C",
        hint: "Good conditions for early dispatch.",
        icon: "sun",
      };
    }
    if (hour >= 12 && hour < 18) {
      return {
        label: "Afternoon • Partly cloudy",
        temp: "31°C",
        hint: "Watch out for heat; remind riders to hydrate.",
        icon: "cloud-sun",
      };
    }
    if (hour >= 18 && hour < 22) {
      return {
        label: "Evening • Possible light rain",
        temp: "26°C",
        hint: "Advise riders to prepare rain gear.",
        icon: "rain",
      };
    }
    return {
      label: "Late night • Calm traffic",
      temp: "24°C",
      hint: "Ideal for quick catch-up deliveries.",
      icon: "cloud",
    };
  }, [currentTime]);

  // QUICK ACTION HANDLERS (placeholder for future backend)
  const handleNotifyIdleRiders = () => {
    alert(
      "This would send a notification to idle riders. Connect this to your notification API."
    );
  };

  const handleNotifyAllDrivers = () => {
    alert(
      "This would notify all drivers about an important update. Connect this to your broadcast API."
    );
  };

  const handleNotifyStoreTeam = () => {
    alert(
      "This would notify the store team (packers/cashiers). Hook this up to your internal comms system."
    );
  };

  const handleEmergencyBroadcast = () => {
    alert(
      "EMERGENCY BROADCAST placeholder.\n\nIn production, this should trigger a high-priority message to all riders and store staff."
    );
  };

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

        <div className="mt-1 flex items-center gap-2 flex-wrap">
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
          {/* NOTIF BANNER (slightly smarter) */}
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
                {pendingOrders > 0
                  ? `You currently have ${pendingOrders} pending ${
                      pendingOrders === 1 ? "order" : "orders"
                    }. Prioritize packing and dispatching them.`
                  : "Keep monitoring throughout the day to ensure pending orders stay low."}
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

          {/* TODAY SNAPSHOT + SHIFT REMINDER */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
            <motion.article
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-emerald-100/70 bg-emerald-50/70 dark:bg-emerald-900/20 p-4 flex flex-col gap-2"
            >
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                  Today&apos;s Snapshot
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-emerald-900">
                <div>
                  <p className="text-[0.7rem] text-emerald-700/90">
                    Orders placed today
                  </p>
                  <p className="text-xl font-bold">
                    {todayOrders}
                    <span className="ml-1 text-[0.7rem] text-emerald-700/80">
                      total
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-[0.7rem] text-emerald-700/90">
                    Pending / In transit
                  </p>
                  <p className="text-xl font-bold">
                    {todayPending}
                    <span className="mx-1 text-[0.7rem] text-emerald-700/80">
                      /
                    </span>
                    {todayInTransit}
                  </p>
                </div>
                <div>
                  <p className="text-[0.7rem] text-emerald-700/90">
                    Idle riders now
                  </p>
                  <p className="text-xl font-bold">
                    {idleRiders.length}
                    <span className="ml-1 text-[0.7rem] text-emerald-700/80">
                      available
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-[0.7rem] text-emerald-700/90">
                    Unassigned pending orders
                  </p>
                  <p className="text-xl font-bold">
                    {unassignedPendingCount}
                    {unassignedPendingCount > 0 && (
                      <span className="ml-2 text-[0.65rem] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        Needs rider
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-900/40 p-4 flex flex-col gap-2"
            >
              <div className="flex items-center gap-2 mb-1">
                <ClipboardCheck className="w-4 h-4 text-slate-700" />
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wide">
                  Shift Focus Note
                </h3>
              </div>
              <p className="text-xs text-slate-700 mb-2">{shiftReminder}</p>
              <textarea
                className="w-full text-xs rounded-xl border border-slate-200 bg-white/70 dark:bg-slate-900/60 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 resize-none min-h-[64px]"
                value={storeNotes}
                onChange={(e) => setStoreNotes(e.target.value)}
                placeholder="Add today’s operational notes for the team..."
              />
            </motion.article>
          </section>

          {/* MAIN OPERATIONAL GRID */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-1">
            {/* URGENT ORDERS */}
            <motion.article
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-amber-100 bg-amber-50/80 dark:bg-amber-900/20 p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <h3 className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                    Urgent orders
                  </h3>
                </div>
                <span className="text-[0.7rem] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  {urgentOrders.length} at risk
                </span>
              </div>
              {urgentOrders.length === 0 ? (
                <p className="text-xs text-amber-800/90">
                  No pending orders older than 30 minutes. Keep it up!
                </p>
              ) : (
                <ul className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {urgentOrders.slice(0, 3).map((order: any, idx: number) => {
                    const createdAt = getOrderCreatedAt(order);
                    let ageLabel = "Unknown age";
                    if (createdAt) {
                      const diffMs = Date.now() - createdAt.getTime();
                      const mins = Math.floor(diffMs / (1000 * 60));
                      ageLabel = `${mins} min ago`;
                    }
                    return (
                      <li
                        key={order.id ?? order.orderId ?? idx}
                        className="text-[0.7rem] text-amber-900 flex items-start justify-between gap-2"
                      >
                        <div>
                          <p className="font-semibold">
                            Order #{order.id ?? order.orderId ?? "—"}
                          </p>
                          <p className="text-[0.65rem] text-amber-800/90">
                            {ageLabel} •{" "}
                            {order.customerName ??
                              order.customer ??
                              "Customer"}
                          </p>
                        </div>
                        <span className="mt-0.5 text-[0.6rem] px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-semibold">
                          PRIORITY
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
              {unassignedPendingCount > 0 && (
                <p className="mt-2 text-[0.7rem] text-red-800 font-medium flex items-center gap-1">
                  <Truck className="w-3 h-3" />
                  {unassignedPendingCount} pending{" "}
                  {unassignedPendingCount === 1 ? "order" : "orders"} have no
                  assigned rider yet.
                </p>
              )}
            </motion.article>

            {/* DRIVERS AT A GLANCE */}
            <DriversAtGlanceCard
              ridersData={ridersData}
              normalizeRiderStatus={normalizeRiderStatus}
            />

            {/* WORKFLOW PROGRESS + CUTOFF */}
            <motion.article
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-emerald-100 bg-emerald-50/70 dark:bg-emerald-900/20 p-4 flex flex-col gap-3"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                  Workflow progress
                </h3>
              </div>
              <div className="space-y-2 text-[0.7rem] text-emerald-900">
                <div className="flex items-center justify-between gap-2">
                  <span>Pending</span>
                  <span className="font-semibold">{pendingOrders}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span>In transit</span>
                  <span className="font-semibold">{inTransitOrders}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span>Delivered (est.)</span>
                  <span className="font-semibold">
                    {Math.max(
                      totalOrders - pendingOrders - inTransitOrders,
                      0
                    )}
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-[0.65rem] text-emerald-800 mb-1">
                  Delivery cut-off
                </p>
                <div className="w-full h-2 rounded-full bg-emerald-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-700"
                    style={{ width: `${cutoffInfo.percent}%` }}
                  />
                </div>
                <p className="mt-1 text-[0.65rem] text-emerald-900/90">
                  {cutoffInfo.label}
                </p>
              </div>
            </motion.article>

            {/* WEATHER + DAY CONDITIONS */}
            <motion.article
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-sky-100 bg-sky-50/80 dark:bg-sky-900/20 p-4 flex flex-col gap-2"
            >
              <div className="flex items-center gap-2 mb-1">
                {weatherInfo.icon === "sun" && (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
                {weatherInfo.icon === "cloud-sun" && (
                  <Cloud className="w-4 h-4 text-sky-500" />
                )}
                {weatherInfo.icon === "rain" && (
                  <CloudRain className="w-4 h-4 text-sky-600" />
                )}
                {weatherInfo.icon === "cloud" && (
                  <Cloud className="w-4 h-4 text-slate-500" />
                )}
                <h3 className="text-xs font-semibold text-sky-900 uppercase tracking-wide">
                  Day conditions
                </h3>
              </div>
              <p className="text-xs text-sky-900 font-medium">
                {weatherInfo.label}
              </p>
              <div className="flex items-center gap-2 text-[0.75rem] text-sky-900/90">
                <Thermometer className="w-3 h-3" />
                <span>{weatherInfo.temp}</span>
              </div>
              <p className="text-[0.7rem] text-sky-900 mt-1">
                {weatherInfo.hint}
              </p>
            </motion.article>

            {/* RIDER CHECK-IN + RECENT ACTIVITY + TIMELINE */}
            <motion.article
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-indigo-100 bg-indigo-50/80 dark:bg-indigo-900/20 p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between mb-1 gap-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-700" />
                  <h3 className="text-xs font-semibold text-indigo-900 uppercase tracking-wide">
                    Riders today
                  </h3>
                </div>
                {checkInIssuesCount > 0 && (
                  <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-semibold flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    {checkInIssuesCount} need check-in
                  </span>
                )}
              </div>

              <div className="text-[0.7rem] text-indigo-900">
                <p className="font-semibold mb-1">Recent activity</p>
                {recentRiderActivity.length === 0 ? (
                  <p className="text-indigo-900/80">
                    No recent rider updates detected yet today.
                  </p>
                ) : (
                  <ul className="space-y-1 max-h-20 overflow-y-auto pr-1">
                    {recentRiderActivity.map(({ rider, last }, idx) => (
                      <li
                        key={rider.id ?? rider.riderId ?? idx}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="truncate">
                          {rider.name ?? "Rider"}
                        </span>
                        <span className="text-[0.65rem] text-indigo-900/70">
                          {last.toLocaleTimeString("en-PH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-2 text-[0.7rem] text-indigo-900">
                <p className="font-semibold mb-1">Active today by time</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-white/60 dark:bg-indigo-900/60 px-2 py-1.5">
                    <p className="text-[0.6rem] text-indigo-700 uppercase">
                      Morning
                    </p>
                    <p className="text-sm font-bold">
                      {shiftsSummary.morning}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/60 dark:bg-indigo-900/60 px-2 py-1.5">
                    <p className="text-[0.6rem] text-indigo-700 uppercase">
                      Afternoon
                    </p>
                    <p className="text-sm font-bold">
                      {shiftsSummary.afternoon}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/60 dark:bg-indigo-900/60 px-2 py-1.5">
                    <p className="text-[0.6rem] text-indigo-700 uppercase">
                      Evening / Night
                    </p>
                    <p className="text-sm font-bold">
                      {shiftsSummary.evening}
                    </p>
                  </div>
                </div>
              </div>
            </motion.article>

            {/* COMMUNICATION CENTER (QUICK NOTIFS + EMERGENCY) */}
            <motion.article
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-rose-100 bg-rose-50/80 dark:bg-rose-900/20 p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-rose-700" />
                  <h3 className="text-xs font-semibold text-rose-900 uppercase tracking-wide">
                    Communication center
                  </h3>
                </div>
                <MessageCircle className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-[0.7rem] text-rose-900/90">
                Quick triggers to coordinate riders and store teams. Connect
                these actions to your real notification endpoints later.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={handleNotifyIdleRiders}
                  className="text-[0.7rem] flex items-center justify-center gap-1.5 rounded-xl bg-rose-100 text-rose-900 font-semibold px-3 py-1.5 hover:bg-rose-200 transition"
                >
                  <Users className="w-3 h-3" />
                  Notify idle riders
                </button>
                <button
                  type="button"
                  onClick={handleNotifyAllDrivers}
                  className="text-[0.7rem] flex items-center justify-center gap-1.5 rounded-xl bg-rose-100 text-rose-900 font-semibold px-3 py-1.5 hover:bg-rose-200 transition"
                >
                  <Truck className="w-3 h-3" />
                  Notify all drivers
                </button>
              </div>

              <button
                type="button"
                onClick={handleNotifyStoreTeam}
                className="mt-1 text-[0.7rem] flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 text-rose-900 font-semibold px-3 py-1.5 hover:bg-rose-100 border border-rose-200 transition"
              >
                <ClipboardCheck className="w-3 h-3" />
                Notify store team
              </button>

              <div className="mt-3 border-t border-rose-200 pt-3">
                <p className="text-[0.65rem] text-rose-900/90 mb-1 flex items-center gap-1">
                  <Megaphone className="w-3 h-3" />
                  Emergency broadcast
                </p>
                <button
                  type="button"
                  onClick={handleEmergencyBroadcast}
                  className="w-full text-[0.7rem] flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold px-3 py-2 shadow-lg shadow-rose-500/40 hover:scale-[1.01] active:scale-[0.99] transition-transform"
                >
                  <ShieldAlert className="w-3 h-3" />
                  Trigger high-priority alert
                </button>
              </div>
            </motion.article>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============================================================
   SUB ADMIN STAT CARD (CLEAN + SLIGHTLY ENHANCED HOVER)
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
        boxShadow:
          "0 22px 50px rgba(15,23,42,0.5), 0 0 40px rgba(52,211,153,0.55)",
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
   DRIVERS AT A GLANCE CARD
============================================================ */

type DriversAtGlanceProps = {
  ridersData: any[];
  normalizeRiderStatus: (status: any) => string;
};

function DriversAtGlanceCard({
  ridersData,
  normalizeRiderStatus,
}: DriversAtGlanceProps) {
  const summary = useMemo(() => {
    let available = 0;
    let onDelivery = 0;
    let offline = 0;
    let notAvailable = 0;

    ridersData.forEach((r) => {
      const norm = normalizeRiderStatus(r.status);
      if (norm === "AVAILABLE") available += 1;
      else if (norm === "ON_DELIVERY" || norm === "ON DELIVERY")
        onDelivery += 1;
      else if (norm === "OFFLINE") offline += 1;
      else notAvailable += 1;
    });

    const total = ridersData.length;
    return {
      available,
      onDelivery,
      offline,
      notAvailable,
      total,
    };
  }, [ridersData, normalizeRiderStatus]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 bg-slate-50/90 dark:bg-slate-900/40 p-4 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-slate-800" />
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
            Drivers at a glance
          </h3>
        </div>
        <span className="text-[0.7rem] text-slate-600">
          Total:{" "}
          <span className="font-semibold text-slate-900">{summary.total}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[0.7rem]">
        <div className="rounded-xl bg-white/70 dark:bg-slate-900/60 px-3 py-2">
          <p className="text-[0.65rem] text-emerald-700 font-semibold uppercase">
            Available
          </p>
          <p className="text-lg font-bold text-emerald-800">
            {summary.available}
          </p>
        </div>
        <div className="rounded-xl bg-white/70 dark:bg-slate-900/60 px-3 py-2">
          <p className="text-[0.65rem] text-blue-700 font-semibold uppercase">
            On delivery
          </p>
          <p className="text-lg font-bold text-blue-900">
            {summary.onDelivery}
          </p>
        </div>
        <div className="rounded-xl bg-white/70 dark:bg-slate-900/60 px-3 py-2">
          <p className="text-[0.65rem] text-slate-600 font-semibold uppercase">
            Offline
          </p>
          <p className="text-lg font-bold text-slate-800">
            {summary.offline}
          </p>
        </div>
        <div className="rounded-xl bg-white/70 dark:bg-slate-900/60 px-3 py-2">
          <p className="text-[0.65rem] text-orange-700 font-semibold uppercase">
            Not available
          </p>
          <p className="text-lg font-bold text-orange-800">
            {summary.notAvailable}
          </p>
        </div>
      </div>

      <p className="text-[0.65rem] text-slate-600 mt-1">
        Use this snapshot to quickly decide who can take new deliveries.
      </p>
    </motion.article>
  );
}
