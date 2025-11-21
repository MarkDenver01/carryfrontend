import {
  ShoppingCart,
  ClipboardCheck,
  Package,
  Truck,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import DashboardTable from "../../layout/dashboard/DashboardTableLayout.tsx";

export default function SubDashboard() {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

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

  return (
    <div className="p-4 flex flex-col gap-6">

      {/* HEADER */}
      <div className="flex flex-col mb-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Sub Admin Dashboard
          </h1>

          {/* ROLE BADGE */}
          <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 rounded-full border border-blue-300 dark:border-blue-700">
            SUB ADMIN
          </span>
        </div>

        {/* Greeting + Date & Time */}
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {greeting()}, Anne 👋
        </p>

        <p className="text-xs text-gray-500 dark:text-gray-500">
          📅 {currentDate} • ⏰ {currentTime}
        </p>
      </div>

      {/* NOTIFICATION BANNER */}
      <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-lg text-sm border border-yellow-300 dark:border-yellow-700">
        ⚠️ Reminder: Prioritize packing and dispatching pending orders today.
      </div>

      {/* FIRST GRID SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        {/* Pending Orders */}
        <Card
          bg="bg-green-600"
          iconBg="bg-green-100 text-green-500"
          Icon={ShoppingCart}
          value="8"
          label="Pending Orders"
        />

        {/* To Pack */}
        <Card
          bg="bg-blue-700"
          iconBg="bg-blue-100 text-blue-600"
          Icon={Package}
          value="12"
          label="To Pack Today"
        />

        {/* To Dispatch */}
        <Card
          bg="bg-amber-500"
          iconBg="bg-yellow-200 text-amber-700"
          Icon={ClipboardCheck}
          value="5"
          label="To Dispatch"
        />

        {/* Active Drivers */}
        <Card
          bg="bg-indigo-700"
          iconBg="bg-indigo-100 text-indigo-600"
          Icon={Truck}
          value="4"
          label="Active Drivers"
        />
      </div>

      {/* ACTIVITY FEED */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-lg shadow border border-gray-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
          Recent Activity
        </h2>

        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
          <li>✔ Packed order <strong>#1022</strong></li>
          <li>✔ Marked order <strong>#1018</strong> as dispatched</li>
          <li>✔ Assigned driver to order <strong>#1015</strong></li>
          <li>✔ Updated product stock <strong>Pancit Canton</strong></li>
          <li>❗ Customer reported wrong item on order <strong>#1009</strong></li>
        </ul>
      </div>

      {/* DIVIDER */}
      <div className="border-t border-gray-300 dark:border-gray-700" />

      {/* TABLE SECTION */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-lg shadow border border-gray-200 dark:border-slate-700">
        <DashboardTable />
      </div>
    </div>
  );
}

/* CARD COMPONENT */
interface CardProps {
  bg: string;
  iconBg: string;
  Icon: React.ElementType;
  value: string | number;
  label: string;
}

function Card({ bg, iconBg, Icon, value, label }: CardProps) {
  return (
    <div
      className={`flex flex-col justify-between gap-4 p-4 ${bg} rounded-lg shadow hover:shadow-lg transition`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${iconBg}`}>
          <Icon size={48} />
        </div>

        <div>
          <div className="text-4xl font-bold text-white">{value}</div>
          <div className="text-sm font-semibold text-white">{label}</div>
        </div>
      </div>

      <button className="group flex items-center justify-end gap-2 text-sm text-white hover:underline">
        More Info
        <ArrowRight
          size={18}
          className="transition-transform group-hover:translate-x-1"
        />
      </button>
    </div>
  );
}
