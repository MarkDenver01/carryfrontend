import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Moon,
  Truck,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ============================================================
   TYPES
============================================================ */
interface SettingRowProps {
  icon: React.ReactNode;
  color: string;
  title: string;
  description: string;
  control: React.ReactNode;
}

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
}

/* ============================================================
   MAIN PAGE
============================================================ */
export default function SystemSettings() {
  const navigate = useNavigate();

  // Load settings from localStorage
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [notifOrders, setNotifOrders] = useState(
    localStorage.getItem("notifOrders") !== "false"
  );
  const [autoAssignRider, setAutoAssignRider] = useState(
    localStorage.getItem("autoAssignRider") === "true"
  );
  const [distanceMode, setDistanceMode] = useState(
    localStorage.getItem("distanceMode") || "google"
  );

  /* ============================================================
     APPLY SETTINGS
  ============================================================ */

  // Dark mode
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Notifications
  useEffect(() => {
    localStorage.setItem("notifOrders", notifOrders.toString());
  }, [notifOrders]);

  // Auto assign rider
  useEffect(() => {
    localStorage.setItem("autoAssignRider", autoAssignRider.toString());
  }, [autoAssignRider]);

  // Distance mode
  useEffect(() => {
    localStorage.setItem("distanceMode", distanceMode);
  }, [distanceMode]);

  /* ============================================================
     UI
  ============================================================ */
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-8 relative overflow-hidden"
    >
      {/* Glowing ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 -left-20 h-64 w-64 bg-emerald-400/25 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 bg-sky-400/20 blur-3xl" />
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 rounded-full bg-white shadow hover:bg-gray-100 
            dark:bg-slate-800 dark:hover:bg-slate-700 border dark:border-slate-700"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-slate-200" />
        </button>

        <div>
          <h1
            className="text-3xl font-extrabold bg-gradient-to-r 
                from-emerald-400 via-emerald-500 to-green-600 
                text-transparent bg-clip-text"
          >
            System Preferences
          </h1>
          <p className="text-gray-500 dark:text-gray-300 text-sm">
            Configure the behavior and personalization of your dashboard.
          </p>
        </div>
      </div>

      {/* Main card */}
      <div
        className="rounded-2xl border border-emerald-400/30 
        bg-white/90 dark:bg-slate-900/80 
        shadow-[0_22px_70px_rgba(15,23,42,0.40)] p-6 md:p-8 relative overflow-hidden"
      >
        {/* Decorative brackets */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-3 left-3 h-5 w-5 border-t-2 border-l-2 border-emerald-400/80" />
          <div className="absolute top-3 right-3 h-5 w-5 border-t-2 border-r-2 border-emerald-400/80" />
          <div className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-emerald-400/80" />
          <div className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-emerald-400/80" />
        </div>

        {/* SETTINGS */}
        <div className="relative grid grid-cols-1 gap-7 text-gray-900 dark:text-gray-100">
          {/* Dark Mode */}
          <SettingRow
            icon={<Moon className="w-5 h-5" />}
            color="bg-emerald-100 text-emerald-700 dark:bg-emerald-600/20 dark:text-emerald-300"
            title="Dark Mode"
            description="Switch between Light and Dark theme."
            control={
              <ToggleSwitch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
            }
          />

          {/* Order Notifications */}
          <SettingRow
            icon={<Bell className="w-5 h-5" />}
            color="bg-sky-100 text-sky-700 dark:bg-sky-600/20 dark:text-sky-300"
            title="Order Notifications"
            description="Receive alerts for new orders and rider updates."
            control={
              <ToggleSwitch
                checked={notifOrders}
                onChange={() => setNotifOrders(!notifOrders)}
              />
            }
          />

          {/* Auto assign riders */}
          <SettingRow
            icon={<Truck className="w-5 h-5" />}
            color="bg-orange-100 text-orange-700 dark:bg-orange-600/20 dark:text-orange-300"
            title="Auto Assign Rider"
            description="Automatically assign nearest rider to new orders."
            control={
              <ToggleSwitch
                checked={autoAssignRider}
                onChange={() => setAutoAssignRider(!autoAssignRider)}
              />
            }
          />

          {/* Distance Mode */}
          <SettingRow
            icon={<Settings className="w-5 h-5" />}
            color="bg-purple-100 text-purple-700 dark:bg-purple-600/20 dark:text-purple-300"
            title="Distance Calculation"
            description="Select how delivery distance is computed."
            control={
              <select
                value={distanceMode}
                onChange={(e) => setDistanceMode(e.target.value)}
                className="border dark:border-slate-600 rounded-lg px-3 py-1 text-sm 
                  bg-white dark:bg-slate-800 dark:text-gray-100"
              >
                <option value="google">Google Maps API</option>
                <option value="haversine">Haversine (Offline)</option>
                <option value="manual">Manual Input</option>
              </select>
            }
          />
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   COMPONENTS
============================================================ */

function SettingRow({ icon, color, title, description, control }: SettingRowProps) {
  return (
    <section className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow ${color}`}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>

      {control}
    </section>
  );
}

function ToggleSwitch({ checked, onChange }: ToggleSwitchProps) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
      />
      <div
        className="w-11 h-6 bg-gray-300 dark:bg-slate-700
        peer-focus:ring-2 peer-focus:ring-emerald-500 
        rounded-full peer peer-checked:bg-emerald-500 transition-all"
      />
      <span
        className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all 
        peer-checked:translate-x-5"
      />
    </label>
  );
}
