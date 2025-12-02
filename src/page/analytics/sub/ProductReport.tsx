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
  percentUsed: number | null;
  status: ExpiryStatus;
  statusPriority: number;
  statusColorClass: string;
  statusSoftClass: string;
  inventoryStatus: string; // normalized inventory status
  isWarningStock: boolean;
  isNearExpiryWindow: boolean;
  combinedLabel: string | null; // e.g. "Warning Stocks + Near Expiry", "Warning Stocks", "Invalid expiry date"
  hasInvalidExpiry: boolean;
}

const STATUS_ORDER: ExpiryStatus[] = [
  "Expired",
  "Near Expiry",
  "Warning",
  "Good",
  "New Stocks",
];

// ✅ 15 ITEMS PER PAGE FOR PRODUCT TABLE
const PAGE_SIZE = 15;
// ✅ 6 CATEGORIES PER PAGE FOR CATEGORY OVERVIEW
const CATEGORY_PAGE_SIZE = 6;

const clamp = (val: number, min: number, max: number) =>
  Math.min(max, Math.max(min, val));

// 🔧 Normalize backend strings to consistent FE standard (inventory status)
const normalizeStatus = (raw: string | null | undefined): string => {
  if (!raw) return "Available";

  const s = raw.toLowerCase().trim();

  if (s === "available") return "Available";
  if (s === "for promo" || s === "for_promo") return "For Promo";
  if (s === "out of stock" || s === "out_of_stock" || s === "oos")
    return "Out of Stock";
  if (s === "not available" || s === "not_available") return "Not Available";

  return raw;
};

/**
 * Base classify purely based on DAYS LEFT (expiry vs today)
 *
 * 0           → Expired
 * 1–60        → Near Expiry
 * 61–100      → Good
 * 101+        → New Stocks
 * null        → Good (no expiry date, refined later by stock rules)
 */
const classifyByDaysLeft = (
  daysLeft: number | null
): {
  status: ExpiryStatus;
  priority: number;
  colorClass: string;
  softClass: string;
} => {
  // No expiry date → treat as Good baseline (refined by stock rules)
  if (daysLeft === null) {
    return {
      status: "Good",
      priority: 2,
      colorClass: "border-emerald-400",
      softClass: "bg-emerald-50 text-emerald-700",
    };
  }

  // 0 DAYS LEFT → EXPIRED
  if (daysLeft === 0) {
    return {
      status: "Expired",
      priority: 0,
      colorClass: "border-red-400",
      softClass: "bg-red-50 text-red-700",
    };
  }

  // 1–60 DAYS → NEAR EXPIRY
  if (daysLeft >= 1 && daysLeft <= 60) {
    return {
      status: "Near Expiry",
      priority: 1,
      colorClass: "border-orange-400",
      softClass: "bg-orange-50 text-orange-700",
    };
  }

  // 61–100 DAYS → GOOD
  if (daysLeft >= 61 && daysLeft <= 100) {
    return {
      status: "Good",
      priority: 2,
      colorClass: "border-emerald-400",
      softClass: "bg-emerald-50 text-emerald-700",
    };
  }

  // 101+ DAYS → NEW STOCKS
  return {
    status: "New Stocks",
    priority: 3,
    colorClass: "border-sky-400",
    softClass: "bg-sky-50 text-sky-700",
  };
};

// 🌈 Soft row highlight per expiry status
const ROW_HIGHLIGHT: Record<ExpiryStatus, string> = {
  Expired: "bg-red-50/70 hover:bg-red-50 border-l-4 border-red-400/80",
  "Near Expiry":
    "bg-orange-50/70 hover:bg-orange-50 border-l-4 border-orange-400/80",
  Warning:
    "bg-yellow-50/70 hover:bg-yellow-50 border-l-4 border-yellow-400/80",
  Good:
    "bg-emerald-50/40 hover:bg-emerald-50 border-l-4 border-emerald-300/80",
  "New Stocks":
    "bg-sky-50/40 hover:bg-sky-50 border-l-4 border-sky-300/80",
};

/* =========================
   MAIN COMPONENT
========================= */

