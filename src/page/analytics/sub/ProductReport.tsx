import React, { useEffect, useMemo, useState } from "react";
import { Dropdown, DropdownItem } from "flowbite-react";
import {
  ChevronDown,
  Sun,
  Moon,
  AlertTriangle,
  AlertCircle,
  Leaf,
  Clock,
  BarChart2,
  Grid3X3,
  Filter,
  RefreshCcw,
  X,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);


import ProductLegendLayout from "../../../layout/product/ProductLegendLayout";
import { getAllProducts } from "../../../libs/ApiGatewayDatasource";
import type { ProductDTO } from "../../../libs/models/product/Product";

// =================== CHARTJS REGISTER ===================
ChartJS.register(
  ArcElement,
  ChartTooltip,
  ChartLegend,
  CategoryScale,
  LinearScale,
  BarElement
);

// =================== TYPES & CONSTANTS ===================

type SortOption = "Urgency" | "Name" | "Category" | "Stock" | "DaysLeft";

type ExpiryStatus =
  | "New Stocks"
  | "Good"
  | "Warning"
  | "Near Expiry"
  | "Expired"
  | "No Expiry";

interface EnrichedProduct {
  id: string; // derived key
  name: string;
  category: string;
  stock: number;
  stockInDate: string | null;
  expiryDate: string | null;

