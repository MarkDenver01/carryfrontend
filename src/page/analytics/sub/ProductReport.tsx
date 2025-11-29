// src/page/analytics/sub/ProductReport.tsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Dropdown, DropdownItem } from "flowbite-react";
import dayjs from "dayjs";

import {
  Search,
  ChevronDown,
  Filter,
  Package,
  AlertTriangle,
  Clock,
  Info,
  Layers,
  ShieldAlert,
  CheckCircle2,
  Flame,
  X,
  Tag,
  BarChart2,
  RefreshCw,
} from "lucide-react";

import { getAllProducts } from "../../../libs/ApiGatewayDatasource";
import type { ProductDTO } from "../../../libs/models/product/Product";
import ProductLegendLayout from "../../../layout/product/ProductLegendLayout";

/* =========================
   TYPES & CONSTANTS
========================= */

type SortOption = "Urgency" | "Name" | "Category" | "Stock" | "DaysLeft";

type ExpiryStatus =
  | "New Stocks"
  | "Good"
  | "Warning"
  | "Near Expiry"
  | "Expired";

interface EnrichedProduct {
  id: string;
  name: string;
  category: string;
  stock: number;
  stockInDate: string | null;
  expiryDate: string | null;

  daysLeft: number | null;
  shelfLifeDays: number | null;
  elapsedDays: number | null;
  percentUsed: number | null; // 0–1

  status: ExpiryStatus;
  statusPriority: number;
  statusColorClass: string;
  statusSoftClass: string;
  statusDescription: string;
}

const STATUS_ORDER: ExpiryStatus[] = [
  "Expired",
  "Near Expiry",
  "Warning",
  "Good",
  "New Stocks",
];

const clamp = (val: number, min: number, max: number) =>
  Math.min(max, Math.max(min, val));

const classifyByShelfLife = (
  percentUsed: number | null,
  daysLeft: number | null
): {
  status: ExpiryStatus;
  priority: number;
  colorClass: string;
  softClass: string;
  description: string;
} => {
  // Kulang / invalid data -> treat as "Good" pero may note sa description
  if (percentUsed === null || daysLeft === null) {
    return {
      status: "Good",
      priority: 3,
      colorClass: "border-sky-400",
      softClass: "bg-sky-100 text-sky-700",
      description:
        "Expiry data is incomplete. Please double-check product setup for accurate monitoring.",
    };
  }

  // Expired
  if (daysLeft <= 0 || percentUsed >= 1) {
    return {
      status: "Expired",
      priority: 0,
      colorClass: "border-red-500",
      softClass: "bg-red-100 text-red-700",
      description:
        "This product has already passed its expiry date and should be removed from active inventory.",
    };
  }

  // Near Expiry
  if (percentUsed >= 0.75) {
    return {
      status: "Near Expiry",
      priority: 1,
      colorClass: "border-orange-500",
      softClass: "bg-orange-100 text-orange-700",
      description:
        "Above 75% of shelf-life used. High priority for promos, discounts, or clearance.",
    };
  }

  // Warning
  if (percentUsed >= 0.5) {
    return {
      status: "Warning",
      priority: 2,
      colorClass: "border-amber-400",
      softClass: "bg-amber-100 text-amber-700",
      description:
        "More than half of shelf-life consumed. Monitor closely and prepare selling strategy.",
    };
  }

  // Good
  if (percentUsed >= 0.25) {
    return {
      status: "Good",
      priority: 3,
      colorClass: "border-sky-400",
      softClass: "bg-sky-100 text-sky-700",
      description:
        "Product is within a healthy shelf window and can stay in normal rotation.",
    };
  }

  // New Stocks
  return {
    status: "New Stocks",
    priority: 4,
    colorClass: "border-emerald-500",
    softClass: "bg-emerald-100 text-emerald-700",
    description:
      "Newly stocked item with most of its shelf-life remaining. Ideal for future selling periods.",
  };
};

/* =========================
   MAIN COMPONENT
========================= */

