import React, { useState, useEffect } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import {
  ShoppingCart,
  ClipboardCheck,
  Package,
  Truck,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

export default function SubDashboard() {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  // Action loading states
  const [seasonalLoading, setSeasonalLoading] = useState(false);
  const [inactiveLoading, setInactiveLoading] = useState(false);
  const [recoAnalyticsLoading, setRecoAnalyticsLoading] = useState(false);
  const [personalizedLoading, setPersonalizedLoading] = useState(false);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);

  // Optional status messages (per card)
  const [seasonalStatus, setSeasonalStatus] = useState<string | null>(null);
  const [inactiveStatus, setInactiveStatus] = useState<string | null>(null);
  const [personalizedStatus, setPersonalizedStatus] = useState<string | null>(
    null
  );
  const [pricingStatus, setPricingStatus] = useState<string | null>(null);
  const [promoStatus, setPromoStatus] = useState<string | null>(null);

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

  // Small helper to simulate delay (pwede mong tanggalin pag may real API ka na)
  const fakeDelay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  /* ============================
      ACTION HANDLERS (LOGIC)
  ============================ */

  // 4.2 – Seasonal Stock Suggestions → apply to inventory backend
  const handleApplySeasonalStock = async () => {
    try {
      setSeasonalLoading(true);
      setSeasonalStatus(null);

      // Example API call – palitan mo URL pag ready na backend
      // await fetch("/admin/api/intelligence/seasonal-stock/apply", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ triggerSource: "SUB_ADMIN_DASHBOARD" }),
      // });

      await fakeDelay(900); // mock lang for now

      setSeasonalStatus(
        "Seasonal stock recommendations sent to inventory module and mobile admin."
      );
    } catch (error) {
      console.error("Error applying seasonal stock:", error);
      setSeasonalStatus("Failed to apply seasonal stock suggestions.");
    } finally {
      setSeasonalLoading(false);
    }
  };

  // 4.3 – Inactive Customers → send promos/re-engagement
  const handleReengageInactiveCustomers = async () => {
    try {
      setInactiveLoading(true);
      setInactiveStatus(null);

      // await fetch("/admin/api/intelligence/customers/inactive/reengage", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ channel: "MOBILE_APP_AND_SMS" }),
      // });

      await fakeDelay(900);

      setInactiveStatus(
        "Re-engagement promos scheduled for inactive customers."
      );
    } catch (error) {
      console.error("Error re-engaging inactive customers:", error);
      setInactiveStatus("Failed to send re-engagement promos.");
    } finally {
      setInactiveLoading(false);
    }
  };

  // 5.1 – Recommendation Interaction Analytics
  const handleOpenRecommendationAnalytics = async () => {
    try {
      setRecoAnalyticsLoading(true);
      // Here normally mag-oopen ka ng modal or mag-na-navigate sa analytics page
      // Example: navigate("/admin/analytics/recommendations");
      await fakeDelay(500);
      // For now console lang
      console.log("Open detailed recommendation analytics view.");
    } catch (error) {
      console.error("Error opening analytics:", error);
    } finally {
      setRecoAnalyticsLoading(false);
    }
  };

  // 5.2 – Personalized Suggestions → sync to mobile/frontend
  const handleSyncPersonalizedSuggestions = async () => {
    try {
      setPersonalizedLoading(true);
      setPersonalizedStatus(null);

      // await fetch("/admin/api/recommendations/personalized/sync", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ source: "SUB_ADMIN_DASHBOARD" }),
      // });

      await fakeDelay(900);

      setPersonalizedStatus(
        "Personalized product suggestions pushed to mobile app homepage."
      );
    } catch (error) {
      console.error("Error syncing personalized suggestions:", error);
      setPersonalizedStatus("Failed to sync personalized recommendations.");
    } finally {
      setPersonalizedLoading(false);
    }
  };

  // 5.3 – Pricing Strategy → apply suggested prices
  const handleApplyPricingStrategies = async () => {
    try {
      setPricingLoading(true);
      setPricingStatus(null);

      // await fetch("/admin/api/pricing/strategies/apply", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      // });

      await fakeDelay(900);

      setPricingStatus(
        "Suggested pricing strategies applied to selected products."
      );
    } catch (error) {
      console.error("Error applying pricing strategies:", error);
      setPricingStatus("Failed to apply pricing strategies.");
    } finally {
      setPricingLoading(false);
    }
  };

  // 5.4 – Promotions → create + broadcast promos
  const handleLaunchPromotions = async () => {
    try {
      setPromoLoading(true);
      setPromoStatus(null);

      // await fetch("/admin/api/promotions/launch-from-intelligence", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      // });

      await fakeDelay(900);

      setPromoStatus(
        "Promotional campaign launched and broadcasted to customers."
      );
    } catch (error) {
      console.error("Error launching promotions:", error);
      setPromoStatus("Failed to launch promotional activities.");
    } finally {
      setPromoLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      className="relative p-6 md:p-8 flex flex-col gap-8 md:gap-10 overflow-hidden"
    >
      {/* ========== HUD BACKGROUND (GRID + SCANLINES + BLOBS) ========== */}
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
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-0 bottom-[-5rem] h-72 w-72 bg-sky-400/24 blur-3xl"
          animate={{
            x: [0, -20, -30, -10, 0],
            y: [0, -10, -25, -5, 0],
            borderRadius: ["55%", "70%", "60%", "65%", "55%"],
          }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute top-10 right-10 flex gap-2 text-emerald-400/70"
          animate={{ opacity: [0.4, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.9)]" />
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)]" />
        </motion.div>
      </div>

      {/* Cursor spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background: `radial-gradient(520px at ${cursorPos.x}px ${cursorPos.y}px, rgba(34,197,94,0.24), transparent 70%)`,
        }}
        animate={{ opacity: [0.7, 1, 0.82] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
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

        <div className="mt-1 flex flex-wrap items-center gap-2">
          <motion.span
            whileHover={{ scale: 1.05, rotateX: -6 }}
            className="relative inline-flex items-center gap-1 px-3 py-1 text-[0.7rem] font-semibold rounded-full border border-emerald-300/70 bg-gradient-to-r from-emerald-50 via-white to-emerald-100 text-emerald-700 shadow-[0_8px_22px_rgba(16,185,129,0.35)] overflow-hidden"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)]" />
            SUB ADMIN
          </motion.span>

          <span className="text-xs text-gray-500 dark:text-gray-400">
            Operations overview for daily order handling.
          </span>
        </div>

        <p className="text-gray-600 text-sm dark:text-gray-400 mt-1">
          {greeting()}, Anne 👋
        </p>

        <p className="text-xs text-gray-500 dark:text-gray-500">
          📅 {currentDate} • ⏰ {currentTime}
        </p>

        <div className="mt-3 h-[3px] w-24 bg-gradient-to-r from-emerald-400 via-emerald-500 to-transparent rounded-full" />
      </div>

      {/* Scanner bars */}
      <motion.div
        className="pointer-events-none absolute left-0 top-[148px] w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent opacity-80"
        animate={{ x: ["-30%", "30%", "-30%"] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute left-0 top-[156px] w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent opacity-70"
        animate={{ x: ["30%", "-30%", "30%"] }}
        transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ========== MAIN HUD CONTAINER ========== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative rounded-[26px] border border-emerald-500/30 bg-white/95 dark:bg-slate-950/90 shadow-[0_22px_70px_rgba(15,23,42,0.5)] overflow-hidden mt-1"
      >
        {/* Frame corners */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-3 left-3 h-5 w-5 border-t-2 border-l-2 border-emerald-400/80" />
          <div className="absolute top-3 right-3 h-5 w-5 border-t-2 border-r-2 border-emerald-400/80" />
          <div className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-emerald-400/80" />
          <div className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-emerald-400/80" />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_60%)]" />

        <div className="relative flex flex-col gap-6 p-5 md:p-6">
          {/* Notification Banner */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex items-start gap-3 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/35 border border-yellow-300/80 dark:border-yellow-700/80 shadow-sm"
          >
            <span className="mt-0.5 text-lg">⚠️</span>
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Operational Reminder
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-0.5">
                Prioritize packing and dispatching pending orders today.
              </p>
            </div>
          </motion.div>

          {/* STAT CARDS */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5">
            <SubStatCard
              gradient="from-emerald-600 to-green-700"
              iconBg="bg-emerald-100 text-emerald-600"
              Icon={ShoppingCart}
              value="8"
              label="Pending Orders"
              helper="Awaiting processing"
            />
            <SubStatCard
              gradient="from-blue-700 to-blue-900"
              iconBg="bg-blue-100 text-blue-600"
              Icon={Package}
              value="12"
              label="To Pack Today"
              helper="Prioritize before cutoff"
            />
            <SubStatCard
              gradient="from-amber-500 to-amber-700"
              iconBg="bg-amber-100 text-amber-700"
              Icon={ClipboardCheck}
              value="5"
              label="To Dispatch"
              helper="Ready for handoff"
            />
            <SubStatCard
              gradient="from-indigo-700 to-indigo-900"
              iconBg="bg-indigo-100 text-indigo-600"
              Icon={Truck}
              value="4"
              label="Active Drivers"
              helper="Currently on-route"
            />
          </section>

          {/* Divider */}
          <div className="relative h-px w-full bg-gradient-to-r from-transparent via-gray-300/90 dark:via-slate-700/90 to-transparent mt-1" />

          {/* ========== INTELLIGENT MODULES ========== */}

          {/* INVENTORY & CUSTOMER INSIGHTS */}
          <section className="mt-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
              Intelligent Inventory & Customer Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {/* Seasonal Stock Suggestions (4.2) */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl border border-emerald-300/40 bg-emerald-50 dark:bg-emerald-900/20 shadow-md flex flex-col gap-3"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                    4.2 Seasonal Stock Suggestions
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Recommended products to increase during busy shopping seasons
                    like Christmas and special events.
                  </p>

                  <ul className="mt-3 text-sm text-gray-700 dark:text-gray-200 space-y-1">
                    <li>• Spaghetti Noodles – high demand for Christmas</li>
                    <li>• Tomato Sauce – paired with pasta purchases</li>
                    <li>• Ham – peak sales during December</li>
                    <li>• Softdrinks & Juice – party and gatherings</li>
                    <li>• Snacks – bundled in holiday packs</li>
                  </ul>

                  <p className="mt-3 text-[0.7rem] text-emerald-700 dark:text-emerald-300">
                    Logic: Based on historical sales, demand spikes, and customer
                    buying patterns per season.
                  </p>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={handleApplySeasonalStock}
                    disabled={seasonalLoading}
                    className="inline-flex items-center gap-1 rounded-full border border-emerald-500/70 bg-emerald-600 text-white px-3 py-1.5 text-[0.7rem] font-semibold shadow-sm hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {seasonalLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      <>
                        Apply Stock Suggestion
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>

                {seasonalStatus && (
                  <p className="mt-1 text-[0.7rem] text-emerald-800 dark:text-emerald-200">
                    {seasonalStatus}
                  </p>
                )}
              </motion.div>

              {/* Inactive Customers (4.3) */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl border border-rose-300/40 bg-rose-50 dark:bg-rose-900/20 shadow-md flex flex-col gap-3"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                    4.3 Inactive Customer Detector
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Identify customers who stopped buying and suggest
                    re-engagement strategies.
                  </p>

                  <ul className="mt-3 text-sm text-gray-700 dark:text-gray-200 space-y-1">
                    <li>
                      • Customer #1021 – No purchase in 45 days → Send ₱20 voucher
                    </li>
                    <li>
                      • Customer #883 – Previously bought pasta → Recommend pasta
                      bundles
                    </li>
                    <li>
                      • Customer #551 – Always buys snacks → Send reminder and snack
                      promo
                    </li>
                  </ul>

                  <p className="mt-3 text-[0.7rem] text-rose-700 dark:text-rose-300">
                    Logic: Compares last purchase date vs. usual buying frequency
                    per customer.
                  </p>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={handleReengageInactiveCustomers}
                    disabled={inactiveLoading}
                    className="inline-flex items-center gap-1 rounded-full border border-rose-500/70 bg-rose-600 text-white px-3 py-1.5 text-[0.7rem] font-semibold shadow-sm hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {inactiveLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Sending promos...
                      </>
                    ) : (
                      <>
                        Re-engage Customers
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>

                {inactiveStatus && (
                  <p className="mt-1 text-[0.7rem] text-rose-800 dark:text-rose-200">
                    {inactiveStatus}
                  </p>
                )}
              </motion.div>
            </div>
          </section>

          {/* RECOMMENDATION ENGINE ANALYTICS */}
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
              Recommendation Engine Analytics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {/* Track Interaction with Recommendations (5.1) */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl border border-blue-300/40 bg-blue-50 dark:bg-blue-900/20 shadow-md flex flex-col gap-3"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                    5.1 Recommendation Interaction Tracking
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Monitor how customers interact with recommended products.
                  </p>

                  <ul className="mt-3 text-sm text-gray-700 dark:text-gray-200 space-y-1">
                    <li>• 47 recommendation views today</li>
                    <li>• 15 clicks from suggestion cards</li>
                    <li>• 6 purchases from recommended items</li>
                  </ul>

                  <p className="mt-3 text-[0.7rem] text-blue-700 dark:text-blue-300">
                    Logic: Logs events like view, click, add-to-cart, and purchase
                    for each recommended product.
                  </p>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={handleOpenRecommendationAnalytics}
                    disabled={recoAnalyticsLoading}
                    className="inline-flex items-center gap-1 rounded-full border border-blue-500/70 bg-blue-600 text-white px-3 py-1.5 text-[0.7rem] font-semibold shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {recoAnalyticsLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Opening...
                      </>
                    ) : (
                      <>
                        View Full Analytics
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Deliver Suggestions Based on Purchases & Interest (5.2) */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl border border-purple-300/40 bg-purple-50 dark:bg-purple-900/20 shadow-md flex flex-col gap-3"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
                    5.2 Personalized Product Suggestions
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Deliver product suggestions based on previous purchases and
                    user interests.
                  </p>

                  <ul className="mt-3 text-sm text-gray-700 dark:text-gray-200 space-y-1">
                    <li>• Bought Spaghetti → Suggest Tomato Sauce & Cheese</li>
                    <li>• Viewed Coffee often → Suggest Creamer & Sugar</li>
                    <li>• Buys canned goods → Offer rice and noodles bundles</li>
                  </ul>

                  <p className="mt-3 text-[0.7rem] text-purple-700 dark:text-purple-300">
                    Logic: Uses purchase history, viewed items, and frequently
                    bought-together pairs.
                  </p>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={handleSyncPersonalizedSuggestions}
                    disabled={personalizedLoading}
                    className="inline-flex items-center gap-1 rounded-full border border-purple-500/70 bg-purple-600 text-white px-3 py-1.5 text-[0.7rem] font-semibold shadow-sm hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {personalizedLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        Sync to Mobile App
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>

                {personalizedStatus && (
                  <p className="mt-1 text-[0.7rem] text-purple-800 dark:text-purple-200">
                    {personalizedStatus}
                  </p>
                )}
              </motion.div>
            </div>
          </section>

          {/* PRICING & PROMOTION STRATEGIES */}
          <section className="mt-6 mb-2">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
              Pricing & Promotion Strategies
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {/* Pricing Strategies (5.3) */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl border border-amber-300/40 bg-amber-50 dark:bg-amber-900/20 shadow-md flex flex-col gap-3"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                    5.3 Pricing Strategy Suggestions
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Recommend pricing strategies based on demand and sales.
                  </p>

                  <ul className="mt-3 text-sm text-gray-700 dark:text-gray-200 space-y-1">
                    <li>• Softdrinks – High demand, low stock → Suggest +₱3</li>
                    <li>• Pasta Sauce – Slow-moving → Add to bundle promo</li>
                    <li>• Near-expiry Snacks – Suggest markdown of 10–20%</li>
                  </ul>

                  <p className="mt-3 text-[0.7rem] text-amber-700 dark:text-amber-300">
                    Logic: Combines demand score, stock levels, and expiry risk to
                    adjust price.
                  </p>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={handleApplyPricingStrategies}
                    disabled={pricingLoading}
                    className="inline-flex items-center gap-1 rounded-full border border-amber-500/70 bg-amber-500 text-white px-3 py-1.5 text-[0.7rem] font-semibold shadow-sm hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {pricingLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      <>
                        Apply Suggested Price
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>

                {pricingStatus && (
                  <p className="mt-1 text-[0.7rem] text-amber-800 dark:text-amber-200">
                    {pricingStatus}
                  </p>
                )}
              </motion.div>

              {/* Promotional Activities (5.4) */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl border border-indigo-300/40 bg-indigo-50 dark:bg-indigo-900/20 shadow-md flex flex-col gap-3"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
                    5.4 Promotional Activity Suggestions
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Suggest promotional activities to retain customers and
                    increase engagement.
                  </p>

                  <ul className="mt-3 text-sm text-gray-700 dark:text-gray-200 space-y-1">
                    <li>• Flash sale for slow-moving items</li>
                    <li>• 5% loyalty discount for repeat customers</li>
                    <li>• Free delivery for orders above ₱500</li>
                    <li>• Comeback voucher for inactive customers</li>
                  </ul>

                  <p className="mt-3 text-[0.7rem] text-indigo-700 dark:text-indigo-300">
                    Logic: Uses inactivity, loyalty level, and stock turnover to
                    generate promo ideas.
                  </p>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={handleLaunchPromotions}
                    disabled={promoLoading}
                    className="inline-flex items-center gap-1 rounded-full border border-indigo-500/70 bg-indigo-600 text-white px-3 py-1.5 text-[0.7rem] font-semibold shadow-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {promoLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Launching...
                      </>
                    ) : (
                      <>
                        Launch Promo Campaign
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>

                {promoStatus && (
                  <p className="mt-1 text-[0.7rem] text-indigo-800 dark:text-indigo-200">
                    {promoStatus}
                  </p>
                )}
              </motion.div>
            </div>
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
};

function SubStatCard({
  gradient,
  iconBg,
  Icon,
  value,
  label,
  helper,
}: SubStatCardProps) {
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
          "0 25px 65px rgba(15,23,42,0.38), 0 0 25px rgba(52,211,153,0.35)",
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`relative flex flex-col gap-3 p-4 rounded-2xl border border-white/25 text-white bg-gradient-to-br ${gradient} shadow-xl transform-gpu overflow-hidden group`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.32),transparent_60%)] opacity-80" />

      <div className="relative flex items-center justify-between text-[0.7rem] text-white/80">
        <span className="px-2 py-0.5 rounded-full bg-black/20 border border-white/20">
          Sub Admin Metric
        </span>
      </div>

      <div className="relative flex items-center gap-3 mt-1">
        <div className={`p-3 rounded-xl ${iconBg} shadow-md shadow-black/30`}>
          <Icon size={40} />
        </div>

        <div>
          <p className="text-xs text-white/90">{label}</p>
          <p className="text-3xl font-extrabold leading-tight mt-0.5">
            {value}
          </p>
          {helper && (
            <p className="text-[0.7rem] text-white/80 mt-0.5">{helper}</p>
          )}
        </div>
      </div>

      <div className="relative flex justify-end mt-1">
        <button className="group flex items-center gap-1 text-[0.72rem] text-white/90">
          More Info
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </button>
      </div>
    </motion.article>
  );
}
