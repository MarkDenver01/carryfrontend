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
  Tag,
  BarChart2,
  RefreshCw,
  X,
} from "lucide-react";

import {
  getAllProducts,
  updateProductStatus,
  markProductOutOfStock,
} from "../../../libs/ApiGatewayDatasource";
import type { ProductDTO } from "../../../libs/models/product/Product";

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
  productId: number;
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
  backendStatus: string; // normalized inventory status from backend
}

const STATUS_ORDER: ExpiryStatus[] = [
  "Expired",
  "Near Expiry",
  "Warning",
  "Good",
  "New Stocks",
];

const PAGE_SIZE = 120; // For 1000+ products, incremental load

const clamp = (val: number, min: number, max: number) =>
  Math.min(max, Math.max(min, val));

// 🔧 Normalize backend strings to consistent FE standard
const normalizeStatus = (raw: string | null | undefined): string => {
  if (!raw) return "Available";

  const s = raw.toLowerCase().trim();

  if (s === "available") return "Available";
  if (s === "for promo") return "For Promo";
  if (s === "out of stock" || s === "out_of_stock" || s === "oos")
    return "Out of Stock";
  if (s === "not available" || s === "not_available") return "Not Available";

  return raw;
};

/**
 * Classify purely based on DAYS LEFT (expiry vs today)
 *
 * daysLeft <= 0  → Expired
 * 1–4            → Warning
 * 5–50           → Near Expiry
 * 51–90          → Good
 * > 90           → New Stocks
 */