export default function ProductReport() {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const [statusFilter, setStatusFilter] = useState<ExpiryStatus | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<SortOption>("Urgency");
  const [search, setSearch] = useState("");

  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<EnrichedProduct | null>(
    null
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const fetchProducts = async (isRefresh = false) => {
    try {
      if (isRefresh) setLoadingRefresh(true);
      else setLoadingProducts(true);

      const data = await getAllProducts();
      setProducts(data ?? []);
      setLastUpdated(dayjs().format("MMM D, YYYY • HH:mm"));
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      if (isRefresh) setLoadingRefresh(false);
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts(false);
  }, []);

  /* =========================
     DATA ENRICH
  ========================= */

  const enrichedData: EnrichedProduct[] = useMemo(() => {
    const today = dayjs();

    return products.map((p, index) => {
      const name = p.productName;
      const category = p.categoryName ?? "Uncategorized";
      const stock = (p as any).stocks ?? 0;

      const stockInDateStr = (p as any).stockInDate ?? null;
      const expiryDateStr = (p as any).expiryDate ?? null;

      let daysLeft: number | null = null;
      let shelfLifeDays: number | null = null;
      let elapsedDays: number | null = null;
      let percentUsed: number | null = null;

      if (stockInDateStr && expiryDateStr) {
        const stockIn = dayjs(stockInDateStr);
        const expiry = dayjs(expiryDateStr);

        if (stockIn.isValid() && expiry.isValid() && expiry.isAfter(stockIn)) {
          shelfLifeDays = expiry.diff(stockIn, "day");
          elapsedDays = today.diff(stockIn, "day");

          const diffHours = expiry.diff(today, "hour");
          daysLeft = Math.ceil(diffHours / 24);

          const safeElapsed = clamp(elapsedDays, 0, shelfLifeDays);
          percentUsed = clamp(safeElapsed / shelfLifeDays, 0, 1.5);
        }
      }

      const statusInfo = classifyByShelfLife(percentUsed, daysLeft);

      return {
        id: `${name}-${index}`,
        name,
        category,
        stock,
        stockInDate: stockInDateStr,
        expiryDate: expiryDateStr,
        daysLeft,
        shelfLifeDays,
        elapsedDays,
        percentUsed,
        status: statusInfo.status,
        statusPriority: statusInfo.priority,
        statusColorClass: statusInfo.colorClass,
        statusSoftClass: statusInfo.softClass,
        statusDescription: statusInfo.description,
      };
    });
  }, [products]);

  /* =========================
     SUMMARY & CATEGORY ANALYTICS
  ========================= */

  const summary = useMemo(() => {
    const counts: Record<ExpiryStatus, number> = {
      "New Stocks": 0,
      Good: 0,
      Warning: 0,
      "Near Expiry": 0,
      Expired: 0,
    };

    enrichedData.forEach((item) => {
      counts[item.status]++;
    });

    const total = enrichedData.length;
    const expiringSoon = counts["Expired"] + counts["Near Expiry"];

    return { total, counts, expiringSoon };
  }, [enrichedData]);

  const uniqueCategories = useMemo(
    () =>
      Array.from(new Set(enrichedData.map((p) => p.category)))
        .filter((c) => !!c)
        .sort(),
    [enrichedData]
  );

  const categoryAnalytics = useMemo(
    () =>
      uniqueCategories.map((cat) => {
        const items = enrichedData.filter((p) => p.category === cat);
        if (!items.length)
          return {
            category: cat,
            total: 0,
            expired: 0,
            nearExpiry: 0,
            warning: 0,
            avgDaysLeft: null as number | null,
          };

        let totalDays = 0;
        let countWithDays = 0;
        let expired = 0;
        let nearExpiry = 0;
        let warning = 0;

        items.forEach((p) => {
          if (p.daysLeft !== null) {
            totalDays += p.daysLeft;
            countWithDays++;
          }
          if (p.status === "Expired") expired++;
          if (p.status === "Near Expiry") nearExpiry++;
          if (p.status === "Warning") warning++;
        });

        const avgDaysLeft =
          countWithDays > 0 ? Math.round(totalDays / countWithDays) : null;

        return {
          category: cat,
          total: items.length,
          expired,
          nearExpiry,
          warning,
          avgDaysLeft,
        };
      }),
    [enrichedData, uniqueCategories]
  );

  /* =========================
     FILTER + SORT
  ========================= */

  const filteredAndSorted = useMemo(() => {
    let data = enrichedData;

    if (statusFilter !== "All") {
      data = data.filter((item) => item.status === statusFilter);
    }

    if (categoryFilter !== "All") {
      data = data.filter((item) => item.category === categoryFilter);
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(s) ||
          item.category.toLowerCase().includes(s)
      );
    }

    data = [...data].sort((a, b) => {
      if (sortBy === "Urgency") {
        if (a.statusPriority !== b.statusPriority) {
          return a.statusPriority - b.statusPriority;
        }
        const aDays =
          a.daysLeft === null ? Number.POSITIVE_INFINITY : a.daysLeft;
        const bDays =
          b.daysLeft === null ? Number.POSITIVE_INFINITY : b.daysLeft;
        return aDays - bDays;
      }

      if (sortBy === "Name") {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === "Category") {
        const catCompare = a.category.localeCompare(b.category);
        if (catCompare !== 0) return catCompare;
        return a.name.localeCompare(b.name);
      }

      if (sortBy === "Stock") {
        return b.stock - a.stock;
      }

      const aVal =
        a.daysLeft === null ? Number.POSITIVE_INFINITY : a.daysLeft;
      const bVal =
        b.daysLeft === null ? Number.POSITIVE_INFINITY : b.daysLeft;
      return aVal - bVal;
    });

    return data;
  }, [enrichedData, statusFilter, categoryFilter, sortBy, search]);

  const visibleCount = filteredAndSorted.length;

  /* =========================
     RENDER
  ========================= */

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative p-6 md:p-8 flex flex-col gap-8 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* HUD GRID BACKDROP (gaya ng Riders) */}
      <div className="pointer-events-none absolute inset-0 -z-30">
        <div className="w-full h-full opacity-40 mix-blend-soft-light bg-[linear-gradient(to_right,rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 opacity-[0.05] mix-blend-soft-light bg-[repeating-linear-gradient(to_bottom,rgba(15,23,42,0.7)_0px,rgba(15,23,42,0.7)_1px,transparent_1px,transparent_4px)]" />

        <motion.div
          className="absolute -top-20 -left-16 h-64 w-64 bg-emerald-500/26 blur-3xl"
          animate={{
            x: [0, 18, 8, -6, 0],
            y: [0, 10, 20, 5, 0],
            borderRadius: ["45%", "60%", "55%", "65%", "45%"],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute right-0 bottom-[-5rem] h-72 w-72 bg-sky-400/22 blur-3xl"
          animate={{
            x: [0, -15, -25, -10, 0],
            y: [0, -10, -20, -5, 0],
            borderRadius: ["50%", "65%", "55%", "70%", "50%"],
          }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* SPOTLIGHT FOLLOWING CURSOR */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background: `radial-gradient(550px at ${cursorPos.x}px ${cursorPos.y}px, rgba(34,197,94,0.32), transparent 70%)`,
        }}
      />

      {/* HEADER */}
      <div className="relative flex flex-col gap-3">
        <motion.h1
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-600 bg-clip-text text-transparent"
        >
          Product Expiry Monitor
        </motion.h1>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-gray-500 text-sm max-w-xl">
            Track{" "}
            <span className="font-medium text-emerald-700">
              shelf-life, expiry risk, and stock freshness
            </span>{" "}
            for every product in one unified dashboard.
          </p>

          {/* Auto-refresh capsule */}
          <div className="flex items-center gap-2 text-[11px]">
            {lastUpdated && (
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                Last updated:{" "}
                <span className="font-medium text-slate-700">
                  {lastUpdated}
                </span>
              </span>
            )}
            <button
              type="button"
              onClick={() => fetchProducts(true)}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium border ${
                loadingRefresh
                  ? "border-emerald-300 bg-emerald-50 text-emerald-500"
                  : "border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-700"
              } transition`}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  loadingRefresh ? "animate-spin" : ""
                }`}
              />
              {loadingRefresh ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>

        <div className="mt-3 h-[3px] w-24 bg-gradient-to-r from-emerald-400 via-emerald-500 to-transparent rounded-full" />
      </div>

      {/* MAIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[26px] border border-emerald-500/30 bg-white/95 shadow-[0_22px_70px_rgba(15,23,42,0.40)] overflow-hidden"
      >
        {/* Frame corners */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-3 left-3 h-5 w-5 border-t-2 border-l-2 border-emerald-400/80" />
          <div className="absolute top-3 right-3 h-5 w-5 border-t-2 border-r-2 border-emerald-400/80" />
          <div className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-emerald-400/80" />
          <div className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-emerald-400/80" />
        </div>

        <div className="relative flex flex-col gap-8 p-5 md:p-6 lg:p-7">
          {/* scanning line */}
          <motion.div
            className="pointer-events-none absolute top-10 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent opacity-70"
            animate={{ x: ["-20%", "20%", "-20%"] }}
            transition={{ duration: 5, repeat: Infinity }}
          />

          {/* SUMMARY CARDS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              icon={<Package className="w-7 h-7" />}
              label="Total Products"
              value={summary.total.toString()}
              accent="All active SKUs monitored"
              color="emerald"
            />
            <SummaryCard
              icon={<ShieldAlert className="w-7 h-7" />}
              label="Expiring / Expired"
              value={summary.expiringSoon.toString()}
              accent="Expired + Near Expiry items"
              color="rose"
            />
            <SummaryCard
              icon={<AlertTriangle className="w-7 h-7" />}
              label="Warning Stocks"
              value={summary.counts["Warning"].toString()}
              accent="Need close monitoring"
              color="amber"
            />
            <SummaryCard
              icon={<CheckCircle2 className="w-7 h-7" />}
              label="Healthy / New"
              value={(
                summary.counts["Good"] + summary.counts["New Stocks"]
              ).toString()}
              accent="Good shelf-life window"
              color="indigo"
            />
          </section>

          {/* STATUS OVERVIEW */}
          <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" />
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Status Overview
                </p>
              </div>
              <span className="text-[11px] text-slate-500">
                Showing{" "}
                <span className="font-semibold text-emerald-600">
                  {visibleCount}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {summary.total}
                </span>{" "}
                products
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {STATUS_ORDER.map((status) => {
                const count = summary.counts[status];
                const icon =
                  status === "Expired"
                    ? "❌"
                    : status === "Near Expiry"
                    ? "⏳"
                    : status === "Warning"
                    ? "⚠️"
                    : status === "Good"
                    ? "✅"
                    : "🆕";

                const base =
                  "px-3 py-1.5 rounded-full text-xs font-medium border inline-flex items-center gap-2";

                const colorClass =
                  status === "Expired"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : status === "Near Expiry"
                    ? "border-orange-200 bg-orange-50 text-orange-700"
                    : status === "Warning"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : status === "Good"
                    ? "border-sky-200 bg-sky-50 text-sky-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700";

                return (
                  <div key={status} className={`${base} ${colorClass}`}>
                    <span>{icon}</span>
                    <span>{status}</span>
                    <span className="text-[11px] opacity-80">
                      {count} item{count !== 1 ? "s" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* CATEGORY ANALYTICS ROW */}
          {categoryAnalytics.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-500" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Category Snapshots
                  </p>
                </div>
                <p className="text-[11px] text-slate-400">
                  Quick view of risk per category
                </p>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {categoryAnalytics.map((cat) => (
                  <div
                    key={cat.category}
                    className="min-w-[180px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600 flex flex-col gap-1"
                  >
                    <p className="font-semibold text-slate-800 line-clamp-1">
                      {cat.category}
                    </p>
                    <p>
                      {cat.total} item{cat.total !== 1 ? "s" : ""} •{" "}
                      <span className="text-red-500">
                        {cat.expired} expired
                      </span>
                      ,{" "}
                      <span className="text-orange-500">
                        {cat.nearExpiry} near
                      </span>
                      ,{" "}
                      <span className="text-amber-600">
                        {cat.warning} warning
                      </span>
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Avg days left:{" "}
                      {cat.avgDaysLeft !== null
                        ? `${cat.avgDaysLeft}d`
                        : "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* FILTERS */}
          <div className="flex flex-col gap-4">
            {/* top filters row */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                {/* Status filter */}
                <Dropdown
                  dismissOnClick
                  renderTrigger={() => (
                    <button className="flex items-center gap-2 border border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold text-xs sm:text-sm px-4 py-2 rounded-full shadow hover:bg-emerald-100 transition">
                      <Filter className="w-4 h-4" />
                      Status: {statusFilter}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  )}
                >
                  {["All", ...STATUS_ORDER].map((s) => (
                    <DropdownItem
                      key={s}
                      onClick={() => setStatusFilter(s as any)}
                    >
                      {s}
                    </DropdownItem>
                  ))}
                </Dropdown>

                {/* Sort dropdown */}
                <Dropdown
                  dismissOnClick
                  renderTrigger={() => (
                    <button className="flex items-center gap-2 border border-gray-300 bg-white text-gray-800 font-medium text-xs sm:text-sm px-4 py-2 rounded-full shadow-sm hover:bg-gray-50 transition">
                      <BarChart2 className="w-4 h-4" />
                      Sort: {sortBy}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  )}
                >
                  <DropdownItem onClick={() => setSortBy("Urgency")}>
                    Urgency (Status & Days Left)
                  </DropdownItem>
                  <DropdownItem onClick={() => setSortBy("Name")}>
                    Product Name (A–Z)
                  </DropdownItem>
                  <DropdownItem onClick={() => setSortBy("Category")}>
                    Category
                  </DropdownItem>
                  <DropdownItem onClick={() => setSortBy("Stock")}>
                    Stock (High → Low)
                  </DropdownItem>
                  <DropdownItem onClick={() => setSortBy("DaysLeft")}>
                    Days Left (Low → High)
                  </DropdownItem>
                </Dropdown>
              </div>

              {/* Search */}
              <div className="relative w-full max-w-xs">
                <input
                  type="text"
                  placeholder="Search product or category..."
                  className="w-full border border-emerald-300/80 rounded-xl px-4 py-2 pl-11 shadow-sm bg-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-emerald-500 w-5 h-5" />
              </div>
            </div>

            {/* Status chips (quick filter) */}
            <div className="flex flex-wrap gap-2">
              {(["All", ...STATUS_ORDER] as (ExpiryStatus | "All")[]).map(
                (st) => {
                  const isActive = statusFilter === st;

                  const icon =
                    st === "Expired"
                      ? "❌"
                      : st === "Near Expiry"
                      ? "⏳"
                      : st === "Warning"
                      ? "⚠️"
                      : st === "Good"
                      ? "✅"
                      : st === "New Stocks"
                      ? "🆕"
                      : "🌈";

                  return (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border inline-flex items-center gap-1 cursor-pointer transition
                      ${
                        isActive
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                          : "border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span>{icon}</span>
                      <span>{st}</span>
                    </button>
                  );
                }
              )}
            </div>

            {/* Category chips */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Tag className="w-3 h-3 text-emerald-500" />
                Categories:
              </span>
              <button
                onClick={() => setCategoryFilter("All")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border inline-flex items-center gap-1 transition
                ${
                  categoryFilter === "All"
                    ? "border-sky-500 bg-sky-50 text-sky-700"
                    : "border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-50"
                }`}
              >
                All
              </button>
              {uniqueCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border inline-flex items-center gap-1 transition
                  ${
                    categoryFilter === cat
                      ? "border-sky-500 bg-sky-50 text-sky-700"
                      : "border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* PRODUCT LIST (grouped by status) */}
          <div className="flex flex-col gap-6 mt-2">
            {loadingProducts ? (
              <div className="text-center text-sm text-slate-500 py-6">
                Loading products…
              </div>
            ) : filteredAndSorted.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 flex flex-col items-center justify-center gap-2">
                <AlertTriangle className="w-8 h-8 text-slate-400" />
                <p className="text-sm font-semibold">
                  No products found for the current filters.
                </p>
                <p className="text-xs text-slate-400">
                  Try clearing some filters or adjusting your search query.
                </p>
              </div>
            ) : (
              STATUS_ORDER.map((status) => {
                const groupItems = filteredAndSorted.filter(
                  (item) => item.status === status
                );
                if (!groupItems.length) return null;

                const statusIcon =
                  status === "Expired"
                    ? "❌"
                    : status === "Near Expiry"
                    ? "⏳"
                    : status === "Warning"
                    ? "⚠️"
                    : status === "Good"
                    ? "✅"
                    : "🆕";

                const headerColor =
                  status === "Expired"
                    ? "text-red-500"
                    : status === "Near Expiry"
                    ? "text-orange-500"
                    : status === "Warning"
                    ? "text-amber-500"
                    : status === "Good"
                    ? "text-sky-500"
                    : "text-emerald-500";

                const withDays = groupItems.filter(
                  (g) => g.daysLeft !== null
                );
                const minDays =
                  withDays.length > 0
                    ? Math.min(
                        ...withDays.map((g) => g.daysLeft ?? Infinity)
                      )
                    : null;

                return (
                  <section key={status} className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{statusIcon}</span>
                        <h2
                          className={`text-sm font-semibold uppercase tracking-wide ${headerColor}`}
                        >
                          {status}{" "}
                          <span className="text-xs text-slate-400 ml-1">
                            ({groupItems.length} item
                            {groupItems.length > 1 ? "s" : ""})
                          </span>
                        </h2>
                      </div>
                      {minDays !== null && (
                        <p className="text-[11px] text-slate-400">
                          Soonest expiry in{" "}
                          <span className="font-semibold text-slate-700">
                            {minDays} day
                            {minDays === 1 ? "" : "s"}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {groupItems.map((item) => (
                        <ProductCard
                          key={item.id}
                          product={item}
                          onClick={() => setSelectedProduct(item)}
                        />
                      ))}
                    </div>
                  </section>
                );
              })
            )}
          </div>

          {/* NOTE + LEGEND */}
          <div className="mt-4 text-xs text-slate-500 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 mt-0.5 text-emerald-500" />
            <p>
              Shelf-life status is based on the percentage of time consumed
              between{" "}
              <span className="font-semibold text-emerald-500">
                Stock-In Date
              </span>{" "}
              and{" "}
              <span className="font-semibold text-emerald-500">
                Expiry Date
              </span>
              , with{" "}
              <span className="font-semibold text-red-500">Expired</span> and{" "}
              <span className="font-semibold text-orange-500">
                Near Expiry
              </span>{" "}
              products automatically prioritized.
            </p>
          </div>

          <ProductLegendLayout />
        </div>
      </motion.div>

      {/* RIGHT-SIDE DRAWER (gaya ng Riders Profile) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="flex-1 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setSelectedProduct(null)}
          />

          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-50 shadow-[0_25px_80px_rgba(15,23,42,0.9)] p-6 border-l border-emerald-500/40 overflow-y-auto relative"
          >
            <div className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.45),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.45),transparent_55%)]" />

            <div className="relative z-10">
              {/* Header and close */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-50">
                    Product Details
                  </h2>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-emerald-400" />
                    {selectedProduct.category}
                  </p>
                </div>
                <button
                  className="text-slate-400 hover:text-slate-200 text-sm px-2 py-1 rounded-full bg-slate-800/80 border border-slate-600/70"
                  onClick={() => setSelectedProduct(null)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <DrawerContent product={selectedProduct} />
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

/* =========================
   PRODUCT CARD
========================= */

function ProductCard({
  product,
  onClick,
}: {
  product: EnrichedProduct;
  onClick: () => void;
}) {
  const {
    name,
    category,
    stock,
    stockInDate,
    expiryDate,
    daysLeft,
    percentUsed,
    status,
    statusSoftClass,
    statusColorClass,
  } = product;

  const percent = percentUsed !== null ? clamp(percentUsed, 0, 1) * 100 : 0;
  const daysLeftLabel =
    daysLeft === null ? "N/A" : `${daysLeft} day${daysLeft === 1 ? "" : "s"}`;

  const insightTags = getInsightTags(product);

  return (
    <motion.button
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={`relative flex flex-col items-stretch text-left rounded-2xl border ${statusColorClass} bg-white shadow-sm p-4 cursor-pointer hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400`}
    >
      {/* Left accent strip */}
      <div
        className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
        style={{
          background:
            status === "Expired"
              ? "#ef4444"
              : status === "Near Expiry"
              ? "#fb923c"
              : status === "Warning"
              ? "#f59e0b"
              : status === "Good"
              ? "#38bdf8"
              : "#22c55e",
        }}
      />

      {/* Status Badge + Name */}
      <div className="flex justify-between items-start gap-2 pl-1">
        <div className="flex items-start gap-3">
          {/* Avatar style (like Riders) */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 flex items-center justify-center font-semibold text-sm">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-0.5 line-clamp-2">
              {name}
            </h3>
            <p className="text-[11px] text-slate-400">{category}</p>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 ${statusSoftClass}`}
        >
          {status === "Expired" && "❌"}
          {status === "Near Expiry" && "⏳"}
          {status === "Warning" && "⚠️"}
          {status === "Good" && "✅"}
          {status === "New Stocks" && "🆕"}
          <span>{status}</span>
        </span>
      </div>

      {/* Shelf-life bar */}
      <div className="mt-3">
        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
          <span>Shelf-life usage</span>
          <span>{percentUsed === null ? "N/A" : `${percent.toFixed(0)}%`}</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-1.5 rounded-full ${
              status === "Expired"
                ? "bg-red-500"
                : status === "Near Expiry"
                ? "bg-orange-500"
                : status === "Warning"
                ? "bg-amber-400"
                : status === "Good"
                ? "bg-sky-400"
                : "bg-emerald-500"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Meta info */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-slate-500">
        <div>
          <p className="uppercase tracking-wide text-[10px] text-slate-400">
            Stock
          </p>
          <p className="font-semibold text-slate-700">{stock}</p>
        </div>
        <div>
          <p className="uppercase tracking-wide text-[10px] text-slate-400">
            Stock-In
          </p>
          <p className="font-semibold text-slate-700">
            {stockInDate ? dayjs(stockInDate).format("MMM D, YYYY") : "N/A"}
          </p>
        </div>
        <div>
          <p className="uppercase tracking-wide text-[10px] text-slate-400">
            Expiry
          </p>
          <p className="font-semibold text-slate-700">
            {expiryDate ? dayjs(expiryDate).format("MMM D, YYYY") : "N/A"}
          </p>
        </div>
      </div>

      {/* Days left */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Days left:</span>
          <span className="font-semibold text-slate-700">
            {daysLeftLabel}
          </span>
        </span>
      </div>

      {/* Insight tags */}
      {insightTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {insightTags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.button>
  );
}

/* =========================
   INSIGHT TAGS
========================= */

function getInsightTags(p: EnrichedProduct): string[] {
  const tags: string[] = [];

  if (p.status === "Expired") {
    tags.push("Requires disposal");
  }

  if (p.status === "Near Expiry") {
    tags.push("High priority promo");
  }

  if (p.status === "Warning") {
    tags.push("Monitor closely");
  }

  if (p.stock > 50 && (p.status === "Warning" || p.status === "Near Expiry")) {
    tags.push("High stock risk");
  }

  if (p.stock <= 5 && p.status !== "Expired") {
    tags.push("Low stock");
  }

  if (p.percentUsed !== null && p.percentUsed < 0.25) {
    tags.push("Very fresh");
  }

  if (tags.length === 0) {
    tags.push("Healthy inventory");
  }

  return tags;
}

/* =========================
   DRAWER CONTENT
========================= */

function DrawerContent({ product }: { product: EnrichedProduct }) {
  const {
    name,
    category,
    stock,
    stockInDate,
    expiryDate,
    daysLeft,
    percentUsed,
    shelfLifeDays,
    elapsedDays,
    status,
    statusSoftClass,
    statusDescription,
  } = product;

  const percent = percentUsed !== null ? clamp(percentUsed, 0, 1) * 100 : 0;
  const daysLeftLabel =
    daysLeft === null ? "N/A" : `${daysLeft} day${daysLeft === 1 ? "" : "s"}`;

  return (
    <div className="flex flex-col gap-4">
      {/* HEADER BLOCK - styled like Rider drawer */}
      <div className="border border-slate-700/80 rounded-xl p-4 bg-slate-900/80 flex items-start gap-3">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-300 to-teal-300 text-emerald-950 flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-500/40">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-50 line-clamp-2">
                {name}
              </p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                <Layers className="w-3 h-3 text-emerald-400" />
                {category}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold ${statusSoftClass}`}
            >
              {status === "Expired" && "❌"}
              {status === "Near Expiry" && "⏳"}
              {status === "Warning" && "⚠️"}
              {status === "Good" && "✅"}
              {status === "New Stocks" && "🆕"}
              <span>{status}</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-3 text-[11px] text-slate-300">
            <div className="flex items-center gap-1">
              <Package className="w-4 h-4 text-emerald-400" />
              <span>Stock:</span>
              <span className="font-semibold text-slate-50">{stock}</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Days left:</span>
              <span className="font-semibold text-slate-50">
                {daysLeftLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK STATS GRID */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-slate-700/80 rounded-lg p-3 bg-slate-900/70">
          <p className="text-[11px] text-slate-400">Shelf used</p>
          <p className="font-semibold text-slate-50 mt-1">
            {percentUsed === null ? "N/A" : `${percent.toFixed(1)}%`}
          </p>
        </div>
        <div className="border border-slate-700/80 rounded-lg p-3 bg-slate-900/70">
          <p className="text-[11px] text-slate-400">Elapsed</p>
          <p className="font-semibold text-slate-50 mt-1">
            {elapsedDays !== null ? `${elapsedDays} days` : "N/A"}
          </p>
        </div>
        <div className="border border-slate-700/80 rounded-lg p-3 bg-slate-900/70">
          <p className="text-[11px] text-slate-400">Shelf-life</p>
          <p className="font-semibold text-slate-50 mt-1">
            {shelfLifeDays !== null ? `${shelfLifeDays} days` : "N/A"}
          </p>
        </div>
      </div>

      {/* Shelf-life timeline */}
      <div className="border border-slate-700/80 rounded-xl p-4 bg-slate-900/70">
        <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">
          Shelf-life Timeline
        </p>
        <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-2.5 rounded-full ${
              status === "Expired"
                ? "bg-red-500"
                : status === "Near Expiry"
                ? "bg-orange-500"
                : status === "Warning"
                ? "bg-amber-400"
                : status === "Good"
                ? "bg-sky-400"
                : "bg-emerald-500"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 mt-2">
          <span>
            {stockInDate
              ? `Stock-in: ${dayjs(stockInDate).format("MMM D, YYYY")}`
              : "Stock-in: N/A"}
          </span>
          <span>
            {expiryDate
              ? `Expiry: ${dayjs(expiryDate).format("MMM D, YYYY")}`
              : "Expiry: N/A"}
          </span>
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 mt-1">
          <span>
            Elapsed:{" "}
            {elapsedDays !== null ? `${elapsedDays} days` : "N/A"}
          </span>
          <span>
            Shelf-life:{" "}
            {shelfLifeDays !== null ? `${shelfLifeDays} days` : "N/A"}
          </span>
        </div>
      </div>

      {/* Status explanation */}
      <div className="border border-slate-700/80 rounded-xl p-4 bg-slate-900/70">
        <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">
          Status Explanation
        </p>
        <p className="text-[11px] text-slate-200 leading-relaxed">
          {statusDescription}
        </p>
      </div>

      {/* Placeholder actions (UI only) */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-600"
        >
          Mark as Checked Today
        </button>
        <button
          type="button"
          className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-800 text-slate-100 hover:bg-slate-700"
        >
          Add Note (future feature)
        </button>
      </div>
    </div>
  );
}

/* =========================
   SUMMARY CARD
========================= */

function SummaryCard({
  icon,
  label,
  value,
  accent,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
  color: "emerald" | "rose" | "amber" | "indigo";
}) {
  const colors: Record<typeof color, string> = {
    emerald: "from-emerald-500 to-emerald-700",
    rose: "from-rose-500 to-rose-700",
    amber: "from-amber-500 to-amber-700",
    indigo: "from-indigo-500 to-indigo-700",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -6,
        scale: 1.03,
        boxShadow: "0 22px 60px rgba(15,23,42,0.35)",
      }}
      transition={{ duration: 0.35 }}
      className={`relative p-5 rounded-2xl border border-white/40 text-white bg-gradient-to-br ${colors[color]} shadow-xl overflow-hidden`}
    >
      <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.5),transparent_55%)]" />
      <div className="relative flex items-center gap-3">
        <div className="p-3 bg-white/15 rounded-xl flex items-center justify-center">
          {icon}
        </div>

        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.16em] text-white/80">
            {label}
          </p>
          <p className="text-2xl md:text-3xl font-bold leading-tight">
            {value}
          </p>
          <p className="text-[0.7rem] text-white/80 mt-1">{accent}</p>
        </div>
      </div>
    </motion.div>
  );
}
