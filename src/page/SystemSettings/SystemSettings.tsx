import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Moon, Truck, Settings } from "lucide-react";


export default function SystemSettings() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifOrders, setNotifOrders] = useState(true);
  const [autoAssignRider, setAutoAssignRider] = useState(false);
  const [distanceMode, setDistanceMode] = useState("google");

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-8 relative overflow-hidden"
    >
      {/* Ambient glow background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 -left-20 h-64 w-64 bg-emerald-400/25 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 bg-sky-400/20 blur-3xl" />
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-600 text-transparent bg-clip-text">
          System Preferences
        </h1>
        <p className="text-gray-500 text-sm">
          Customize the behavior and personalization of your admin dashboard.
        </p>
      </div>

      {/* CARD */}
      <div className="rounded-2xl border border-emerald-400/30 bg-white/90 shadow-[0_22px_70px_rgba(15,23,42,0.40)] p-6 md:p-8 relative overflow-hidden">
        {/* Corner brackets */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-3 left-3 h-5 w-5 border-t-2 border-l-2 border-emerald-400/80" />
          <div className="absolute top-3 right-3 h-5 w-5 border-t-2 border-r-2 border-emerald-400/80" />
          <div className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-emerald-400/80" />
          <div className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-emerald-400/80" />
        </div>

        <div className="relative grid grid-cols-1 gap-7">
          {/* ======================== */}
          {/* DARK MODE */}
          {/* ======================== */}
          <section className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Dark Mode Theme</h3>
                <p className="text-xs text-gray-500">Toggle the overall dashboard theme.</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:bg-emerald-500 transition-all"></div>
              <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5"></span>
            </label>
          </section>

          {/* ======================== */}
          {/* NOTIFICATIONS */}
          {/* ======================== */}
          <section className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shadow">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Order Notifications</h3>
                <p className="text-xs text-gray-500">
                  Alerts when new orders arrive or riders update status.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notifOrders}
                onChange={() => setNotifOrders(!notifOrders)}
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:bg-emerald-500 transition-all"></div>
              <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5"></span>
            </label>
          </section>

          {/* ======================== */}
          {/* AUTO-ASSIGN RIDER */}
          {/* ======================== */}
          <section className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shadow">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Auto Assign Rider</h3>
                <p className="text-xs text-gray-500">
                  Automatically assign the nearest rider to new orders.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={autoAssignRider}
                onChange={() => setAutoAssignRider(!autoAssignRider)}
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:bg-emerald-500 transition-all"></div>
              <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5"></span>
            </label>
          </section>

          {/* ======================== */}
          {/* DISTANCE MODE */}
          {/* ======================== */}
          <section className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Distance Calculation</h3>
                <p className="text-xs text-gray-500">
                  Choose how distances are calculated for delivery fees.
                </p>
              </div>
            </div>

            <select
              value={distanceMode}
              onChange={(e) => setDistanceMode(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm bg-white"
            >
              <option value="google">Google Maps API</option>
              <option value="haversine">Haversine Formula (offline)</option>
              <option value="manual">Manual KM Input</option>
            </select>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
