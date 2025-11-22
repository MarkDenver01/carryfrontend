import {
  ShoppingCart,
  ClipboardCheck,
  Package,
  Truck,
  ArrowRight,
} from "lucide-react";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardTable from "../../layout/dashboard/DashboardTableLayout.tsx";

export default function SubDashboard() {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      className="relative p-6 md:p-8 flex flex-col gap-8 md:gap-10 overflow-hidden"
    >
      {/* HUD GRID BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 -z-30">
        {/* Grid */}
        <div className="w-full h-full opacity-40 mix-blend-soft-light bg-[linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Scanlines */}
        <div className="absolute inset-0 opacity-[0.07] bg-[repeating-linear-gradient(to_bottom,rgba(15,23,42,0.9)_0px,rgba(15,23,42,0.9)_1px,transparent_1px,transparent_3px)]" />

        {/* Ambient blobs */}
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
          className="absolute right-0 bottom-[-5rem] h-72 w-72 bg-blue-400/24 blur-3xl"
          animate={{
            x: [0, -20, -30, -10, 0],
            y: [0, -10, -25, -5, 0],
            borderRadius: ["55%", "70%", "60%", "65%", "55%"],
          }}
          transition={{ duration: 24, repeat: Infinity }}
        />
      </div>

      {/* Cursor spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background: `radial-gradient(500px at ${cursorPos.x}px ${cursorPos.y}px, rgba(34,197,94,0.25), transparent 70%)`,
        }}
        animate={{ opacity: [0.7, 1, 0.8] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* HEADER */}
      <div className="relative">
        <motion.h1
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-600 bg-clip-text text-transparent"
        >
          Sub Admin Dashboard
        </motion.h1>

        <div className="flex items-center gap-3 mt-1">
          <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-600 rounded-full border border-blue-300">
            SUB ADMIN
          </span>
        </div>

        <p className="text-gray-600 text-sm dark:text-gray-400 mt-1">
          {greeting()}, Anne 👋
        </p>

        <p className="text-xs text-gray-500 dark:text-gray-500">
          📅 {currentDate} • ⏰ {currentTime}
        </p>

        <div className="mt-3 h-[3px] w-20 bg-gradient-to-r from-emerald-400 to-transparent rounded-full" />
      </div>

      {/* SCANNER BAR */}
      <motion.div
        className="pointer-events-none absolute left-0 top-[140px] w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent opacity-80"
        animate={{ x: ["-30%", "30%", "-30%"] }}
        transition={{ duration: 4.8, repeat: Infinity }}
      />

      {/* NOTIFICATION BANNER */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="p-3 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 rounded-lg text-sm border border-yellow-300 dark:border-yellow-700 shadow-md"
      >
        ⚠️ Reminder: Prioritize packing and dispatching pending orders today.
      </motion.div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-1">
        <SubCard
          gradient="from-emerald-600 to-green-700"
          iconBg="bg-green-100 text-green-500"
          Icon={ShoppingCart}
          value="8"
          label="Pending Orders"
        />

        <SubCard
          gradient="from-blue-700 to-blue-900"
          iconBg="bg-blue-100 text-blue-600"
          Icon={Package}
          value="12"
          label="To Pack Today"
        />

        <SubCard
          gradient="from-amber-500 to-amber-700"
          iconBg="bg-yellow-200 text-amber-700"
          Icon={ClipboardCheck}
          value="5"
          label="To Dispatch"
        />

        <SubCard
          gradient="from-indigo-700 to-indigo-900"
          iconBg="bg-indigo-100 text-indigo-600"
          Icon={Truck}
          value="4"
          label="Active Drivers"
        />
      </div>

      {/* DIVIDER */}
      <div className="relative h-px w-full bg-gradient-to-r from-transparent via-gray-400/80 to-transparent mt-2" />

      {/* TABLE */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="p-5 bg-white dark:bg-slate-900 rounded-xl shadow-[0_18px_55px_rgba(15,23,42,0.25)] border border-gray-200 dark:border-slate-700 backdrop-blur-xl"
      >
        <DashboardTable />
      </motion.div>
    </motion.div>
  );
}

/* ============================================================
   SUB ADMIN STAT CARD (GOD MODE)
============================================================ */

function SubCard({
  gradient,
  iconBg,
  Icon,
  value,
  label,
}: {
  gradient: string;
  iconBg: string;
  Icon: any;
  value: string | number;
  label: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -6,
        scale: 1.03,
        rotateX: -4,
        rotateY: 4,
        boxShadow: "0 25px 60px rgba(15,23,42,0.35)",
      }}
      transition={{ duration: 0.35 }}
      className={`relative p-5 rounded-2xl border border-white/20 text-white bg-gradient-to-br ${gradient} shadow-xl transform-gpu overflow-hidden`}
    >
      {/* shine */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.32),transparent_60%)] opacity-80" />

      <div className="relative flex items-center gap-4">
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon size={44} />
        </div>

        <div>
          <p className="text-xs text-white/80">{label}</p>
          <p className="text-4xl font-extrabold">{value}</p>
        </div>
      </div>

      <div className="relative flex justify-end mt-4">
        <button className="group flex items-center gap-1 text-sm text-white/90">
          More Info
          <ArrowRight
            size={18}
            className="transition-transform group-hover:translate-x-1"
          />
        </button>
      </div>
    </motion.div>
  );
}
