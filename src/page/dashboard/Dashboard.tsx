import {
  ShoppingCart,
  Percent,
  Users,
  ArrowRight,
  Truck
} from "lucide-react";

import { motion } from "framer-motion";
import DashboardTable from "../../layout/dashboard/DashboardTableLayout.tsx";

export default function Dashboard() {
  return (
    <div className="p-6 flex flex-col gap-10">

      {/* ================================
           TOP METRICS GRID
      ================================== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* CARD TEMPLATE */}
        <DashboardStatCard
          icon={<ShoppingCart size={40} />}
          title="New Orders"
          value="15"
          gradient="from-emerald-500 to-green-600"
          iconBg="bg-emerald-100 text-emerald-600"
        />

        <DashboardStatCard
          icon={<Percent size={40} />}
          title="Sale Rate"
          value="30%"
          gradient="from-amber-400 to-yellow-500"
          iconBg="bg-yellow-100 text-amber-500"
        />

        <DashboardStatCard
          icon={<Users size={40} />}
          title="Number of Users"
          value="100"
          gradient="from-green-800 to-green-600"
          iconBg="bg-green-100 text-green-700"
        />

        <DashboardStatCard
          icon={<Truck size={40} />}
          title="Available Drivers"
          value="10"
          gradient="from-blue-900 to-blue-700"
          iconBg="bg-blue-100 text-blue-700"
        />
      </div>

      {/* =================================
           CONTENT SECTION
      ================================== */}
      <div className="h-[1px] bg-gray-200/60 backdrop-blur-sm" />

      <div className="p-4 bg-white/70 rounded-xl shadow-lg border border-gray-200 backdrop-blur-md">
        <DashboardTable />
      </div>
    </div>
  );
}

/* ========================================================
   REUSABLE CARD COMPONENT
   (PURE UI ONLY — LOGIC UNTOUCHED)
======================================================== */

function DashboardStatCard({
  icon,
  title,
  value,
  gradient,
  iconBg
}: {
  icon: any;
  title: string;
  value: string;
  gradient: string;
  iconBg: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 200 }}
      className={`
        flex flex-col justify-between gap-4 p-5 
        rounded-2xl shadow-lg text-white 
        bg-gradient-to-br ${gradient}
        border border-white/20 backdrop-blur-md
      `}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full shadow ${iconBg}`}>
          {icon}
        </div>

        <div>
          <div className="text-4xl font-extrabold">{value}</div>
          <div className="text-sm font-medium opacity-90">{title}</div>
        </div>
      </div>

      <button className="group flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white">
        More Info
        <ArrowRight
          size={18}
          className="transition-transform group-hover:translate-x-1"
        />
      </button>
    </motion.div>
  );
}