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
  Bell,
  BellRing,
} from "lucide-react";

import { getAllProducts } from "../../../libs/ApiGatewayDatasource";
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
  // from backend
  productId: number;
  productStatus: string | null;

  // display
  id: string;
  name: string;
  category: string;
  stock: number;
  stockInDate: string | null;
  expiryDate: string | null;

  // computed
  daysLeft: number | null;
  shelfLifeDays: number | null;
  elapsedDays: number | null;
  percentUsed: number | null; // 0–1+

  status: ExpiryStatus;
  statusPriority: number;
  statusColorClass: string;
  statusSoftClass: string;
}

const STATUS_ORDER: ExpiryStatus[] = [
  "Expired",
  "Near Expiry",
  "Warning",
  "Good",
  "New Stocks",
];

const PAGE_SIZE = 120;

const clamp = (val: number, min: number, max: number) =>
  Math.min(max, Math.max(min, val));

/**
 * Expiry classification (DATE-BASED, then refine)
 *
 * Rules:
 *  - daysLeft < 0     → Expired
 *  - 0–2 days         → Near Expiry
 *  - 3–7 days         → Warning
 *  - > 7 days         → Good / New Stocks (based on usage)
 */
const classifyByShelfLife = (
  percentUsed: number | null,
  daysLeft: number | null
): {
  status: ExpiryStatus;
  priority: number;
  colorClass: string;
  softClass: string;
} => {
  // Walang date → treat as Good (para hindi mawala sa report)
  if (daysLeft === null) {
    return {
      status: "Good",
      priority: 3,
      colorClass: "border-sky-200",
      softClass: "bg-sky-50 text-sky-700",
    };
  }

  // Expired
  if (daysLeft < 0) {
    return {
      status: "Expired",
      priority: 0,
      colorClass: "border-red-300",
      softClass: "bg-red-50 text-red-700",
    };
  }

  // Near Expiry: 0–2 days left
  if (daysLeft <= 2) {
    return {
      status: "Near Expiry",
      priority: 1,
      colorClass: "border-orange-300",
      softClass: "bg-orange-50 text-orange-700",
    };
  }

  // Warning: 3–7 days left
  if (daysLeft <= 7) {
    return {
      status: "Warning",
      priority: 2,
      colorClass: "border-amber-300",
      softClass: "bg-amber-50 text-amber-700",
    };
  }

  // > 7 days left → Good or New Stocks (using percentUsed kung meron)
  if (percentUsed === null) {
    return {
      status: "Good",
      priority: 3,
      colorClass: "border-sky-200",
      softClass: "bg-sky-50 text-sky-700",
    };
  }

  if (percentUsed < 0.2) {
    return {
      status: "New Stocks",
      priority: 4,
      colorClass: "border-emerald-300",
      softClass: "bg-emerald-50 text-emerald-700",
    };
  }

  return {
    status: "Good",
    priority: 3,
    colorClass: "border-sky-200",
    softClass: "bg-sky-50 text-sky-700",
  };
};

/* Toast types for auto alerts */
type ToastLevel = "info" | "warning" | "danger";

interface ToastState {
  visible: boolean;
  title: string;
  message: string;
  level: ToastLevel;
}

/* =========================
   BACKEND HELPERS
========================= */

/**
 * Calls backend to update productStatus
 * PATCH /admin/api/product/{productId}/update_status
 * body: { productStatus: string }
 */