const classifyByDaysLeft = (
  daysLeft: number | null
): {
  status: ExpiryStatus;
  priority: number;
  colorClass: string;
  softClass: string;
} => {
  // No expiry date → treat as Good
  if (daysLeft === null) {
    return {
      status: "Good",
      priority: 3,
      colorClass: "border-sky-200",
      softClass: "bg-sky-50 text-sky-700",
    };
  }

  if (daysLeft <= 0) {
    return {
      status: "Expired",
      priority: 0,
      colorClass: "border-red-300",
      softClass: "bg-red-50 text-red-700",
    };
  }

  // 1–4 days left → Warning (super lapit na)
  if (daysLeft <= 4) {
    return {
      status: "Warning",
      priority: 2,
      colorClass: "border-amber-300",
      softClass: "bg-amber-50 text-amber-700",
    };
  }

  // 5–50 days left → Near Expiry
  if (daysLeft <= 50) {
    return {
      status: "Near Expiry",
      priority: 1,
      colorClass: "border-orange-300",
      softClass: "bg-orange-50 text-orange-700",
    };
  }

  // 51–90 → Good
  if (daysLeft <= 90) {
    return {
      status: "Good",
      priority: 3,
      colorClass: "border-sky-200",
      softClass: "bg-sky-50 text-sky-700",
    };
  }

  // 90+ days → New Stocks
  return {
    status: "New Stocks",
    priority: 4,
    colorClass: "border-emerald-300",
    softClass: "bg-emerald-50 text-emerald-700",
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

  const [selectedProduct, setSelectedProduct] =
    useState<EnrichedProduct | null>(null);

  const [page, setPage] = useState(1); // pagination for large data

  // 🔄 status update tracker (UI loading per product)
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);

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
      setPage(1); // reset pagination after fresh fetch
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
     BACKEND STATUS ACTIONS
  ========================= */

  const handleChangeStatus = async (
    productId: number,
    action: "For Promo" | "Out of Stock"
  ) => {
    try {
      setStatusUpdatingId(productId);

      if (action === "Out of Stock") {
        // 👉 Out of stock: mark in backend + tanggalin sa monitoring list (FE)
        await markProductOutOfStock(productId);
        setProducts((prev) =>
          prev.filter((p: any) => p.productId !== productId)
        );
      } else {
        // For Promo → backend field productStatus = "For Promo"
        await updateProductStatus(productId, { productStatus: action });

        setProducts((prev: any[]) =>
          prev.map((p: any) =>
            p.productId === productId
              ? {
                  ...p,
                  productStatus: action,
                }
              : p
          )
        );
      }
    } catch (err) {
      console.error("Failed to update product status", err);
      // OPTIONAL: show toast / SweetAlert dito
    } finally {
      setStatusUpdatingId(null);
    }
  };

  /* =========================
     DATA ENRICH
  ========================= */

  const enrichedData: EnrichedProduct[] = useMemo(() => {
    const today = dayjs().startOf("day");

    return products.map((p: any, index) => {
      const name: string = p.productName;
      const category: string = p.categoryName ?? "Uncategorized";

      // ✅ Stock from backend (int stocks)
      const stock: number = Number(p.stocks ?? p.stock ?? 0);

      // 🧠 Field names from backend (LocalDateTime → JSON string)
      const expiryDateStr: string | null = p.expiryDate
        ? String(p.expiryDate)
        : null;

      // DTO: LocalDateTime productInDate with JSON name "stockInDate"
      const stockInDateStr: string | null =
        (p.productInDate && String(p.productInDate)) ||
        (p.stockInDate && String(p.stockInDate)) ||
        null;

      // 🔧 Normalize inventory status from backend
      const backendStatus: string = normalizeStatus(p.productStatus);

      let daysLeft: number | null = null;
      let shelfLifeDays: number | null = null;
      let elapsedDays: number | null = null;
      let percentUsed: number | null = null;

      let expiry: dayjs.Dayjs | null = null;
      let stockIn: dayjs.Dayjs | null = null;

      if (expiryDateStr) {
        let parsedExpiry = dayjs(expiryDateStr);
        if (!parsedExpiry.isValid()) {
          parsedExpiry = dayjs(expiryDateStr, "MMM D, YYYY hh:mm A", true);
        }
        if (parsedExpiry.isValid()) {
          expiry = parsedExpiry.startOf("day");
          daysLeft = expiry.diff(today, "day");
        }
      }

      if (stockInDateStr) {
        let parsedStockIn = dayjs(stockInDateStr);
        if (!parsedStockIn.isValid()) {
          parsedStockIn = dayjs(stockInDateStr, "MMM D, YYYY hh:mm A", true);
        }
        if (parsedStockIn.isValid()) {
          stockIn = parsedStockIn.startOf("day");
        }
      }

      // Shelf-life % (optional visual only)
      if (stockIn && expiry && expiry.isAfter(stockIn)) {
        shelfLifeDays = expiry.diff(stockIn, "day");
        elapsedDays = today.diff(stockIn, "day");
        const safeElapsed = clamp(elapsedDays, 0, shelfLifeDays);
        percentUsed = clamp(safeElapsed / shelfLifeDays, 0, 1);
      }

      // 👉 Main status based on DAYS LEFT ONLY (with your new rules)
      const statusInfo = classifyByDaysLeft(daysLeft);

      return {
        productId: p.productId,
        id: `${p.productId}-${name}-${index}`,
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
        backendStatus,
      };
    });
  }, [products]);

  // 🧹 MONITORED DATA ONLY (exclude Out of Stock / Not Available)
  const monitoredData: EnrichedProduct[] = useMemo(
    () =>
      enrichedData.filter((p) => {
        const s = normalizeStatus(p.backendStatus).toLowerCase();
        return s !== "out of stock" && s !== "not available";
      }),
    [enrichedData]
  );

  /* =========================
     SUMMARY & CATEGORY
  ========================= */

  const summary = useMemo(() => {
    const counts: Record<ExpiryStatus, number> = {
      "New Stocks": 0,
      Good: 0,
      Warning: 0,
      "Near Expiry": 0,
      Expired: 0,
    };

    monitoredData.forEach((item) => {
      counts[item.status]++;
    });

    const total = monitoredData.length;

    // Expiring soon = Expired + Near Expiry
    const expiringSoon = counts["Expired"] + counts["Near Expiry"];

    // STOCK + STATUS-BASED WARNING: products with stock 30–50 AND status Warning / Near Expiry
    const warningStockCount = monitoredData.filter(
      (p) =>
        p.stock >= 30 &&
        p.stock <= 50 &&
        (p.status === "Warning" || p.status === "Near Expiry")
    ).length;

    return {
      total,
      counts,
      expiringSoon,
      warningStockCount,
    };
  }, [monitoredData]);

  const uniqueCategories = useMemo(
    () =>
      Array.from(new Set(monitoredData.map((p) => p.category)))
        .filter((c) => !!c)
        .sort(),
    [monitoredData]
  );

  const categorySnapshots = useMemo(
    () =>
      uniqueCategories.map((cat) => {
        const items = monitoredData.filter((p) => p.category === cat);

        let expired = 0;
        let near = 0;
        let warn = 0;

        items.forEach((p) => {
          if (p.status === "Expired") expired++;
          if (p.status === "Near Expiry") near++;
          if (p.status === "Warning") warn++;
        });

        return {
          category: cat,
          total: items.length,
          expired,
          near,
          warn,
        };
      }),
    [monitoredData, uniqueCategories]
  );

  /* =========================
     FILTER + SORT
  ========================= */

  const filteredAndSorted = useMemo(() => {
    let data = monitoredData;

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

      // DaysLeft
      const aVal =
        a.daysLeft === null ? Number.POSITIVE_INFINITY : a.daysLeft;
      const bVal =
        b.daysLeft === null ? Number.POSITIVE_INFINITY : b.daysLeft;
      return aVal - bVal;
    });

    return data;
  }, [monitoredData, statusFilter, categoryFilter, sortBy, search]);

  const paginated = useMemo(
    () => filteredAndSorted.slice(0, page * PAGE_SIZE),
    [filteredAndSorted, page]
  );

  const visibleCount = paginated.length;
  const canLoadMore = visibleCount < filteredAndSorted.length;

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
      {/* 🔳 HUD GRID BACKDROP */}
      <div className="pointer-events-none absolute inset-0 -z-30">
        <div className="w-full h-full opacity-40 mix-blend-soft-light bg-[linear-gradient(to_right,rgba(148,163,184,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.15)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 opacity-[0.08] mix-blend-soft-light bg-[repeating-linear-gradient(to_bottom,rgba(15,23,42,0.85)_0px,rgba(15,23,42,0.85)_1px,transparent_1px,transparent_3px)]" />
        <motion.div
          className="absolute -top-20 -left-16 h-64 w-64 bg-emerald-500/28 blur-3xl"
          animate={{
            x: [0, 20, 10, -5, 0],
            y: [0, 10, 20, 5, 0],
            borderRadius: ["45%", "60%", "55%", "65%", "45%"],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-0 bottom-[-5rem] h-72 w-72 bg-sky-400/24 blur-3xl"
          animate={{
            x: [0, -15, -25, -10, 0],
            y: [0, -10, -20, -5, 0],
            borderRadius: ["50%", "65%", "55%", "70%", "50%"],
          }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* 🎯 SPOTLIGHT FOLLOWING CURSOR */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background: `radial-gradient(550px at ${cursorPos.x}px ${cursorPos.y}px, rgba(34,197,94,0.26), transparent 70%)`,
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
        <p className="text-gray-500 text-sm max-w-xl">
          Live{" "}
          <span className="font-medium text-emerald-700">
            expiry & freshness intelligence
          </span>{" "}
          across all products to prevent losses and optimize promos.
        </p>
        <div className="mt-3 h-[3px] w-24 bg-gradient-to-r from-emerald-400 via-emerald-500 to-transparent rounded-full" />
      </div>

      {/* MAIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[26px] border border-emerald-500/30 bg-white/95 shadow-[0_22px_70px_rgba(15,23,42,0.40)] overflow-hidden"
      >
        {/* Outer brackets */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-3 left-3 h-5 w-5 border-t-2 border-l-2 border-emerald-400/80" />
          <div className="absolute top-3 right-3 h-5 w-5 border-t-2 border-r-2 border-emerald-400/80" />
          <div className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-emerald-400/80" />
          <div className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-emerald-400/80" />
        </div>

        <div className="relative flex flex-col gap-8 p-5 md:p-6 lg:p-7">
          {/* Scanning line */}
          <motion.div
            className="pointer-events-none absolute top-10 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent opacity-70"
            animate={{ x: ["-20%", "20%", "-20%"] }}
            transition={{ duration: 5, repeat: Infinity }}
          />

          {/* TABS + SUMMARY */}
          <div className="flex flex-col gap-6">
            {/* Status Tabs */}
            <div className="flex flex-wrap gap-3 overflow-x-auto pb-1">
              {(["All", ...STATUS_ORDER] as (ExpiryStatus | "All")[]).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setStatusFilter(tab);
                      setPage(1);
                    }}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border transition whitespace-nowrap ${
                      statusFilter === tab
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-400/50"
                        : "bg-white/90 border-gray-300 text-gray-700 hover:bg-emerald-50"
                    }`}
                  >
                    {tab === "All" ? "All Status" : tab}
                  </button>
                )
              )}
            </div>

            {/* SUMMARY CARDS */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard
                icon={<Package className="w-7 h-7" />}
                label="Total Products"
                value={summary.total.toString()}
                accent=""
                color="emerald"
              />
              <SummaryCard
                icon={<ShieldAlert className="w-7 h-7" />}
                label="Expiring / Expired"
                value={summary.expiringSoon.toString()}
                accent=""
                color="rose"
              />
              <SummaryCard
                icon={<AlertTriangle className="w-7 h-7" />}
                label="Warning Stocks (30–50)"
                value={summary.warningStockCount.toString()}
                accent=""
                color="amber"
              />
              <SummaryCard
                icon={<CheckCircle2 className="w-7 h-7" />}
                label="Healthy / New"
                value={(
                  summary.counts["Good"] + summary.counts["New Stocks"]
                ).toString()}
                accent=""
                color="indigo"
              />
            </section>
          </div>

          {/* FILTER BAR */}
          <section className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm px-4 py-4 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <Filter className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-medium uppercase tracking-wide">
                  Filters & Sorting
                </span>
                <span className="hidden md:inline text-slate-400">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {visibleCount}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-800">
                    {filteredAndSorted.length}
                  </span>{" "}
                  filtered products
                </span>
                {lastUpdated && (
                  <span className="hidden lg:inline text-[11px] text-slate-400 border-l pl-2 border-slate-200">
                    Last updated{" "}
                    <span className="font-medium text-slate-700">
                      {lastUpdated}
                    </span>
                  </span>
                )}
              </div>

              {/* Search */}
              <div className="relative w-full md:max-w-xs">
                <input
                  type="text"
                  placeholder="Search by product or category..."
                  className="w-full h-10 border border-slate-300 rounded-xl px-4 pl-10 text-sm bg-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 shadow-sm"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              </div>
            </div>

            {/* Dropdown row + Refresh */}
            <div className="flex flex-wrap gap-3 items-center">
              {/* Status filter dropdown */}
              <Dropdown
                dismissOnClick
                renderTrigger={() => (
                  <button className="flex items-center gap-2 border border-slate-300 bg-white text-slate-800 text-xs sm:text-sm px-3.5 py-2 rounded-full shadow-sm hover:bg-slate-50 transition">
                    <Filter className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium">
                      Status:{" "}
                      <span className="text-slate-900">{statusFilter}</span>
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                )}
              >
                {["All", ...STATUS_ORDER].map((s) => (
                  <DropdownItem
                    key={s}
                    onClick={() => {
                      setStatusFilter(s as any);
                      setPage(1);
                    }}
                  >
                    {s}
                  </DropdownItem>
                ))}
              </Dropdown>

              {/* Category filter dropdown */}
              <Dropdown
                dismissOnClick
                renderTrigger={() => (
                  <button className="flex items-center gap-2 border border-slate-300 bg-white text-slate-800 text-xs sm:text-sm px-3.5 py-2 rounded-full shadow-sm hover:bg-slate-50 transition">
                    <Tag className="w-4 h-4 text-sky-500" />
                    <span className="font-medium">
                      Category:{" "}
                      <span className="text-slate-900">
                        {categoryFilter === "All" ? "All" : categoryFilter}
                      </span>
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                )}
              >
                <DropdownItem
                  onClick={() => {
                    setCategoryFilter("All");
                    setPage(1);
                  }}
                >
                  All
                </DropdownItem>
                {uniqueCategories.map((cat) => (
                  <DropdownItem
                    key={cat}
                    onClick={() => {
                      setCategoryFilter(cat);
                      setPage(1);
                    }}
                  >
                    {cat}
                  </DropdownItem>
                ))}
              </Dropdown>

              {/* Sort dropdown */}
              <Dropdown
                dismissOnClick
                renderTrigger={() => (
                  <button className="flex items-center gap-2 border border-slate-300 bg-white text-slate-800 text-xs sm:text-sm px-3.5 py-2 rounded-full shadow-sm hover:bg-slate-50 transition">
                    <BarChart2 className="w-4 h-4 text-slate-500" />
                    <span className="font-medium">
                      Sort:{" "}
                      <span className="text-slate-900">{sortBy}</span>
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
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

              {/* Refresh capsule */}
              <button
                type="button"
                onClick={() => fetchProducts(true)}
                className={`inline-flex items-center gap-1 ml-auto px-3 py-2 rounded-full text-[11px] font-medium border ${
                  loadingRefresh
                    ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                    : "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600"
                } transition shadow-sm`}
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    loadingRefresh ? "animate-spin" : ""
                  }`}
                />
                {loadingRefresh ? "Refreshing…" : "Refresh"}
              </button>
            </div>
          </section>

          {/* STATUS & CATEGORY OVERVIEW */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            {/* Status Overview – bars */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-500" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Status Overview
                  </p>
                </div>
                <span className="text-[11px] text-slate-500">
                  {visibleCount} of {filteredAndSorted.length} filtered
                </span>
              </div>

              <div className="flex flex-col gap-2 mt-1">
                {STATUS_ORDER.map((status) => {
                  const count = summary.counts[status];
                  const pct =
                    summary.total > 0
                      ? Math.round((count / summary.total) * 100)
                      : 0;

                  const barColor =
                    status === "Expired"
                      ? "bg-red-400"
                      : status === "Near Expiry"
                      ? "bg-orange-400"
                      : status === "Warning"
                      ? "bg-amber-400"
                      : status === "Good"
                      ? "bg-sky-400"
                      : "bg-emerald-400";

                  const dotColor =
                    status === "Expired"
                      ? "bg-red-500"
                      : status === "Near Expiry"
                      ? "bg-orange-500"
                      : status === "Warning"
                      ? "bg-amber-500"
                      : status === "Good"
                      ? "bg-sky-500"
                      : "bg-emerald-500";

                  return (
                    <div key={status} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span className="flex items-center gap-1">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${dotColor}`}
                          />
                          <span className="font-medium">{status}</span>
                        </span>
                        <span className="text-slate-500">
                          {count} item{count !== 1 ? "s" : ""} • {pct}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Overview – interactive rows */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white/90 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-500" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Category Overview
                  </p>
                </div>
                <p className="text-[11px] text-slate-400">
                  Tap a category row to filter the product list
                </p>
              </div>

              {categorySnapshots.length === 0 ? (
                <p className="text-xs text-slate-400">
                  No categories found yet. Add products with categories to see
                  breakdown here.
                </p>
              ) : (
                <div className="flex flex-col divide-y divide-slate-100">
                  {categorySnapshots.map((catSnap) => {
                    const isActive = categoryFilter === catSnap.category;
                    const risky =
                      catSnap.expired + catSnap.near + catSnap.warn > 0;

                    return (
                      <button
                        key={catSnap.category}
                        type="button"
                        onClick={() => {
                          setCategoryFilter(
                            isActive ? "All" : catSnap.category
                          );
                          setPage(1);
                        }}
                        className={`flex w-full items-center justify-between gap-3 py-2.5 px-2 text-left transition rounded-xl ${
                          isActive
                            ? "bg-emerald-50/80 border border-emerald-200 shadow-sm"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-800">
                              {catSnap.category}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {catSnap.total} item
                              {catSnap.total !== 1 ? "s" : ""}
                            </span>
                          </div>

                          {risky && (
                            <div className="flex flex-wrap gap-2 text-[11px]">
                              {catSnap.expired > 0 && (
                                <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                  Expired: {catSnap.expired}
                                </span>
                              )}
                              {catSnap.near > 0 && (
                                <span className="inline-flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                                  Near: {catSnap.near}
                                </span>
                              )}
                              {catSnap.warn > 0 && (
                                <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                  Warning: {catSnap.warn}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <span className="text-[11px] text-slate-400">
                          {isActive ? "Clear" : "Filter"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* PRODUCT LIST (grouped by status) */}
          <div className="flex flex-col gap-6 mt-1">
            {loadingProducts ? (
              <div className="text-center text-sm text-slate-500 py-8">
                Loading products…
              </div>
            ) : paginated.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 flex flex-col items-center justify-center gap-2">
                <AlertTriangle className="w-8 h-8 text-slate-400" />
                <p className="text-sm font-semibold text-slate-700">
                  No products found for the current filters.
                </p>
                <p className="text-xs text-slate-400">
                  Try clearing some filters or adjusting your search query.
                </p>
              </div>
            ) : (
              <>
                {STATUS_ORDER.map((status) => {
                  const groupItems = paginated.filter(
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
                      ? "text-red-600"
                      : status === "Near Expiry"
                      ? "text-orange-600"
                      : status === "Warning"
                      ? "text-amber-600"
                      : status === "Good"
                      ? "text-sky-600"
                      : "text-emerald-600";

                  return (
                    <section key={status} className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{statusIcon}</span>
                          <h2
                            className={`text-sm font-semibold uppercase tracking-wide ${headerColor}`}
                          >
                            {status}
                            <span className="text-xs text-slate-400 ml-1 normal-case font-normal">
                              ({groupItems.length} item
                              {groupItems.length > 1 ? "s" : ""})
                            </span>
                          </h2>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {groupItems.map((item) => (
                          <ProductCard
                            key={item.id}
                            product={item}
                            isUpdating={statusUpdatingId === item.productId}
                            onClick={() => setSelectedProduct(item)}
                            onChangeStatus={(action) =>
                              handleChangeStatus(item.productId, action)
                            }
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}

                {/* LOAD MORE for 1000+ products */}
                {canLoadMore && (
                  <div className="flex justify-center mt-2">
                    <button
                      type="button"
                      onClick={() => setPage((p) => p + 1)}
                      className="px-4 py-2 rounded-full text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 shadow-md flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Load more products (
                      {filteredAndSorted.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* NOTE */}
          <div className="mt-2 text-xs text-slate-500 flex items-start gap-2 bg-slate-50/80 border border-slate-200 rounded-2xl px-3 py-2.5">
            <Info className="w-3.5 h-3.5 mt-0.5 text-emerald-500" />
            <p>
              Expiry status is based on{" "}
              <span className="font-semibold text-slate-700">Expiry Date</span>{" "}
              relative to today. Warning stocks (30–50 pcs) in{" "}
              <span className="font-semibold text-slate-700">
                Warning / Near Expiry
              </span>{" "}
              are also tracked for replenishment planning.
            </p>
          </div>
        </div>
      </motion.div>

      {/* PRODUCT PROFILE DRAWER */}
      {selectedProduct && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="flex-1 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setSelectedProduct(null)}
          />
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-50 shadow-[0_25px_80px_rgba(15,23,42,0.9)] p-6 border-l border-emerald-500/40 overflow-y-auto relative"
          >
            {/* Neon radial background */}
            <div className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.45),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.45),transparent_55%)]" />
            <div className="relative z-10">
              {/* Header + close */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-50">
                    Product Details
                  </h2>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
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
  onChangeStatus,
  isUpdating,
}: {
  product: EnrichedProduct;
  onClick: () => void;
  onChangeStatus: (action: "For Promo" | "Out of Stock") => void;
  isUpdating: boolean;
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
    backendStatus,
  } = product;

  const percent =
    percentUsed !== null ? clamp(percentUsed, 0, 1) * 100 : 0;

  const daysLeftLabel =
    daysLeft === null ? "N/A" : `${daysLeft} day${daysLeft === 1 ? "" : "s"}`;

  const insightTags = getInsightTags(product);

  const accentColor =
    status === "Expired"
      ? "bg-red-500"
      : status === "Near Expiry"
      ? "bg-orange-500"
      : status === "Warning"
      ? "bg-amber-400"
      : status === "Good"
      ? "bg-sky-400"
      : "bg-emerald-500";

  const isWarningStock = stock >= 30 && stock <= 50;
  const isOutOfStock =
    stock <= 0 || normalizeStatus(backendStatus) === "Out of Stock";

  const actions: {
    label: string;
    action: "For Promo" | "Out of Stock";
    kind: "promo" | "danger";
  }[] = [];

  if (!isOutOfStock) {
    actions.push(
      { label: "Promo", action: "For Promo", kind: "promo" },
      { label: "Out of Stock", action: "Out of Stock", kind: "danger" }
    );
  } else {
    actions.push({
      label: "Confirm Out of Stock",
      action: "Out of Stock",
      kind: "danger",
    });
  }

  const getButtonClasses = (kind: "promo" | "danger") => {
    if (kind === "promo")
      return "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300";
    return "bg-red-50 hover:bg-red-100 text-red-700 border border-red-300";
  };

  return (
    <motion.button
      whileHover={{ y: -3, scale: 1.02 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={`relative flex flex-col items-stretch text-left rounded-2xl border ${statusColorClass} bg-white shadow-sm hover:shadow-[0_18px_40px_rgba(15,23,42,0.18)] hover:bg-slate-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400/70 transition`}
    >
      {/* Left neon strip */}
      <div
        className={`absolute left-0 top-0 h-full w-[3px] ${accentColor} rounded-l-2xl`}
      />

      <div className="p-4">
        {/* Status Badge + Name */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-start gap-3">
            {/* Avatar-style initial */}
            <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-semibold text-sm">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-0.5 line-clamp-2 text-slate-900">
                {name}
              </h3>
              <p className="text-[11px] text-slate-500">{category}</p>
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
          <div className="flex justify-between text-[11px] text-slate-500 mb-1">
            <span>Shelf-life usage</span>
            <span>
              {percentUsed === null ? "N/A" : `${percent.toFixed(0)}%`}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-1.5 rounded-full ${accentColor}`}
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
            <p className="font-semibold text-slate-800">{stock}</p>
          </div>
          <div>
            <p className="uppercase tracking-wide text-[10px] text-slate-400">
              Stock-In
            </p>
            <p className="font-semibold text-slate-800">
              {stockInDate
                ? dayjs(stockInDate).format("MMM D, YYYY")
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="uppercase tracking-wide text-[10px] text-slate-400">
              Expiry
            </p>
            <p className="font-semibold text-slate-800">
              {expiryDate
                ? dayjs(expiryDate).format("MMM D, YYYY")
                : "N/A"}
            </p>
          </div>
        </div>

        {/* Days left + stock warning label */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Days left:</span>
            <span className="font-semibold text-slate-800">
              {daysLeftLabel}
            </span>
          </span>

          {isWarningStock && !isOutOfStock && (
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold">
              Warning stocks (30–50)
            </span>
          )}

          {isOutOfStock && (
            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-[10px] font-semibold">
              Out of stock
            </span>
          )}
        </div>

        {/* Backend inventory status */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-600 border border-slate-200/70">
            Inventory status:{" "}
            <span className="font-semibold">
              {backendStatus || "Not set"}
            </span>
          </span>
        </div>

        {/* Action buttons (Promo / Out of Stock) */}
        <div
          className="mt-3 flex flex-wrap gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {actions.map((btn) => (
            <button
              key={btn.label}
              type="button"
              disabled={isUpdating}
              onClick={() => onChangeStatus(btn.action)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 transition ${getButtonClasses(
                btn.kind
              )} ${
                isUpdating
                  ? "opacity-70 cursor-wait"
                  : "hover:shadow-sm cursor-pointer"
              }`}
            >
              {isUpdating && (
                <RefreshCw className="w-3 h-3 animate-spin opacity-80" />
              )}
              <span>{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Insight tags */}
        {insightTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {insightTags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-600 border border-slate-200/70"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
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
  if (
    p.stock > 50 &&
    (p.status === "Warning" || p.status === "Near Expiry")
  ) {
    tags.push("High stock risk");
  }
  if (p.stock <= 5 && p.status !== "Expired") {
    tags.push("Low stock");
  }
  if (p.percentUsed !== null && p.percentUsed < 0.25) {
    tags.push("Very fresh");
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
    status,
  } = product;

  const daysLeftLabel =
    daysLeft === null ? "N/A" : `${daysLeft} day${daysLeft === 1 ? "" : "s"}`;

  const freshnessLabel = (() => {
    if (percentUsed === null) return "Not computed";
    const pct = clamp(percentUsed, 0, 1) * 100;

    if (pct < 25) return "Very fresh";
    if (pct < 50) return "Early shelf";
    if (pct < 75) return "Mid shelf";
    if (pct < 100) return "Late shelf";
    return "Past expiry";
  })();

  const statusBadgeClass =
    status === "Expired"
      ? "bg-red-100 text-red-700 border-red-300"
      : status === "Near Expiry"
      ? "bg-orange-100 text-orange-700 border-orange-300"
      : status === "Warning"
      ? "bg-amber-100 text-amber-700 border-amber-300"
      : status === "Good"
      ? "bg-sky-100 text-sky-700 border-sky-300"
      : "bg-emerald-100 text-emerald-700 border-emerald-300";

  return (
    <div className="flex flex-col gap-5">
      {/* HEADER BLOCK */}
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
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold border ${statusBadgeClass}`}
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
              <span className="font-semibold text-slate-50">
                {stock}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-slate-300" />
              <span>Days left:</span>
              <span className="font-semibold text-slate-50">
                {daysLeftLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KEY INFO CARD */}
      <div className="border border-slate-700/80 rounded-xl p-4 bg-slate-900/70">
        <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-2 font-semibold">
          Key Info
        </p>
        <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-300">
          <div>
            <p className="text-slate-400">Stock-In Date</p>
            <p className="font-semibold text-slate-50">
              {stockInDate
                ? dayjs(stockInDate).format("MMM D, YYYY")
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Expiry Date</p>
            <p className="font-semibold text-slate-50">
              {expiryDate
                ? dayjs(expiryDate).format("MMM D, YYYY")
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Days Left</p>
            <p className="font-semibold text-slate-50">{daysLeftLabel}</p>
          </div>
          <div>
            <p className="text-slate-400">Freshness</p>
            <p className="font-semibold text-slate-50">
              {freshnessLabel}
            </p>
          </div>
        </div>
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
  const colors: Record<"emerald" | "rose" | "amber" | "indigo", string> = {
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
          {accent && (
            <p className="text-[0.7rem] text-white/80 mt-1">{accent}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
