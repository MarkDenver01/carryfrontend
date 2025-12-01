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
  percentUsed: number | null; // kept for possible analytics, di na lang pinapakita sa UI
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

const PAGE_SIZE = 120;

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

  if (daysLeft <= 4) {
    return {
      status: "Warning",
      priority: 2,
      colorClass: "border-amber-300",
      softClass: "bg-amber-50 text-amber-700",
    };
  }

  if (daysLeft <= 50) {
    return {
      status: "Near Expiry",
      priority: 1,
      colorClass: "border-orange-300",
      softClass: "bg-orange-50 text-orange-700",
    };
  }

  if (daysLeft <= 90) {
    return {
      status: "Good",
      priority: 3,
      colorClass: "border-sky-200",
      softClass: "bg-sky-50 text-sky-700",
    };
  }

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

  const [page, setPage] = useState(1);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);

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
     DATA ENRICH
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
          const diff = expiry.diff(today, "day");

          // ✅ clamp negative days to 0 para walang -4, -3, etc.
          daysLeft = diff < 0 ? 0 : diff;
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

      if (stockIn && expiry && expiry.isAfter(stockIn)) {
        shelfLifeDays = expiry.diff(stockIn, "day");
        elapsedDays = today.diff(stockIn, "day");
        const safeElapsed = clamp(elapsedDays, 0, shelfLifeDays);
        percentUsed = clamp(safeElapsed / shelfLifeDays, 0, 1);
      }

      // 👉 Base classification by days left
      let statusInfo = classifyByDaysLeft(daysLeft);

      // ✅ STOCK-BASED OVERRIDE:
      //  - 30–50 stocks = Warning (as long as hindi Expired)
      if (stock >= 30 && stock <= 50 && statusInfo.status !== "Expired") {
        statusInfo = {
          status: "Warning",
          priority: 2,
          colorClass: "border-amber-300",
          softClass: "bg-amber-50 text-amber-700",
        };
      }

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
    const expiringSoon = counts["Expired"] + counts["Near Expiry"];

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
    <div className="p-6 md:p-8 flex flex-col gap-8 bg-slate-50 min-h-full">
      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Product Expiry Monitor
        </h1>
        <p className="text-sm text-slate-500 max-w-xl">
          Central view for{" "}
          <span className="font-semibold text-emerald-600">
            live expiry & stock status
          </span>{" "}
          of all products. Filter by status, category, and stock levels to
          avoid losses and plan promos.
        </p>
      </div>

      {/* MAIN CARD */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-5 py-6 flex flex-col gap-7">
        {/* TABS + SUMMARY */}
        <div className="flex flex-col gap-5">
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
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {tab === "All" ? "All Statuses" : tab}
                </button>
              )
            )}
          </div>

          {/* SUMMARY CARDS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              icon={<Package className="w-6 h-6" />}
              label="Total Products"
              value={summary.total.toString()}
              accent=""
              color="emerald"
            />
            <SummaryCard
              icon={<ShieldAlert className="w-6 h-6" />}
              label="Expiring / Expired"
              value={summary.expiringSoon.toString()}
              accent=""
              color="rose"
            />
            <SummaryCard
              icon={<AlertTriangle className="w-6 h-6" />}
              label="Warning Stocks (30–50)"
              value={summary.warningStockCount.toString()}
              accent=""
              color="amber"
            />
            <SummaryCard
              icon={<CheckCircle2 className="w-6 h-6" />}
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
        <section className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 flex flex-col gap-4">
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
                className="w-full h-10 border border-slate-300 rounded-lg px-4 pl-10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
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
                <button className="flex items-center gap-2 border border-slate-300 bg-white text-slate-800 text-xs px-3.5 py-2 rounded-lg shadow-sm hover:bg-slate-50 transition">
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
                <button className="flex items-center gap-2 border border-slate-300 bg-white text-slate-800 text-xs px-3.5 py-2 rounded-lg shadow-sm hover:bg-slate-50 transition">
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
                <button className="flex items-center gap-2 border border-slate-300 bg-white text-slate-800 text-xs px-3.5 py-2 rounded-lg shadow-sm hover:bg-slate-50 transition">
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

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => fetchProducts(true)}
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
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          {/* Status Overview */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2 mb-1">
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
                    ? "bg-red-500"
                    : status === "Near Expiry"
                    ? "bg-orange-500"
                    : status === "Warning"
                    ? "bg-amber-500"
                    : status === "Good"
                    ? "bg-sky-500"
                    : "bg-emerald-500";

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
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-500" />
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Category Overview
                </p>
              </div>
              <p className="text-[11px] text-slate-400">
                Click a row to filter products by category
              </p>
            </div>

            {categorySnapshots.length === 0 ? (
              <p className="text-xs text-slate-400">
                No categories found yet. Add products with categories to see the
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
                      className={`flex w-full items-center justify-between gap-3 py-2.5 px-2 text-left transition rounded-lg ${
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

        {/* PRODUCT TABLE */}
        <div className="flex flex-col gap-3">
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
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col items-center justify-center gap-2">
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
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-xs md:text-sm bg-white">
                  <thead className="bg-slate-50">
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

                      const isWarningStock =
                        item.stock >= 30 && item.stock <= 50;
                      const isOutOfStock =
                        item.stock <= 0 ||
                        normalizeStatus(item.backendStatus) === "Out of Stock";

                      // ✅ Promo dapat lang sa malapit mag-expire (1–90 days)
                      const canPromo =
                        item.daysLeft !== null &&
                        item.daysLeft > 0 &&
                        item.daysLeft <= 90;

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
                          className="hover:bg-slate-50 cursor-pointer"
                          onClick={() => setSelectedProduct(item)}
                        >
                          {/* Product */}
                          <td className="px-4 py-3 align-top">
                            <div className="flex items-start gap-3">
                              <div className="hidden sm:flex w-8 h-8 rounded-full bg-slate-100 text-slate-700 items-center justify-center text-xs font-semibold">
                                {item.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-[13px] font-semibold text-slate-900 line-clamp-2">
                                  {item.name}
                                </p>
                                {isWarningStock && !isOutOfStock && (
                                  <p className="mt-0.5 text-[11px] text-amber-600">
                                    Warning stocks (30–50)
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
                          <td className="px-4 py-3 align-top text-slate-600">
                            {item.stockInDate
                              ? dayjs(item.stockInDate).format("MMM D, YYYY")
                              : "N/A"}
                          </td>

                          {/* Expiry */}
                          <td className="px-4 py-3 align-top text-slate-600">
                            {item.expiryDate
                              ? dayjs(item.expiryDate).format("MMM D, YYYY")
                              : "N/A"}
                          </td>

                          {/* Days left */}
                          <td className="px-4 py-3 align-top text-right text-slate-700">
                            {daysLeftLabel}
                          </td>

                          {/* Expiry Status */}
                          <td className="px-4 py-3 align-top">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${item.statusSoftClass}`}
                            >
                              {item.status === "Expired" && "❌"}
                              {item.status === "Near Expiry" && "⏳"}
                              {item.status === "Warning" && "⚠️"}
                              {item.status === "Good" && "✅"}
                              {item.status === "New Stocks" && "🆕"}
                              <span>{item.status}</span>
                            </span>
                          </td>

                          {/* Inventory Status */}
                          <td className="px-4 py-3 align-top">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-600 border border-slate-200/70">
                              {item.backendStatus || "Not set"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td
                            className="px-4 py-3 align-top text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex flex-wrap justify-end gap-1.5">
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
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 transition ${getButtonClasses(
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

              {canLoadMore && (
                <div className="flex justify-center mt-3">
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    className="px-4 py-2 rounded-full text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 shadow-sm flex items-center gap-2"
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
        <div className="mt-1 text-xs text-slate-500 flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
          <Info className="w-3.5 h-3.5 mt-0.5 text-emerald-500" />
          <p>
            Expiry status is based on{" "}
            <span className="font-semibold text-slate-700">Expiry Date</span>{" "}
            relative to today. Warning stocks (30–50 pcs) in{" "}
            <span className="font-semibold text-slate-700">
              Warning / Near Expiry
            </span>{" "}
            are also monitored for replenishment and promo planning.
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
            className="w-full max-w-md bg-white text-slate-900 shadow-xl border-l border-slate-200 p-6 overflow-y-auto"
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
    </div>
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
    backendStatus,
  } = product;

  const daysLeftLabel =
    daysLeft === null ? "N/A" : `${daysLeft} day${daysLeft === 1 ? "" : "s"}`;

  const statusBadgeClass =
    status === "Expired"
      ? "bg-red-50 text-red-700 border-red-200"
      : status === "Near Expiry"
      ? "bg-orange-50 text-orange-700 border-orange-200"
      : status === "Warning"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : status === "Good"
      ? "bg-sky-50 text-sky-700 border-sky-200"
      : "bg-emerald-50 text-emerald-700 border-emerald-200";

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
              <span>{status}</span>
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
              {backendStatus || "Not set"}
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
      className={`relative p-4 rounded-xl text-white bg-gradient-to-br ${colors[color]} shadow-sm`}
    >
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