async function updateProductStatusApi(
  productId: number,
  newStatus: string
): Promise<void> {
  const res = await fetch(
    `/admin/api/product/${productId}/update_status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productStatus: newStatus }),
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to update status (${res.status})`);
  }
}

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

  const [page, setPage] = useState(1);

  const [updatingProductId, setUpdatingProductId] = useState<number | null>(
    null
  );

  // 🔔 Toast auto-alert state
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    title: "",
    message: "",
    level: "info",
  });
  const [hasShownInitialToast, setHasShownInitialToast] = useState(false);

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
      setHasShownInitialToast(false);
    } catch (err) {
      console.error("Failed to load products", err);
      setToast({
        visible: true,
        title: "Error",
        message: "Failed to load products from server.",
        level: "danger",
      });
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
    const today = dayjs().startOf("day");

    return products.map((p, index) => {
      const name = p.productName;
      const category = p.categoryName ?? "Uncategorized";
      const stock = (p as any).stocks ?? 0;

      // IMPORTANT: backend field is productInDate
      const stockInDateStr =
        (p as any).productInDate ?? (p as any).stockInDate ?? null;
      const expiryDateStr = (p as any).expiryDate ?? null;

      let daysLeft: number | null = null;
      let shelfLifeDays: number | null = null;
      let elapsedDays: number | null = null;
      let percentUsed: number | null = null;

      if (stockInDateStr && expiryDateStr) {
        const stockIn = dayjs(stockInDateStr);
        const expiry = dayjs(expiryDateStr);

        if (stockIn.isValid() && expiry.isValid()) {
          const stockInDay = stockIn.startOf("day");
          const expiryDay = expiry.startOf("day");

          // daysLeft: expiry - today (can be negative)
          daysLeft = expiryDay.diff(today, "day");

          // total shelf life
          const diffShelf = expiryDay.diff(stockInDay, "day");
          shelfLifeDays = Math.max(diffShelf, 0);

          // elapsed since stock in
          const diffElapsed = today.diff(stockInDay, "day");
          elapsedDays = Math.max(diffElapsed, 0);

          // percent used (only meaningful if shelfLifeDays > 0)
          if (shelfLifeDays > 0) {
            percentUsed = clamp(elapsedDays / shelfLifeDays, 0, 1.5);
          } else {
            // same day expiry or invalid shelf life → if past, treat as >100%
            percentUsed = daysLeft < 0 ? 1.5 : 0;
          }
        }
      }

      const statusInfo = classifyByShelfLife(percentUsed, daysLeft);

      return {
        productId: p.productId!,
        productStatus: p.productStatus ?? null,

        id: `${p.productId}-${index}`,
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
      };
    });
  }, [products]);

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

  const categorySnapshots = useMemo(
    () =>
      uniqueCategories.map((cat) => {
        const items = enrichedData.filter((p) => p.category === cat);

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
    [enrichedData, uniqueCategories]
  );

  /* =========================
     AUTO ALERT (TOAST)
  ========================= */

  useEffect(() => {
    if (loadingProducts) return;
    if (hasShownInitialToast) return;

    const expired = summary.counts["Expired"];
    const near = summary.counts["Near Expiry"];
    const warning = summary.counts["Warning"];

    if (expired === 0 && near === 0 && warning === 0) return;

    let level: ToastLevel = "info";
    if (expired > 0) level = "danger";
    else if (near > 0 || warning > 0) level = "warning";

    const parts: string[] = [];
    if (expired > 0) parts.push(`${expired} expired`);
    if (near > 0) parts.push(`${near} near expiry`);
    if (warning > 0) parts.push(`${warning} warning`);

    const message = `Detected ${parts.join(", ")} product${
      expired + near + warning > 1 ? "s" : ""
    }. Review expiry list.`;

    setToast({
      visible: true,
      title: "Expiry Alert",
      message,
      level,
    });
    setHasShownInitialToast(true);
  }, [summary, loadingProducts, hasShownInitialToast]);

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

  const paginated = useMemo(
    () => filteredAndSorted.slice(0, page * PAGE_SIZE),
    [filteredAndSorted, page]
  );

  const visibleCount = paginated.length;
  const canLoadMore = visibleCount < filteredAndSorted.length;

  /* =========================
     ACTION HANDLER (BACKEND)
  ========================= */

  const handleUpdateStatus = async (
    enriched: EnrichedProduct,
    newStatus: "Unavailable" | "For Promo" | "Available"
  ) => {
    try {
      setUpdatingProductId(enriched.productId);
      await updateProductStatusApi(enriched.productId, newStatus);

      // update local ProductDTO list
      setProducts((prev) =>
        prev.map((p) =>
          p.productId === enriched.productId
            ? { ...p, productStatus: newStatus }
            : p
        )
      );

      // update selected drawer product status for UI consistency
      setSelectedProduct((prev) =>
        prev && prev.productId === enriched.productId
          ? { ...prev, productStatus: newStatus }
          : prev
      );

      setToast({
        visible: true,
        title: "Status Updated",
        message: `Product marked as "${newStatus}".`,
        level: "info",
      });
    } catch (e) {
      console.error(e);
      setToast({
        visible: true,
        title: "Update Failed",
        message: "Could not update product status. Please try again.",
        level: "danger",
      });
    } finally {
      setUpdatingProductId(null);
    }
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <>
      {/* 🔔 AUTO-ALERT TOAST */}
      {toast.visible && (
        <div className="fixed bottom-4 right-4 z-50">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            className={`flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-md
              ${
                toast.level === "danger"
                  ? "bg-red-50/90 border-red-300"
                  : toast.level === "warning"
                  ? "bg-amber-50/90 border-amber-300"
                  : "bg-emerald-50/90 border-emerald-300"
              }`}
          >
            <div className="mt-0.5">
              {toast.level === "danger" ? (
                <BellRing className="w-5 h-5 text-red-500" />
              ) : toast.level === "warning" ? (
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              ) : (
                <Bell className="w-5 h-5 text-emerald-500" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-800">
                {toast.title}
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() =>
                setToast((prev) => ({
                  ...prev,
                  visible: false,
                }))
              }
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative p-6 md:p-8 flex flex-col gap-8 overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {/* Background / grid */}
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

        {/* Spotlight */}
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

        {/* TOP ALERT PANEL */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-red-700">
                Expired Stocks
              </p>
              <p className="text-sm font-bold text-red-700">
                {summary.counts["Expired"]} item
                {summary.counts["Expired"] !== 1 ? "s" : ""}
              </p>
              <p className="text-[11px] text-red-600/80">
                Remove from inventory and record wastage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-amber-700">
                Near Expiry / Warning
              </p>
              <p className="text-sm font-bold text-amber-700">
                {summary.counts["Near Expiry"] + summary.counts["Warning"]} item
                {summary.counts["Near Expiry"] + summary.counts["Warning"] !==
                1
                  ? "s"
                  : ""}
              </p>
              <p className="text-[11px] text-amber-600/80">
                Prioritize promos, bundles, or markdowns.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-emerald-700">
                Healthy / Fresh
              </p>
              <p className="text-sm font-bold text-emerald-700">
                {summary.counts["Good"] + summary.counts["New Stocks"]} item
                {summary.counts["Good"] + summary.counts["New Stocks"] !== 1
                  ? "s"
                  : ""}
              </p>
              <p className="text-[11px] text-emerald-600/80">
                Ideal for standard pricing and upsell combos.
              </p>
            </div>
          </div>
        </section>

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

            {/* TABS + SUMMARY */}
            <div className="flex flex-col gap-6">
              {/* Status tabs */}
              <div className="flex flex-wrap gap-3 overflow-x-auto pb-1">
                {(["All", ...STATUS_ORDER] as (ExpiryStatus | "All")[]).map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setStatusFilter(tab);
                        setPage(1);
                      }}
                      className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border transition whitespace-nowrap
                      ${
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
                  label="Warning Stocks"
                  value={summary.counts["Warning"].toString()}
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

              {/* Dropdown row + refresh */}
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

                {/* Refresh */}
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
              {/* Status overview */}
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

              {/* Category overview */}
              <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white/90 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-500" />
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                      Category Overview
                    </p>
                  </div>
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

            {/* PRODUCT LIST */}
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
                            <span className="text-lg">{statusIcon}</span>
                            <h2
                              className={`text-sm font-semibold uppercase tracking-wide ${headerColor}`}
                            >
                              {status}{" "}
                              <span className="text-xs text-slate-400 ml-1 normal-case font-normal">
                                ({groupItems.length} item
                                {groupItems.length > 1 ? "s" : ""})
                              </span>
                            </h2>
                          </div>
                          {minDays !== null && status !== "Expired" && (
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
                  })}

                  {/* LOAD MORE */}
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
                Expiry status is based on the time between{" "}
                <span className="font-semibold text-slate-700">
                  Stock-In Date
                </span>{" "}
                and{" "}
                <span className="font-semibold text-slate-700">
                  Expiry Date
                </span>
                . Products marked{" "}
                <span className="font-semibold text-red-500">Expired</span> or{" "}
                <span className="font-semibold text-orange-500">
                  Near Expiry
                </span>{" "}
                should be prioritized for removal or promotions.
              </p>
            </div>
          </div>
        </motion.div>

        {/* DRAWER */}
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
              {/* neon bg */}
              <div className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.45),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.45),transparent_55%)]" />

              <div className="relative z-10">
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

                <DrawerContent
                  product={selectedProduct}
                  updating={updatingProductId === selectedProduct.productId}
                  onUpdateStatus={(status) =>
                    handleUpdateStatus(selectedProduct, status)
                  }
                />
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </>
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
              {stockInDate ? dayjs(stockInDate).format("MMM D, YYYY") : "N/A"}
            </p>
          </div>
          <div>
            <p className="uppercase tracking-wide text-[10px] text-slate-400">
              Expiry
            </p>
            <p className="font-semibold text-slate-800">
              {expiryDate ? dayjs(expiryDate).format("MMM D, YYYY") : "N/A"}
            </p>
          </div>
        </div>

        {/* Days left */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Days left:</span>
            <span className="font-semibold text-slate-800">
              {daysLeftLabel}
            </span>
          </span>
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

  if (p.stock > 50 && (p.status === "Warning" || p.status === "Near Expiry")) {
    tags.push("High stock risk");
  }

  if (p.stock <= 5 && p.status !== "Expired") {
    tags.push("Low stock");
  }

  if (p.percentUsed !== null && p.percentUsed < 0.25 && p.daysLeft !== null && p.daysLeft > 7) {
    tags.push("Very fresh");
  }

  return tags;
}

/* =========================
   DRAWER CONTENT + ACTIONS
========================= */

function DrawerContent({
  product,
  updating,
  onUpdateStatus,
}: {
  product: EnrichedProduct;
  updating: boolean;
  onUpdateStatus: (status: "Unavailable" | "For Promo" | "Available") => void;
}) {
  const {
    name,
    category,
    stock,
    stockInDate,
    expiryDate,
    daysLeft,
    status,
    productStatus,
  } = product;

  const daysLeftLabel =
    daysLeft === null ? "N/A" : `${daysLeft} day${daysLeft === 1 ? "" : "s"}`;

  const freshnessLabel = (() => {
    if (daysLeft === null) return "Not computed";
    if (daysLeft < 0) return "Expired";
    if (daysLeft <= 2) return "Expiring any moment";
    if (daysLeft <= 7) return "Very short shelf life";
    if (daysLeft <= 30) return "Healthy shelf window";
    return "Long shelf life";
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

  const invStatus = (productStatus ?? "").toLowerCase();

  const isUnavailable = invStatus === "unavailable";
  const isForPromo = invStatus === "for promo";
  const isAvailable = invStatus === "available";

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
              <span className="font-semibold text-slate-50">{stock}</span>
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
              {stockInDate ? dayjs(stockInDate).format("MMM D, YYYY") : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Expiry Date</p>
            <p className="font-semibold text-slate-50">
              {expiryDate ? dayjs(expiryDate).format("MMM D, YYYY") : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Days Left</p>
            <p className="font-semibold text-slate-50">{daysLeftLabel}</p>
          </div>
          <div>
            <p className="text-slate-400">Freshness</p>
            <p className="font-semibold text-slate-50">{freshnessLabel}</p>
          </div>
        </div>
      </div>

      {/* INVENTORY STATUS + ACTIONS */}
      <div className="border border-emerald-500/40 rounded-xl p-4 bg-slate-900/80">
        <p className="text-[11px] uppercase tracking-wide text-emerald-300 mb-2 font-semibold">
          Inventory Actions
        </p>

        <p className="text-[11px] text-slate-300 mb-2">
          Current status:{" "}
          <span className="font-semibold text-emerald-300">
            {productStatus ?? "Not set"}
          </span>
        </p>

        <div className="flex flex-wrap gap-2 mt-2">
          <button
            type="button"
            disabled={updating || isUnavailable}
            onClick={() => onUpdateStatus("Unavailable")}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border flex items-center gap-1
              ${
                isUnavailable
                  ? "border-slate-600 bg-slate-800 text-slate-400 cursor-default"
                  : "border-red-400/70 text-red-200 hover:bg-red-500/10"
              } ${updating ? "opacity-60 cursor-wait" : ""}`}
          >
            {updating && isUnavailable ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              "⛔"
            )}
            Out of Stock (Unavailable)
          </button>

          <button
            type="button"
            disabled={updating || isForPromo}
            onClick={() => onUpdateStatus("For Promo")}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border flex items-center gap-1
              ${
                isForPromo
                  ? "border-slate-600 bg-slate-800 text-slate-400 cursor-default"
                  : "border-amber-400/70 text-amber-200 hover:bg-amber-500/10"
              } ${updating ? "opacity-60 cursor-wait" : ""}`}
          >
            {updating && isForPromo ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              "🏷️"
            )}
            Mark For Promo
          </button>

          <button
            type="button"
            disabled={updating || isAvailable}
            onClick={() => onUpdateStatus("Available")}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border flex items-center gap-1
              ${
                isAvailable
                  ? "border-slate-600 bg-slate-800 text-slate-400 cursor-default"
                  : "border-emerald-400/70 text-emerald-200 hover:bg-emerald-500/10"
              } ${updating ? "opacity-60 cursor-wait" : ""}`}
          >
            {updating && isAvailable ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              "✅"
            )}
            Restock / Available
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   SUMMARY CARD
========================= */

type SummaryColor = "emerald" | "rose" | "amber" | "indigo";

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
  color: SummaryColor;
}) {
  const colors: Record<SummaryColor, string> = {
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