  // computed
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

// ordering for sections
const STATUS_ORDER: ExpiryStatus[] = [
  "Expired",
  "Near Expiry",
  "Warning",
  "Good",
  "New Stocks",
  "No Expiry",
];

// helper
const clamp = (val: number, min: number, max: number) =>
  Math.min(max, Math.max(min, val));

// =================== STATUS CLASSIFICATION ===================

const classifyByShelfLife = (
  percentUsed: number | null,
  daysLeft: number | null
): {
  status: ExpiryStatus;
  priority: number; // lower = more urgent
  colorClass: string;
  softClass: string;
  description: string;
} => {
  // invalid data
  if (percentUsed === null || daysLeft === null) {
    return {
      status: "No Expiry",
      priority: 5,
      colorClass: "border-slate-300",
      softClass: "bg-slate-100 text-slate-700",
      description:
        "No valid expiry information recorded for this item (dry goods / non-perishable or incomplete data).",
    };
  }

  // expired always wins
  if (daysLeft <= 0 || percentUsed >= 1) {
    return {
      status: "Expired",
      priority: 0,
      colorClass: "border-red-500",
      softClass: "bg-red-100 text-red-700",
      description:
        "This item has already reached or passed its expiry date and should be removed from active inventory.",
    };
  }

  if (percentUsed >= 0.75) {
    return {
      status: "Near Expiry",
      priority: 1,
      colorClass: "border-orange-500",
      softClass: "bg-orange-100 text-orange-700",
      description:
        "This item is very close to its expiry date (above 75% of its shelf-life consumed). Prioritize selling or discounting.",
    };
  }

  if (percentUsed >= 0.5) {
    return {
      status: "Warning",
      priority: 2,
      colorClass: "border-amber-400",
      softClass: "bg-amber-100 text-amber-700",
      description:
        "This item has consumed over half of its shelf-life. Monitor closely and plan future promotions.",
    };
  }

  if (percentUsed >= 0.25) {
    return {
      status: "Good",
      priority: 3,
      colorClass: "border-sky-400",
      softClass: "bg-sky-100 text-sky-700",
      description:
        "This item is within a healthy shelf window and is safe to keep in standard rotation.",
    };
  }

  // < 25%
  return {
    status: "New Stocks",
    priority: 4,
    colorClass: "border-emerald-500",
    softClass: "bg-emerald-100 text-emerald-700",
    description:
      "Newly stocked item with most of its shelf-life remaining. Ideal for future selling periods.",
  };
};

// =================== MAIN COMPONENT ===================

export default function ProductReport() {
  const [darkMode, setDarkMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const [statusFilter, setStatusFilter] = useState<ExpiryStatus | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<SortOption>("Urgency");
  const [search, setSearch] = useState("");

  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState<EnrichedProduct | null>(
    null
  );

  // fetch products (UI lang, API call unchanged)
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await getAllProducts();
      setProducts(data ?? []);
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // auto-refresh every 60s if enabled (UI option lang)
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      fetchProducts();
    }, 60000);
    return () => clearInterval(id);
  }, [autoRefresh]);

  // map to enriched data (UI-side compute lang)
  const enrichedData: EnrichedProduct[] = useMemo(() => {
    const today = dayjs();
    return products.map((p, index) => {
      const name = p.productName;
      const category = p.categoryName ?? "Uncategorized";
      const stock = p.stocks ?? 0;

      // UI-safe access: hindi natin binabago ProductDTO definition
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
          // shelf-life in days
          shelfLifeDays = expiry.diff(stockIn, "day");
          // elapsed days since stock-in
          elapsedDays = today.diff(stockIn, "day");
          // use hour-based diff for daysLeft (round up)
          const diffHours = expiry.diff(today, "hour");
          daysLeft = Math.ceil(diffHours / 24);
          // clamp elapsed to [0, shelfLife]
          const safeElapsed = clamp(elapsedDays, 0, shelfLifeDays);
          percentUsed = clamp(safeElapsed / shelfLifeDays, 0, 1.5); // allow slight overshoot
        } else {
          // invalid relation
          daysLeft = null;
          shelfLifeDays = null;
          elapsedDays = null;
          percentUsed = null;
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

  // unique categories
  const uniqueCategories = useMemo(
    () =>
      Array.from(new Set(enrichedData.map((p) => p.category)))
        .filter((c) => !!c)
        .sort(),
    [enrichedData]
  );

  // summary metrics
  const summary = useMemo(() => {
    const counts: Record<ExpiryStatus, number> = {
      "New Stocks": 0,
      Good: 0,
      Warning: 0,
      "Near Expiry": 0,
      Expired: 0,
      "No Expiry": 0,
    };

    enrichedData.forEach((item) => {
      counts[item.status]++;
    });

    const total = enrichedData.length;
    return { total, counts };
  }, [enrichedData]);

  // chart data (status distribution)
  const doughnutData = useMemo(() => {
    const { counts } = summary;
    return {
      labels: [
        "Expired",
        "Near Expiry",
        "Warning",
        "Good",
        "New Stocks",
        "No Expiry",
      ],
      datasets: [
        {
          data: [
            counts["Expired"],
            counts["Near Expiry"],
            counts["Warning"],
            counts["Good"],
            counts["New Stocks"],
            counts["No Expiry"],
          ],
          backgroundColor: [
            "#ef4444", // red
            "#fb923c", // orange
            "#facc15", // yellow
            "#38bdf8", // sky
            "#22c55e", // green
            "#9ca3af", // gray
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [summary]);

  // bar data: expiries in next 30 days
  const barData = useMemo(() => {
    const daysRange = 30;
    const buckets = new Array(daysRange).fill(0) as number[];

    enrichedData.forEach((item) => {
      if (item.daysLeft === null) return;
      if (item.daysLeft < 0 || item.daysLeft >= daysRange) return;
      buckets[item.daysLeft] += 1;
    });

    return {
      labels: buckets.map((_, idx) => (idx === 0 ? "Today" : `${idx}d`)),
      datasets: [
        {
          label: "Items Expiring",
          data: buckets,
          backgroundColor: "#22c55e",
        },
      ],
    };
  }, [enrichedData]);

  // heatmap data (next 14 days)
  const heatmapDays = useMemo(() => {
    const range = 14;
    const arr: { label: string; count: number; date: string }[] = [];
    const today = dayjs();

    for (let i = 0; i < range; i++) {
      const date = today.add(i, "day");
      let count = 0;
      enrichedData.forEach((item) => {
        if (!item.expiryDate) return;
        const exp = dayjs(item.expiryDate);
        if (exp.isSame(date, "day")) count++;
      });

      arr.push({
        label: date.format("MMM D"),
        count,
        date: date.toISOString(),
      });
    }
    return arr;
  }, [enrichedData]);

  const maxHeatCount = useMemo(
    () => heatmapDays.reduce((m, d) => Math.max(m, d.count), 0),
    [heatmapDays]
  );

  const getHeatColor = (count: number) => {
    if (count === 0) return "bg-slate-100 text-slate-400";
    if (maxHeatCount === 0) return "bg-slate-100 text-slate-400";
    const intensity = count / maxHeatCount;
    if (intensity > 0.75) return "bg-red-500 text-white";
    if (intensity > 0.5) return "bg-orange-400 text-white";
    if (intensity > 0.25) return "bg-amber-300 text-slate-800";
    return "bg-emerald-200 text-emerald-900";
  };

  // global filtered & sorted products
  const filteredAndSorted = useMemo(() => {
    let data = enrichedData;

    // status filter
    if (statusFilter !== "All") {
      data = data.filter((item) => item.status === statusFilter);
    }

    // category filter
    if (categoryFilter !== "All") {
      data = data.filter((item) => item.category === categoryFilter);
    }

    // search filter
    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(s) ||
          item.category.toLowerCase().includes(s)
      );
    }

    // sort
    data = [...data].sort((a, b) => {
      if (sortBy === "Urgency") {
        // by status priority then daysLeft
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
  }, [enrichedData, statusFilter, categoryFilter, sortBy, search]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const containerBg = darkMode ? "bg-slate-950" : "bg-slate-50";
  const containerText = darkMode ? "text-slate-50" : "text-slate-900";
  const cardBg = darkMode ? "bg-slate-900/80" : "bg-white";
  const cardBorder = darkMode ? "border-slate-700" : "border-slate-200";

  return (
    <div className={darkMode ? "dark" : ""}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        onMouseMove={handleMouseMove}
        className={`relative p-6 md:p-8 flex flex-col gap-8 overflow-hidden min-h-screen ${containerBg} ${containerText}`}
      >
        {/* SPOTLIGHT BACKGROUND */}
        <motion.div
          className="pointer-events-none absolute inset-0 -z-20"
          style={{
            background: `radial-gradient(520px at ${cursorPos.x}px ${cursorPos.y}px, rgba(16,185,129,0.22), transparent 70%)`,
          }}
          animate={{ opacity: [0.85, 1, 0.9] }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        {/* HEADER BAR */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 via-sky-400 to-green-600 bg-clip-text text-transparent"
            >
              Expiry Radar Dashboard
            </motion.h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Card-based overview of product shelf-life, expiry risks, and stock
              health — all in a single page, with status-driven grouping.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto refresh */}
            <button
              onClick={() => setAutoRefresh((prev) => !prev)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
                autoRefresh
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-300 bg-slate-100 text-slate-600"
              }`}
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Auto-refresh 60s
            </button>

            {/* Dark mode */}
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {darkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-300" />
                  Light
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-sky-500" />
                  Dark
                </>
              )}
            </button>
          </div>
        </div>

        {/* TOP CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Doughnut */}
          <div
            className={`col-span-1 rounded-2xl border ${cardBorder} ${cardBg} shadow-sm p-4 flex flex-col`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-400" />
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Status Distribution
                </p>
              </div>
              <span className="text-[11px] text-slate-400">
                Total: {summary.total}
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <Doughnut
                data={doughnutData}
                options={{
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: {
                        color: darkMode ? "#e2e8f0" : "#0f172a",
                        boxWidth: 10,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Bar chart */}
          <div
            className={`col-span-2 rounded-2xl border ${cardBorder} ${cardBg} shadow-sm p-4 flex flex-col`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Expiries in Next 30 Days
                </p>
              </div>
              <span className="text-[11px] text-slate-400">
                Focus on upcoming risks
              </span>
            </div>
            <div className="h-48">
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    x: {
                      ticks: {
                        color: darkMode ? "#cbd5f5" : "#0f172a",
                        maxRotation: 0,
                        minRotation: 0,
                      },
                      grid: { display: false },
                    },
                    y: {
                      ticks: {
                        color: darkMode ? "#cbd5f5" : "#0f172a",
                        precision: 0,
                      },
                      grid: {
                        color: darkMode ? "#1e293b" : "#e5e7eb",
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* HEATMAP + FILTERS */}
        <div className="flex flex-col xl:flex-row gap-4">
          {/* Heatmap */}
          <div
            className={`w-full xl:w-2/5 rounded-2xl border ${cardBorder} ${cardBg} shadow-sm p-4 flex flex-col gap-3`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <p className="text-xs font-semibold uppercase tracking-wide">
                  14-Day Expiry Heatmap
                </p>
              </div>
              <span className="text-[11px] text-slate-400">
                Darker = more items expiring
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1 mt-1">
              {heatmapDays.map((d, idx) => (
                <div key={d.date} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-semibold ${getHeatColor(
                      d.count
                    )}`}
                  >
                    {d.count || ""}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {idx % 2 === 0 ? dayjs(d.date).format("D") : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* FILTERS */}
          <div
            className={`w-full xl:flex-1 rounded-2xl border ${cardBorder} ${cardBg} shadow-sm p-4 flex flex-col gap-3`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-400" />
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Filters & Sorting
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
              <div className="flex-1">
                <div className="relative">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-full border border-slate-300 bg-slate-50/70 dark:bg-slate-900/40 dark:border-slate-700 px-4 py-1.5 text-sm pr-9"
                    placeholder="Search by product or category..."
                  />
                  <Grid3X3 className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Sort dropdown */}
              <Dropdown
                dismissOnClick
                renderTrigger={() => (
                  <button className="flex items-center justify-between gap-2 border border-purple-500 bg-purple-50 text-purple-900 dark:bg-purple-950/40 dark:text-purple-200 px-3 py-1.5 rounded-full shadow-sm text-xs min-w-[170px]">
                    <span className="inline-flex items-center gap-1">
                      <BarChart2 className="w-3.5 h-3.5" />
                      Sort: {sortBy}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                )}
              >
                <DropdownItem onClick={() => setSortBy("Urgency")}>
                  Urgency (Status &amp; Days Left)
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

            {/* Status chips */}
            <div className="mt-2">
              <p className="text-[11px] text-slate-400 mb-1">Status</p>
              <div className="flex gap-2 flex-wrap">
                {(["All", ...STATUS_ORDER] as (ExpiryStatus | "All")[]).map(
                  (st) => {
                    const isActive = statusFilter === st;
                    const label = st;
                    const baseClass =
                      "px-3 py-1.5 rounded-full text-xs font-medium border inline-flex items-center gap-1 cursor-pointer";
                    const activeClass =
                      "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200";
                    const inactiveClass =
                      "border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
                    return (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`${baseClass} ${
                          isActive ? activeClass : inactiveClass
                        }`}
                      >
                        {st === "Expired" && "❌"}
                        {st === "Near Expiry" && "⏳"}
                        {st === "Warning" && "⚠️"}
                        {st === "Good" && "✅"}
                        {st === "New Stocks" && "🆕"}
                        {st === "No Expiry" && "📦"}
                        {st === "All" && "🌈"}
                        <span>{label}</span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Category chips */}
            <div className="mt-2">
              <p className="text-[11px] text-slate-400 mb-1">Category</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setCategoryFilter("All")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border inline-flex items-center gap-1 ${
                    categoryFilter === "All"
                      ? "border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200"
                      : "border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  <Leaf className="w-3.5 h-3.5" />
                  All
                </button>
                {uniqueCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border inline-flex items-center gap-1 ${
                      categoryFilter === cat
                        ? "border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200"
                        : "border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    <Grid3X3 className="w-3.5 h-3.5" />
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* STATUS GROUPS + CARDS */}
        <div className="flex flex-col gap-6 mt-2">
          {loadingProducts ? (
            <div className="text-center text-sm text-slate-500 py-6">
              Loading products…
            </div>
          ) : filteredAndSorted.length === 0 ? (
            <div
              className={`rounded-2xl border ${cardBorder} ${cardBg} shadow-sm p-6 flex flex-col items-center justify-center gap-2`}
            >
              <AlertCircle className="w-8 h-8 text-slate-400" />
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
                  : status === "New Stocks"
                  ? "🆕"
                  : "📦";

              const headerColor =
                status === "Expired"
                  ? "text-red-500"
                  : status === "Near Expiry"
                  ? "text-orange-500"
                  : status === "Warning"
                  ? "text-amber-500"
                  : status === "Good"
                  ? "text-sky-500"
                  : status === "New Stocks"
                  ? "text-emerald-500"
                  : "text-slate-500";

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
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {groupItems.map((item) => (
                      <ProductCard
                        key={item.id}
                        product={item}
                        darkMode={darkMode}
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
        <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 mt-0.5" />
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
            items automatically prioritized in the view.
          </p>
        </div>

        <ProductLegendLayout />

        {/* RIGHT-SIDE DRAWER */}
        <AnimatePresence>
          {selectedProduct && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedProduct(null)}
              />
              <motion.div
                className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-md shadow-2xl border-l ${
                  darkMode
                    ? "bg-slate-950 border-slate-800 text-slate-50"
                    : "bg-white border-slate-200 text-slate-900"
                }`}
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
              >
                <DrawerContent
                  product={selectedProduct}
                  onClose={() => setSelectedProduct(null)}
                  darkMode={darkMode}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// =================== PRODUCT CARD ===================

function ProductCard({
  product,
  darkMode,
  onClick,
}: {
  product: EnrichedProduct;
  darkMode: boolean;
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
      className={`relative flex flex-col items-stretch text-left rounded-2xl border ${statusColorClass} ${
        darkMode ? "bg-slate-900/80" : "bg-white"
      } shadow-sm p-4 cursor-pointer hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400`}
    >
      {/* Status Badge */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-0.5 line-clamp-2">
            {name}
          </h3>
          <p className="text-[11px] text-slate-400">{category}</p>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 ${statusSoftClass}`}
        >
          {status === "Expired" && "❌"}
          {status === "Near Expiry" && "⏳"}
          {status === "Warning" && "⚠️"}
          {status === "Good" && "✅"}
          {status === "New Stocks" && "🆕"}
          {status === "No Expiry" && "📦"}
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
                : status === "New Stocks"
                ? "bg-emerald-500"
                : "bg-slate-300"
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
          <p className="font-semibold text-slate-700 dark:text-slate-100">
            {stock}
          </p>
        </div>
        <div>
          <p className="uppercase tracking-wide text-[10px] text-slate-400">
            Stock-In
          </p>
          <p className="font-semibold text-slate-700 dark:text-slate-100">
            {stockInDate ? dayjs(stockInDate).format("MMM D, YYYY") : "N/A"}
          </p>
        </div>
        <div>
          <p className="uppercase tracking-wide text-[10px] text-slate-400">
            Expiry
          </p>
          <p className="font-semibold text-slate-700 dark:text-slate-100">
            {expiryDate ? dayjs(expiryDate).format("MMM D, YYYY") : "N/A"}
          </p>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Days left: </span>
          <span className="font-semibold text-slate-700 dark:text-slate-100">
            {daysLeftLabel}
          </span>
        </span>
      </div>

      {/* Insight tags */}
      {insightTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {insightTags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.button>
  );
}

// =================== INSIGHT TAGS ===================

function getInsightTags(p: EnrichedProduct): string[] {
  const tags: string[] = [];

  if (p.status === "Expired") {
    tags.push("Requires immediate disposal");
  }

  if (p.status === "Near Expiry") {
    tags.push("High priority for promo");
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
    tags.push("Very fresh stock");
  }

  if (tags.length === 0) {
    tags.push("Healthy inventory");
  }

  return tags;
}

// =================== DRAWER CONTENT ===================

function DrawerContent({
  product,
  onClose,
}: {
  product: EnrichedProduct;
  onClose: () => void;
  darkMode: boolean;
}) {
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <span>{name}</span>
          </h2>
          <p className="text-[11px] text-slate-400">{category}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              Status
            </p>
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusSoftClass}`}
            >
              {status === "Expired" && "❌"}
              {status === "Near Expiry" && "⏳"}
              {status === "Warning" && "⚠️"}
              {status === "Good" && "✅"}
              {status === "New Stocks" && "🆕"}
              {status === "No Expiry" && "📦"}
              <span>{status}</span>
            </span>
          </div>
          <div className="text-right text-[11px] text-slate-400">
            <p>Shelf-life used</p>
            <p className="font-semibold text-slate-700 dark:text-slate-100">
              {percentUsed === null ? "N/A" : `${percent.toFixed(1)}%`}
            </p>
          </div>
        </div>

        {/* Shelf-life timeline */}
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">
            Shelf-life Timeline
          </p>
          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
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
                  : status === "New Stocks"
                  ? "bg-emerald-500"
                  : "bg-slate-300"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
            <span>
              {stockInDate
                ? dayjs(stockInDate).format("MMM D, YYYY")
                : "Stock-In N/A"}
            </span>
            <span>
              {expiryDate
                ? dayjs(expiryDate).format("MMM D, YYYY")
                : "Expiry N/A"}
            </span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
            <span>
              Elapsed:{" "}
              {elapsedDays !== null ? `${elapsedDays} days` : "N/A"}
            </span>
            <span>
              Total shelf-life:{" "}
              {shelfLifeDays !== null ? `${shelfLifeDays} days` : "N/A"}
            </span>
          </div>
        </div>

        {/* Basic details */}
        <div className="grid grid-cols-2 gap-3 text-[11px]">
          <div className="flex flex-col gap-0.5">
            <p className="uppercase tracking-wide text-[10px] text-slate-400">
              Stock Count
            </p>
            <p className="font-semibold text-slate-700 dark:text-slate-100">
              {stock}
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="uppercase tracking-wide text-[10px] text-slate-400">
              Days Left
            </p>
            <p className="font-semibold text-slate-700 dark:text-slate-100">
              {daysLeftLabel}
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="uppercase tracking-wide text-[10px] text-slate-400">
              Stock-In Date
            </p>
            <p className="font-semibold text-slate-700 dark:text-slate-100">
              {stockInDate ? dayjs(stockInDate).format("MMM D, YYYY") : "N/A"}
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="uppercase tracking-wide text-[10px] text-slate-400">
              Expiry Date
            </p>
            <p className="font-semibold text-slate-700 dark:text-slate-100">
              {expiryDate ? dayjs(expiryDate).format("MMM D, YYYY") : "N/A"}
            </p>
          </div>
        </div>

        {/* Status description */}
        <div className="mt-2">
          <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">
            Status Explanation
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-300 leading-relaxed">
            {statusDescription}
          </p>
        </div>

        {/* Actions (UI only for now) */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-600"
            type="button"
          >
            Mark as Checked Today
          </button>
          <button
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
            type="button"
          >
            Add Note (Future)
          </button>
        </div>
      </div>
    </div>
  );
}