export default function ProductReport() {
  const [statusFilter, setStatusFilter] =
    useState<ExpiryStatus | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<SortOption>("Urgency");
  const [search, setSearch] = useState("");

  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const [selectedProduct, setSelectedProduct] =
    useState<EnrichedProduct | null>(null);

  // ✅ TABLE PAGINATION
  const [page, setPage] = useState(1);
  // ✅ CATEGORY OVERVIEW PAGINATION
  const [categoryPage, setCategoryPage] = useState(1);

  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(
    null
  );

  // 🔥 For background spotlight effect
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

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
      setPage(1);
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

      const updated = await updateProductStatus(productId, {
        productStatus: action,
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.productId === updated.productId
            ? { ...p, productStatus: updated.productStatus }
            : p
        )
      );
    } catch (err) {
      console.error("Failed to update product status", err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  /* =========================
     DATA ENRICH + RULE ENGINE
  ========================== */

  const enrichedData: EnrichedProduct[] = useMemo(() => {
    const today = dayjs().startOf("day");

    return products.map((p: any, index) => {
      const name: string = p.productName;
      const category: string = p.categoryName ?? "Uncategorized";
      const stock: number = Number(p.stocks ?? p.stock ?? 0);

      const expiryDateStr: string | null = p.expiryDate
        ? String(p.expiryDate)
        : null;

      const stockInDateStr: string | null =
        (p.productInDate && String(p.productInDate)) ||
        (p.stockInDate && String(p.stockInDate)) ||
        null;

      let rawInventoryStatus: string = normalizeStatus(p.productStatus);

      let daysLeft: number | null = null;
      let shelfLifeDays: number | null = null;
      let elapsedDays: number | null = null;
      let percentUsed: number | null = null;

      let expiry: dayjs.Dayjs | null = null;
      let stockIn: dayjs.Dayjs | null = null;

      // Parse expiry
      if (expiryDateStr) {
        let parsedExpiry = dayjs(expiryDateStr);
        if (!parsedExpiry.isValid()) {
          parsedExpiry = dayjs(expiryDateStr, "MMM D, YYYY hh:mm A", true);
        }
        if (parsedExpiry.isValid()) {
          expiry = parsedExpiry.startOf("day");
          const diff = expiry.diff(today, "day");
          daysLeft = diff < 0 ? 0 : diff; // clamp negative → 0
        }
      }

      // Parse stock-in
      if (stockInDateStr) {
        let parsedStockIn = dayjs(stockInDateStr);
        if (!parsedStockIn.isValid()) {
          parsedStockIn = dayjs(stockInDateStr, "MMM D, YYYY hh:mm A", true);
        }
        if (parsedStockIn.isValid()) {
          stockIn = parsedStockIn.startOf("day");
        }
      }

      // Shelf life & progress
      if (stockIn && expiry && expiry.isAfter(stockIn)) {
        shelfLifeDays = expiry.diff(stockIn, "day");
        elapsedDays = today.diff(stockIn, "day");
        const safeElapsed = clamp(elapsedDays, 0, shelfLifeDays);
        percentUsed = clamp(safeElapsed / shelfLifeDays, 0, 1);
      }

      // Detect invalid expiry (expiry earlier than stock-in)
      const hasInvalidExpiry =
        !!expiry && !!stockIn && expiry.isBefore(stockIn);

      // Base classification by days
      let statusInfo = classifyByDaysLeft(daysLeft);

      // ==== STOCK FLAGS ====
      const stockZeroOrLess = stock <= 0;
      const isWarningStockRange = stock >= 1 && stock <= 60;
      const isGoodStockRange = stock >= 61 && stock <= 100;
      const isHighStockRange = stock >= 101;

      // ==== DAYS FLAGS ====
      const hasExpiry = daysLeft !== null;
      const isWarningDayRange =
        daysLeft !== null && daysLeft >= 1 && daysLeft <= 60;
      const isGoodDayRange =
        daysLeft !== null && daysLeft >= 61 && daysLeft <= 100;
      const isHighDayRange = daysLeft !== null && daysLeft >= 101;

      let combinedLabel: string | null = null;

      // ==== INVENTORY STATUS (stock + backend) ====
      let inventoryStatus = rawInventoryStatus || "Available";
      if (stockZeroOrLess) {
        // Out of Stock (inventory) if stock <= 0
        inventoryStatus = "Out of Stock";
      }

      // ======================================
      // INVALID EXPIRY DATE FIRST
      // ======================================
      if (hasInvalidExpiry) {
        // Mark as warning-type issue, show explicit label
        statusInfo = {
          status: "Warning",
          priority: 1,
          colorClass: "border-yellow-400",
          softClass: "bg-yellow-50 text-yellow-700",
        };
        combinedLabel = "Invalid expiry date";
        daysLeft = null; // hide wrong days value
      } else if (!hasExpiry) {
        // =====================================
        // NO EXPIRY DATE (stock-only)
        // =====================================
        if (stockZeroOrLess) {
          // Out of stock, no expiry
          statusInfo = {
            status: "Good",
            priority: 2,
            colorClass: "border-slate-300",
            softClass: "bg-slate-50 text-slate-600",
          };
          combinedLabel = "No expiry date";
        } else if (isWarningStockRange) {
          // 1–60 stock, no expiry → Warning Stocks
          statusInfo = {
            status: "Warning",
            priority: 2,
            colorClass: "border-yellow-400",
            softClass: "bg-yellow-50 text-yellow-700",
          };
          combinedLabel = "Warning Stocks";
        } else {
          // 61+ stock, no expiry → Good
          statusInfo = {
            status: "Good",
            priority: 2,
            colorClass: "border-emerald-400",
            softClass: "bg-emerald-50 text-emerald-700",
          };
          combinedLabel = "No expiry date";
        }
      } else if (daysLeft === 0) {
        // ============================
        // EXPIRED
        // ============================
        statusInfo = {
          status: "Expired",
          priority: 0,
          colorClass: "border-red-400",
          softClass: "bg-red-50 text-red-700",
        };
        combinedLabel = null;
      } else {
        // ====================================
        // FULL COMBINED RULES
        // ====================================

        // Warning Stocks + Near Expiry
        if (isWarningStockRange && isWarningDayRange) {
          statusInfo = {
            status: "Near Expiry",
            priority: 1,
            colorClass: "border-yellow-400",
            softClass: "bg-yellow-50 text-yellow-700",
          };
          combinedLabel = "Warning Stocks + Near Expiry";
        }
        // Warning Stocks only
        else if (isWarningStockRange && !isWarningDayRange) {
          statusInfo = {
            status: "Warning",
            priority: statusInfo.priority,
            colorClass: "border-yellow-400",
            softClass: "bg-yellow-50 text-yellow-700",
          };
          combinedLabel = "Warning Stocks";
        }
        // Near Expiry only (stock 61+)
        else if (!isWarningStockRange && isWarningDayRange) {
          statusInfo = {
            status: "Near Expiry",
            priority: 1,
            colorClass: "border-orange-400",
            softClass: "bg-orange-50 text-orange-700",
          };
          combinedLabel = null;
        }
        // 61–100 stock AND 61–100 days → Good
        else if (isGoodStockRange && isGoodDayRange) {
          statusInfo = {
            status: "Good",
            priority: 2,
            colorClass: "border-emerald-400",
            softClass: "bg-emerald-50 text-emerald-700",
          };
          combinedLabel = null;
        }
        // 100+ stock AND 100+ days → New Stocks
        else if (isHighStockRange && isHighDayRange) {
          statusInfo = {
            status: "New Stocks",
            priority: 3,
            colorClass: "border-sky-400",
            softClass: "bg-sky-50 text-sky-700",
          };
          combinedLabel = null;
        }
        // Extra: 100+ stock AND 61–100 days → Good
        else if (isHighStockRange && isGoodDayRange) {
          statusInfo = {
            status: "Good",
            priority: 2,
            colorClass: "border-emerald-400",
            softClass: "bg-emerald-50 text-emerald-700",
          };
          combinedLabel = null;
        }
        // Else → fallback to pure days-based classification
      }

      const isWarningStock = isWarningStockRange;
      const isNearExpiryWindow = isWarningDayRange;

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
        inventoryStatus,
        isWarningStock,
        isNearExpiryWindow,
        combinedLabel,
        hasInvalidExpiry,
      };
    });
  }, [products]);

  // ✅ Table + category overview: monitoredData (hide Out of Stock / Not Available)
  const monitoredData: EnrichedProduct[] = useMemo(
    () =>
      enrichedData.filter((p) => {
        const s = normalizeStatus(p.inventoryStatus).toLowerCase();
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

    enrichedData.forEach((item) => {
      counts[item.status]++;
    });

    const total = enrichedData.length;

    // Near Expiry + Expired = expiry-sensitive
    const expiringSoon = counts["Expired"] + counts["Near Expiry"];

    // Warning stocks = 1–60 stock
    const warningStockCount = enrichedData.filter(
      (p) => p.stock >= 1 && p.stock <= 60
    ).length;

    return {
      total,
      counts,
      expiringSoon,
      warningStockCount,
    };
  }, [enrichedData]);

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

  // ✅ CATEGORY PAGINATION: slice into pages of 6
  const totalCategoryPages = Math.max(
    1,
    Math.ceil(categorySnapshots.length / CATEGORY_PAGE_SIZE)
  );

  const visibleCategorySnapshots = useMemo(() => {
    const start = (categoryPage - 1) * CATEGORY_PAGE_SIZE;
    return categorySnapshots.slice(start, start + CATEGORY_PAGE_SIZE);
  }, [categorySnapshots, categoryPage]);

  // Reset category page if data changes
  useEffect(() => {
    setCategoryPage(1);
  }, [categorySnapshots.length]);

  /* =========================
     FILTER + SORT + TABLE PAGINATION
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

      const aVal =
        a.daysLeft === null ? Number.POSITIVE_INFINITY : a.daysLeft;
      const bVal =
        b.daysLeft === null ? Number.POSITIVE_INFINITY : b.daysLeft;
      return aVal - bVal;
    });

    return data;
  }, [monitoredData, statusFilter, categoryFilter, sortBy, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSorted.length / PAGE_SIZE)
  );

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredAndSorted.slice(start, start + PAGE_SIZE);
  }, [filteredAndSorted, page]);

  const visibleCount = paginated.length;

  // Clamp page if data shrinks
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  /* =========================
     RENDER
  ========================= */

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative p-6 md:p-8 flex flex-col gap-8 overflow-hidden bg-slate-50 min-h-full"
      onMouseMove={handleMouseMove}
    >
      {/* ---------- BACKDROP GRID + BLOBS ---------- */}
      <div className="pointer-events-none.absolute inset-0 -z-30">
        <div className="w-full h-full opacity-40 mix-blend-soft-light bg-[linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 opacity-[0.08] mix-blend-soft-light bg-[repeating-linear-gradient(to_bottom,rgba(15,23,42,0.9)_0px,rgba(15,23,42,0.9)_1px,transparent_1px,transparent_3px)]" />

        <motion.div
          className="absolute -top-16 -left-24 h-64 w-64 bg-emerald-500/28 blur-3xl"
          animate={{
            x: [0, 20, 10, -8, 0],
            y: [0, 10, 22, 8, 0],
            borderRadius: ["45%", "60%", "55%", "65%", "45%"],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[-3rem] bottom-[-5rem] h-72 w-72 bg-sky-400/26 blur-3xl"
          animate={{
            x: [0, -18, -26, -10, 0],
            y: [0, -12, -20, -6, 0],
            borderRadius: ["50%", "65%", "55%", "70%", "50%"],
          }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* ---------- CURSOR SPOTLIGHT ---------- */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background: `radial-gradient(520px at ${cursorPos.x}px ${cursorPos.y}px, rgba(34,197,94,0.28), transparent 70%)`,
        }}
      />

      {/* HEADER */}
      <div className="relative flex flex-col gap-3">
        <motion.h1
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-emerald-500 to-sky-500 bg-clip-text text-transparent"
        >
          Product Expiry Monitor
        </motion.h1>

        <p className="text-gray-500 text-sm max-w-xl">
          Central view for{" "}
          <span className="font-medium text-emerald-700">
            live expiry & stock status
          </span>
          . Track expiring items, warning stocks, and promos before they
          become losses.
        </p>

        <div className="mt-3 h-[3px] w-36 bg-gradient-to-r from-emerald-400 via-emerald-500 to-transparent rounded-full shadow-[0_0_18px_rgba(16,185,129,0.6)]" />
      </div>

      {/* MAIN CARD */}
      <div className="relative rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-[0_24px_70px_rgba(15,23,42,0.35)] px-5 py-6 flex flex-col gap-7 overflow-visible">
        {/* soft inner glow */}
        <div className="pointer-events-none absolute inset-x-10 -top-16 h-32 bg-gradient-to-b from-emerald-200/30 via-transparent to-transparent blur-2xl opacity-70" />

        {/* TABS + SUMMARY */}
        <div className="flex flex-col gap-5 relative z-10">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2">
            {(["All", ...STATUS_ORDER] as (ExpiryStatus | "All")[]).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setStatusFilter(tab);
                    setPage(1);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium border transition whitespace-nowrap ${
                    statusFilter === tab
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {tab === "All" ? "All Statuses" : tab}
                </button>
              )
            )}
          </div>

          {/* SUMMARY CARDS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-1">
            <SummaryCard
              icon={<Package className="w-6 h-6" />}
              label="Total Products"
              value={summary.total.toString()}
              accent="Includes all statuses (even out of stock)"
              color="emerald"
            />
            <SummaryCard
              icon={<ShieldAlert className="w-6 h-6" />}
              label="Expiring / Expired"
              value={summary.expiringSoon.toString()}
              accent="Products nearing expiry and expired"
              color="rose"
            />
            <SummaryCard
              icon={<AlertTriangle className="w-6 h-6" />}
              label="Warning Stocks (1–60)"
              value={summary.warningStockCount.toString()}
              accent="Low stocks, but not yet out of stock"
              color="amber"
            />
            <SummaryCard
              icon={<CheckCircle2 className="w-6 h-6" />}
              label="Good & New Stocks"
              value={(
                summary.counts["Good"] + summary.counts["New Stocks"]
              ).toString()}
              accent="Stable inventory levels"
              color="indigo"
            />
          </section>
        </div>

        {/* FILTER BAR */}
        <section className="relative z-40 rounded-2xl border border-slate-200/80 bg-slate-50/90 px-4 py-4 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-semibold uppercase tracking-wide">
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
                monitored products
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
                className="w-full h-10 border border-slate-300 rounded-lg px-4 pl-10 text-sm bg-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
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
            <div className="relative z-40">
              <Dropdown
                dismissOnClick
                className="z-50"
                renderTrigger={() => (
                  <button className="flex items-center gap-2 border border-slate-300 bg-white/90 text-slate-800 text-xs px-3.5 py-2 rounded-lg shadow-sm hover:bg-slate-50 transition">
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
            </div>

            {/* Category filter dropdown */}
            <div className="relative z-40">
              <Dropdown
                dismissOnClick
                className="z-50"
                renderTrigger={() => (
                  <button className="flex items-center gap-2 border border-slate-300 bg-white/90 text-slate-800 text-xs px-3.5 py-2 rounded-lg shadow-sm hover:bg-slate-50 transition">
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
                    setCategoryPage(1);
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
                      setCategoryPage(1);
                    }}
                  >
                    {cat}
                  </DropdownItem>
                ))}
              </Dropdown>
            </div>

            {/* Sort dropdown */}
            <div className="relative z-40">
              <Dropdown
                dismissOnClick
                className="z-50"
                renderTrigger={() => (
                  <button className="flex items-center gap-2 border border-slate-300 bg-white/90 text-slate-800 text-xs px-3.5 py-2 rounded-lg shadow-sm hover:bg-slate-50 transition">
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
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => {
                fetchProducts(true);
                setPage(1);
              }}
              className={`inline-flex items-center gap-1 ml-auto px-3 py-2 rounded-lg text-[11px] font-medium border ${
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
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start.relative z-10">
          {/* Status Overview */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" />
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Status Overview
                </p>
              </div>
              <span className="text-[11px] text-slate-500">
                {visibleCount} of {filteredAndSorted.length} monitored
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
                    ? "bg-red-500"
                    : status === "Near Expiry"
                    ? "bg-orange-500"
                    : status === "Warning"
                    ? "bg-yellow-500"
                    : status === "Good"
                    ? "bg-emerald-500"
                    : "bg-sky-500";

                const dotColor = barColor;

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

          {/* Category Overview */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white/95 p-4 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-500" />
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Category Overview
                </p>
              </div>
            </div>

            {categorySnapshots.length === 0 ? (
              <p className="text-xs text-slate-400">
                No categories found yet. Add products with categories to see the
                breakdown here.
              </p>
            ) : (
              <>
                <div className="flex flex-col divide-y divide-slate-100">
                  {visibleCategorySnapshots.map((catSnap) => {
                    const isActive = categoryFilter === catSnap.category;
                    const risky =
                      catSnap.expired + catSnap.near + catSnap.warn > 0;

                    return (
                      <button
                        key={catSnap.category}
                        type="button"
                        onClick={() => {
                          const willClear =
                            categoryFilter === catSnap.category;
                          setCategoryFilter(
                            willClear ? "All" : catSnap.category
                          );
                          setPage(1);
                          setCategoryPage(1);
                        }}
                        className={`flex w-full items-center justify-between gap-3 py-2.5 px-2 text-left.transition rounded-lg ${
                          isActive
                            ? "bg-emerald-50 border border-emerald-200 shadow-xs"
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
                                <span className="inline-flex items-center gap-1 text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full">
                                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
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

                {/* CATEGORY PAGINATION CONTROLS */}
                {/* CATEGORY PAGINATION CONTROLS - BOXED STYLE */}
{totalCategoryPages > 1 && (
  <div className="flex items-center justify-between mt-4 px-2">
    <p className="text-xs text-slate-500">
      Showing{" "}
      <span className="font-semibold text-emerald-600">
        {(categoryPage - 1) * CATEGORY_PAGE_SIZE + 1}
      </span>{" "}
      to{" "}
      <span className="font-semibold text-emerald-600">
        {Math.min(categoryPage * CATEGORY_PAGE_SIZE, categorySnapshots.length)}
      </span>{" "}
      of{" "}
      <span className="font-semibold text-slate-700">
        {categorySnapshots.length}
      </span>{" "}
      categories
    </p>

    <div className="flex items-center gap-1">

      {/* Previous */}
      <button
        onClick={() => setCategoryPage(categoryPage - 1)}
        disabled={categoryPage === 1}
        className={`
          px-3 py-1.5 text-xs border rounded-lg transition
          ${
            categoryPage === 1
              ? "text-slate-300 border-slate-200 bg-white"
              : "text-slate-600 border-slate-300 bg-white hover:bg-slate-100 hover:shadow-sm"
          }
        `}
      >
        Previous
      </button>

      {/* Page Numbers */}
      {Array.from({ length: totalCategoryPages }, (_, i) => i + 1).map((num) => (
        <button
          key={num}
          onClick={() => setCategoryPage(num)}
          className={`
            px-3 py-1.5 text-xs border rounded-lg transition
            ${
              num === categoryPage
                ? "bg-emerald-500 text-white border-emerald-600 shadow-sm"
                : "text-slate-700 border-slate-300 bg-white hover:bg-slate-100 hover:shadow-sm"
            }
          `}
        >
          {num}
        </button>
      ))}

      {/* Next */}
      <button
        onClick={() => setCategoryPage(categoryPage + 1)}
        disabled={categoryPage === totalCategoryPages}
        className={`
          px-3 py-1.5 text-xs border rounded-lg transition
          ${
            categoryPage === totalCategoryPages
              ? "text-slate-300 border-slate-200 bg-white"
              : "text-slate-600 border-slate-300 bg-white hover:bg-slate-100 hover:shadow-sm"
          }
        `}
      >
        Next
      </button>

    </div>
  </div>
)}

              </>
            )}
          </div>
        </section>

        {/* PRODUCT TABLE */}
        <div className="flex flex-col gap-3 relative z-10">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {visibleCount}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {filteredAndSorted.length}
              </span>{" "}
              products
            </p>
          </div>

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
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white/95">
                <table className="min-w-full divide-y divide-slate-200 text-[11px] sm:text-xs md:text-sm">
                  <thead className="bg-slate-50/90">
                    <tr>
                      <Th label="Product" />
                      <Th label="Category" />
                      <Th label="Stock" className="text-right" />
                      <Th label="Stock-In" />
                      <Th label="Expiry" />
                      <Th label="Days Left" className="text-right" />
                      <Th label="Expiry Status" />
                      <Th label="Inventory Status" />
                      <Th label="Actions" className="text-right" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginated.map((item) => {
                      const daysLeftLabel =
                        item.daysLeft === null
                          ? "N/A"
                          : `${item.daysLeft} day${
                              item.daysLeft === 1 ? "" : "s"
                            }`;

                      const isWarningStock = item.isWarningStock;
                      const isOutOfStock =
                        item.stock <= 0 ||
                        normalizeStatus(item.inventoryStatus) ===
                          "Out of Stock";

                      const canPromo =
                        item.daysLeft !== null &&
                        item.daysLeft > 0 &&
                        item.daysLeft <= 100;

                      const actions: {
                        label: string;
                        action: "For Promo" | "Out of Stock";
                        kind: "promo" | "danger";
                      }[] = [];

                      if (!isOutOfStock) {
                        if (canPromo) {
                          actions.push({
                            label: "Promo",
                            action: "For Promo",
                            kind: "promo",
                          });
                        }
                        actions.push({
                          label: "Out of Stock",
                          action: "Out of Stock",
                          kind: "danger",
                        });
                      } else {
                        actions.push({
                          label: "Confirm OOS",
                          action: "Out of Stock",
                          kind: "danger",
                        });
                      }

                      const getButtonClasses = (kind: "promo" | "danger") =>
                        kind === "promo"
                          ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300"
                          : "bg-red-50 hover:bg-red-100 text-red-700 border border-red-300";

                      return (
                        <tr
                          key={item.id}
                          className={`
                            cursor-pointer transition-colors border ${ROW_HIGHLIGHT[item.status]} ${item.statusColorClass}
                          `}
                          onClick={() => setSelectedProduct(item)}
                        >
                          {/* Product */}
                          <td className="px-4 py-3 align-top">
                            <div className="flex items-start gap-3">
                              <div className="hidden sm:flex w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 items-center justify-center text-xs font-semibold">
                                {item.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <p className="text-[12px] sm:text-[13px] font-semibold text-slate-900 line-clamp-2">
                                  {item.name}
                                </p>
                                {isWarningStock && !isOutOfStock && (
                                  <p className="mt-0.5 text-[11px] text-yellow-700">
                                    Warning stocks (1–60 pcs)
                                  </p>
                                )}
                                {item.hasInvalidExpiry && (
                                  <p className="mt-0.5 text-[11px] text-yellow-700">
                                    Invalid expiry date (check product setup)
                                  </p>
                                )}
                                {isOutOfStock && (
                                  <p className="mt-0.5 text-[11px] text-red-600">
                                    Out of stock
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-4 py-3 align-top text-slate-600">
                            {item.category}
                          </td>

                          {/* Stock */}
                          <td className="px-4 py-3 align-top text-right font-semibold text-slate-800">
                            {item.stock}
                          </td>

                          {/* Stock-In */}
                          <td className="px-4 py-3 align-top text-slate-600 whitespace-nowrap">
                            {item.stockInDate
                              ? dayjs(item.stockInDate).format("MMM D, YYYY")
                              : "N/A"}
                          </td>

                          {/* Expiry */}
                          <td className="px-4 py-3 align-top text-slate-600 whitespace-nowrap">
                            {item.expiryDate
                              ? dayjs(item.expiryDate).format("MMM D, YYYY")
                              : "N/A"}
                          </td>

                          {/* Days left */}
                          <td className="px-4 py-3 align-top text-right text-slate-700 whitespace-nowrap">
                            {daysLeftLabel}
                          </td>

                          {/* Expiry Status */}
                          <td className="px-4 py-3.align-top">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold ${item.statusSoftClass}`}
                            >
                              {item.status === "Expired" && "❌"}
                              {item.status === "Near Expiry" && "⏳"}
                              {item.status === "Warning" && "⚠️"}
                              {item.status === "Good" && "✅"}
                              {item.status === "New Stocks" && "🆕"}
                              <span>
                                {item.combinedLabel
                                  ? item.combinedLabel
                                  : item.status}
                              </span>
                            </span>
                          </td>

                          {/* Inventory Status */}
                          <td className="px-4 py-3 align-top">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-[10px] text-slate-600 border border-slate-200/70 whitespace-nowrap">
                              {item.inventoryStatus || "Not set"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td
                            className="px-4 py-3 align-top text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex flex-wrap justify-end gap-2">
                              {actions.map((btn) => (
                                <button
                                  key={btn.label}
                                  type="button"
                                  disabled={statusUpdatingId === item.productId}
                                  onClick={() =>
                                    handleChangeStatus(
                                      item.productId,
                                      btn.action
                                    )
                                  }
                                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold transition ${getButtonClasses(
                                    btn.kind
                                  )} ${
                                    statusUpdatingId === item.productId
                                      ? "opacity-70 cursor-wait"
                                      : "hover:shadow-sm cursor-pointer"
                                  }`}
                                >
                                  {statusUpdatingId === item.productId && (
                                    <RefreshCw className="w-3 h-3 animate-spin opacity-80" />
                                  )}
                                  <span>{btn.label}</span>
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* TABLE PAGINATION CONTROLS */}
              {/* TABLE PAGINATION CONTROLS - BOXED NUMBERS */}
{totalPages > 1 && (
  <div className="flex items-center justify-between mt-4 px-2">
    <p className="text-xs text-slate-500">
      Showing{" "}
      <span className="font-semibold text-emerald-600">
        {(page - 1) * PAGE_SIZE + 1}
      </span>{" "}
      to{" "}
      <span className="font-semibold text-emerald-600">
        {Math.min(page * PAGE_SIZE, filteredAndSorted.length)}
      </span>{" "}
      of{" "}
      <span className="font-semibold text-slate-700">
        {filteredAndSorted.length}
      </span>{" "}
      entries
    </p>

    <div className="flex items-center gap-1">

      {/* Previous */}
      <button
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
        className={`
          px-3 py-1.5 text-sm border rounded-md 
          ${
            page === 1
              ? "text-slate-300 border-slate-200"
              : "text-slate-600 border-slate-300 hover:bg-slate-100"
          }
        `}
      >
        Previous
      </button>

      {/* Page numbers */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
        <button
          key={num}
          onClick={() => setPage(num)}
          className={`
            px-3 py-1.5 text-sm border rounded-md transition 
            ${
              num === page
                ? "bg-emerald-500 text-white border-emerald-600 shadow-sm"
                : "text-slate-700 border-slate-300 hover:bg-slate-100"
            }
          `}
        >
          {num}
        </button>
      ))}

      {/* Next */}
      <button
        onClick={() => setPage(page + 1)}
        disabled={page === totalPages}
        className={`
          px-3 py-1.5 text-sm border rounded-md 
          ${
            page === totalPages
              ? "text-slate-300 border-slate-200"
              : "text-slate-600 border-slate-300 hover:bg-slate-100"
          }
        `}
      >
        Next
      </button>
    </div>
  </div>
)}

            </>
          )}
        </div>

        {/* NOTE */}
        <div className="mt-1 text-xs text-slate-500 flex items-start gap-2 bg-slate-50/90 border border-slate-200 rounded-xl px-3 py-2.5.relative z-10">
          <Info className="w-3.5 h-3.5 mt-0.5 text-emerald-500" />
          <p>
            Rules applied:{" "}
            <span className="font-semibold text-slate-700">
              0 days left = Expired;
            </span>{" "}
            <span className="font-semibold text-slate-700">
              1–60 days = Near Expiry; 61–100 days = Good; 101+ days = New
              Stocks;
            </span>{" "}
            <span className="font-semibold text-slate-700">
              1–60 stock &amp; 1–60 days = “Warning Stocks + Near Expiry”;
            </span>{" "}
            <span className="font-semibold text-slate-700">
              1–60 stock &amp; 61+ days = “Warning Stocks”;
            </span>{" "}
            <span className="font-semibold text-slate-700">
              0 stock &amp; 1–100+ days = Out of Stock (inventory);
            </span>{" "}
            <span className="font-semibold text-slate-700">
              no expiry date = stock-based status;
            </span>{" "}
            <span className="font-semibold text-slate-700">
              invalid expiry date = Warning with special label.
            </span>{" "}
          </p>
        </div>
      </div>

      {/* PRODUCT PROFILE DRAWER */}
      {selectedProduct && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="flex-1 bg-slate-900/40"
            onClick={() => setSelectedProduct(null)}
          />
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md bg-white/95 text-slate-900 shadow-2xl border-l border-slate-200 p-6 overflow-y-auto backdrop-blur-xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Product Details
                </h2>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                  <Layers className="w-3 h-3 text-emerald-500" />
                  {selectedProduct.category}
                </p>
              </div>
              <button
                className="text-slate-400 hover:text-slate-700 text-sm px-2 py-1 rounded-full border border-slate-200 bg-slate-50"
                onClick={() => setSelectedProduct(null)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <DrawerContent product={selectedProduct} />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

/* =========================
   TABLE HEADER CELL
========================= */

function Th({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={`px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide ${className}`}
    >
      {label}
    </th>
  );
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
    status,
    inventoryStatus,
    combinedLabel,
    hasInvalidExpiry,
  } = product;

  const daysLeftLabel =
    daysLeft === null ? "N/A" : `${daysLeft} day${daysLeft === 1 ? "" : "s"}`;

  const statusBadgeClass =
    status === "Expired"
      ? "bg-red-50 text-red-700 border-red-200"
      : status === "Near Expiry"
      ? "bg-orange-50 text-orange-700 border-orange-200"
      : status === "Warning"
      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
      : status === "Good"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-sky-50 text-sky-700 border-sky-200";

  return (
    <div className="flex flex-col gap-5">
      {/* HEADER BLOCK */}
      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900 line-clamp-2">
                {name}
              </p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                <Layers className="w-3 h-3 text-emerald-500" />
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
              <span>{combinedLabel ? combinedLabel : status}</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-3 text-[11px] text-slate-600">
            <div className="flex items-center gap-1">
              <Package className="w-4 h-4 text-emerald-500" />
              <span>Stock:</span>
              <span className="font-semibold text-slate-900">
                {stock}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Days left:</span>
              <span className="font-semibold text-slate-900">
                {daysLeftLabel}
              </span>
            </div>
            {hasInvalidExpiry && (
              <span className="inline-flex items-center gap-1 text-[11px] text-yellow-700">
                ⚠️ Invalid expiry / stock-in date
              </span>
            )}
          </div>
        </div>
      </div>

      {/* KEY INFO CARD */}
      <div className="border border-slate-200 rounded-xl p-4 bg-white">
        <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-3 font-semibold">
          Key Information
        </p>
        <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-600">
          <div>
            <p className="text-slate-400">Stock-In Date</p>
            <p className="font-semibold text-slate-900">
              {stockInDate
                ? dayjs(stockInDate).format("MMM D, YYYY")
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Expiry Date</p>
            <p className="font-semibold text-slate-900">
              {expiryDate ? dayjs(expiryDate).format("MMM D, YYYY") : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Days Left</p>
            <p className="font-semibold text-slate-900">{daysLeftLabel}</p>
          </div>
          <div>
            <p className="text-slate-400">Inventory Status</p>
            <p className="font-semibold text-slate-900">
              {inventoryStatus || "Not set"}
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
    emerald: "from-emerald-500 to-emerald-600",
    rose: "from-rose-500 to-rose-600",
    amber: "from-amber-500 to-amber-600",
    indigo: "from-indigo-500 to-indigo-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -4,
        scale: 1.01,
      }}
      transition={{ duration: 0.2 }}
      className={`relative p-4 rounded-xl text-white bg-gradient-to-br ${colors[color]} shadow-md overflow-hidden`}
    >
      {/* inner glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.32),transparent_55%)] opacity-80" />
      <div className="relative flex items-center gap-3">
        <div className="p-2.5 bg-white/15 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.15em] text-white/80">
            {label}
          </p>
          <p className="text-2xl font-bold leading-tight">{value}</p>
          {accent && (
            <p className="text-[11px] text-white/80 mt-1">{accent}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
