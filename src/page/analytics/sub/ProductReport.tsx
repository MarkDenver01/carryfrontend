import React, { useState, useMemo, useEffect } from "react";

import { Dropdown, DropdownItem } from "flowbite-react";
import {
  ChevronDown,
  AlertCircle,
  Leaf,
  Clock,
  Layers,
  BarChart2,
  Package,
} from "lucide-react";

import dayjs from "dayjs";
import { motion } from "framer-motion";

import ProductLegendLayout from "../../../layout/product/ProductLegendLayout";

// API
import { getAllProducts } from "../../../libs/ApiGatewayDatasource";

import type { ProductDTO } from "../../../libs/models/product/Product";

/* ========================================
   TYPES & CONSTANTS
======================================== */

type SortOption = "Urgency" | "Name" | "Category" | "Stock" | "DaysLeft";

type ExpiryStatus =
  | "Fresh"
  | "Stable"
  | "Warning"
  | "Near Expiry"
  | "Expired"
  | "No Expiry";

interface EnrichedProduct {
  name: string;
  category: string;
  stock: number;
  expiryDate: string | null;
  daysLeft: number | null;
  status: ExpiryStatus;
  statusPriority: number;
  statusSoftClass: string;
  statusRowClass: string;
  statusDescription: string;
}

/* ========================================
   STATUS CLASSIFICATION
======================================== */

const classifyStatus = (
  daysLeft: number | null
): {
  status: ExpiryStatus;
  priority: number;
  softClass: string;
  rowClass: string;
  description: string;
} => {
  // No expiry date provided
  if (daysLeft === null) {
    return {
      status: "No Expiry",
      priority: 5,
      softClass: "bg-gray-100 text-gray-700",
      rowClass: "",
      description: "No recorded expiry date for this item.",
    };
  }

  // Expired (0 or negative)
  if (daysLeft <= 0) {
    return {
      status: "Expired",
      priority: 0,
      softClass: "bg-red-100 text-red-700",
      rowClass: "bg-red-50/80",
      description: "Item has already expired and should not be sold.",
    };
  }

  if (daysLeft <= 5) {
    return {
      status: "Near Expiry",
      priority: 1,
      softClass: "bg-orange-100 text-orange-700",
      rowClass: "bg-orange-50/80",
      description: "Item will expire in 1–5 days and should be prioritized.",
    };
  }

  if (daysLeft <= 10) {
    return {
      status: "Warning",
      priority: 2,
      softClass: "bg-amber-100 text-amber-700",
      rowClass: "bg-amber-50/80",
      description: "Item will expire in 6–10 days. Monitor and plan promos.",
    };
  }

  if (daysLeft <= 20) {
    return {
      status: "Stable",
      priority: 3,
      softClass: "bg-sky-100 text-sky-700",
      rowClass: "",
      description: "Item has 11–20 days left before expiry.",
    };
  }

  // > 20 days
  return {
    status: "Fresh",
    priority: 4,
    softClass: "bg-emerald-100 text-emerald-700",
    rowClass: "",
    description: "Item has more than 20 days before expiry.",
  };
};

// Clamp helper for progress bar
const clamp = (val: number, min: number, max: number) =>
  Math.min(max, Math.max(min, val));

/* ========================================
   COMPONENT
======================================== */

export default function ProductReport() {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [productFilter, setProductFilter] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("Urgency");

  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  // REAL PRODUCTS
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // FETCH PRODUCTS
  useEffect(() => {
    (async () => {
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoadingProducts(false);
      }
    })();
  }, []);

  // MAP BACKEND DATA → ENRICHED FORMAT
  const enrichedData: EnrichedProduct[] = useMemo(() => {
    return products.map((p) => {
      const name = p.productName;
      const category = p.categoryName ?? "Uncategorized";
      const stock = p.stocks;
      const expiryDate = p.expiryDate ?? null;

      let daysLeft: number | null = null;
      if (expiryDate) {
        const today = dayjs();
        const expiry = dayjs(expiryDate);
        const diffHours = expiry.diff(today, "hour");
        daysLeft = Math.ceil(diffHours / 24); // round up for more accurate days
      }

      const statusInfo = classifyStatus(daysLeft);

      return {
        name,
        category,
        stock,
        expiryDate,
        daysLeft,
        status: statusInfo.status,
        statusPriority: statusInfo.priority,
        statusSoftClass: statusInfo.softClass,
        statusRowClass: statusInfo.rowClass,
        statusDescription: statusInfo.description,
      };
    });
  }, [products]);

  // UNIQUE FILTER OPTIONS
  const uniqueCategories = useMemo(
    () => [...new Set(enrichedData.map((p) => p.category))].sort(),
    [enrichedData]
  );
  const uniqueProducts = useMemo(
    () => [...new Set(enrichedData.map((p) => p.name))].sort(),
    [enrichedData]
  );

  // SUMMARY METRICS
  const summary = useMemo(() => {
    let total = 0;
    let expired = 0;
    let nearExpiry = 0;
    let warning = 0;
    let stable = 0;
    let fresh = 0;

    enrichedData.forEach((item) => {
      total++;
      switch (item.status) {
        case "Expired":
          expired++;
          break;
        case "Near Expiry":
          nearExpiry++;
          break;
        case "Warning":
          warning++;
          break;
        case "Stable":
          stable++;
          break;
        case "Fresh":
          fresh++;
          break;
        default:
          break;
      }
    });

    return { total, expired, nearExpiry, warning, stable, fresh };
  }, [enrichedData]);

  // FILTER + SORT
  const filteredAndSortedData = useMemo(() => {
    let filtered = enrichedData.filter((item) => {
      const matchCat =
        categoryFilter === "All" || item.category === categoryFilter;
      const matchProd =
        productFilter === "All" || item.name === productFilter;
      return matchCat && matchProd;
    });

    // Sorting logic
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "Urgency") {
        // by status priority then daysLeft ascending
        if (a.statusPriority !== b.statusPriority) {
          return a.statusPriority - b.statusPriority;
        }

        const aDays = a.daysLeft ?? Number.POSITIVE_INFINITY;
        const bDays = b.daysLeft ?? Number.POSITIVE_INFINITY;
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

    return filtered;
  }, [enrichedData, categoryFilter, productFilter, sortBy]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      onMouseMove={handleMouseMove}
      className="relative p-6 md:p-8 flex flex-col gap-8 overflow-hidden"
    >
      {/* SPOTLIGHT */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background: `radial-gradient(520px at ${cursorPos.x}px ${cursorPos.y}px, rgba(16,185,129,0.22), transparent 70%)`,
        }}
        animate={{ opacity: [0.85, 1, 0.9] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      {/* HEADER */}
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 via-sky-400 to-green-600 bg-clip-text text-transparent"
        >
          Food Freshness & Expiry Report
        </motion.h1>
        <p className="text-gray-500 text-sm mt-1">
          Monitor product lifespan, prioritize near-expiry items, and reduce
          wastage.
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <SummaryCard
          label="Total Tracked Items"
          count={summary.total}
          icon={<BarChart2 className="w-5 h-5" />}
          gradient="from-slate-700 to-slate-900"
          subtitle="All products with expiry data"
        />
        <SummaryCard
          label="Expired"
          count={summary.expired}
          icon={<AlertCircle className="w-5 h-5" />}
          gradient="from-red-500 to-red-700"
          subtitle="Should be removed from shelves"
        />
        <SummaryCard
          label="Near Expiry (1–5d)"
          count={summary.nearExpiry}
          icon={<Clock className="w-5 h-5" />}
          gradient="from-orange-500 to-red-500"
          subtitle="Highest priority to sell"
        />
        <SummaryCard
          label="Warning (6–10d)"
          count={summary.warning}
          icon={<Layers className="w-5 h-5" />}
          gradient="from-amber-400 to-amber-600"
          subtitle="Plan promos & bundles"
        />
        <SummaryCard
          label="Stable (11–20d)"
          count={summary.stable}
          icon={<Package className="w-5 h-5" />}
          gradient="from-sky-400 to-sky-600"
          subtitle="Healthy stock window"
        />
        <SummaryCard
          label="Fresh (&gt;20d)"
          count={summary.fresh}
          icon={<Leaf className="w-5 h-5" />}
          gradient="from-emerald-500 to-green-700"
          subtitle="Long shelf-life"
        />
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4">
        <h2 className="font-semibold text-gray-700 text-lg flex items-center gap-2">
          <span className="w-1.5 h-6 rounded-full bg-emerald-500" />
          Expiry Overview
        </h2>

        <div className="flex flex-wrap gap-3">
          {/* Sort By */}
          <Dropdown
            dismissOnClick
            renderTrigger={() => (
              <button className="flex items-center gap-2 border border-purple-500 bg-purple-50 text-purple-900 px-4 py-1.5 rounded-full shadow-sm text-sm">
                Sort: {sortBy}
                <ChevronDown className="w-4 h-4" />
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

          {/* Category Filter */}
          <Dropdown
            dismissOnClick
            renderTrigger={() => (
              <button className="flex items-center gap-2 border border-emerald-500 bg-emerald-50 text-emerald-900 px-4 py-1.5 rounded-full shadow-sm text-sm">
                Category: {categoryFilter}
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          >
            <DropdownItem onClick={() => setCategoryFilter("All")}>
              All
            </DropdownItem>
            {uniqueCategories.map((c) => (
              <DropdownItem key={c} onClick={() => setCategoryFilter(c)}>
                {c}
              </DropdownItem>
            ))}
          </Dropdown>

          {/* Product Filter */}
          <Dropdown
            dismissOnClick
            renderTrigger={() => (
              <button className="flex items-center gap-2 border border-indigo-500 bg-indigo-50 text-indigo-900 px-4 py-1.5 rounded-full shadow-sm text-sm">
                Product: {productFilter}
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          >
            <DropdownItem onClick={() => setProductFilter("All")}>
              All
            </DropdownItem>
            {uniqueProducts.map((p) => (
              <DropdownItem key={p} onClick={() => setProductFilter(p)}>
                {p}
              </DropdownItem>
            ))}
          </Dropdown>
        </div>
      </div>

      {/* TABLE */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative rounded-2xl border border-emerald-500/25 bg-white shadow-xl overflow-hidden mt-3 backdrop-blur-xl"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gradient-to-r from-emerald-600 via-sky-600 to-green-600 text-white">
              <tr>
                <Th label="Product Name" />
                <Th label="Category" />
                <Th label="Stock" />
                <Th label="Expiry Date" />
                <Th label="Days Left" />
                <Th label="Status" />
                <Th label="Shelf-life Progress" />
              </tr>
            </thead>

            <tbody className="bg-white">
              {loadingProducts ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    Loading products…
                  </td>
                </tr>
              ) : filteredAndSortedData.length ? (
                <CategoryGroupedRows items={filteredAndSortedData} />
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-600">
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* LEGEND / EXPLANATION */}
      <div className="mt-2 text-xs text-gray-500">
        <p>
          Note:{" "}
          <span className="font-semibold text-emerald-600">
            Days Left
          </span>{" "}
          is computed based on the current date, rounding up to the nearest
          day to reflect remaining shelf life more accurately.
        </p>
      </div>

      <ProductLegendLayout />
    </motion.div>
  );
}

/* ========================================
   ROWS WITH CATEGORY GROUPING
======================================== */

function CategoryGroupedRows({ items }: { items: EnrichedProduct[] }) {
  let lastCategory: string | null = null;

  const rows: React.ReactNode[] = [];

  items.forEach((item, index) => {
    const isNewCategory = item.category !== lastCategory;
    if (isNewCategory) {
      lastCategory = item.category;
      rows.push(
        <tr key={`cat-${item.category}`} className="bg-slate-50">
          <td
            colSpan={7}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 border-y border-slate-200"
          >
            {item.category}
          </td>
        </tr>
      );
    }

    const daysLabel =
      item.daysLeft === null ? "N/A" : `${item.daysLeft} day(s)`;

    // progress bar based on 0–30 day window (visual only)
    const daysForProgress =
      item.daysLeft === null ? 0 : clamp(item.daysLeft, 0, 30);
    const progressPercent = (daysForProgress / 30) * 100;

    rows.push(
      <tr
        key={`${item.category}-${item.name}-${index}`}
        className={`hover:bg-gray-50 transition ${item.statusRowClass}`}
      >
        <Td>{item.name}</Td>
        <Td>{item.category}</Td>
        <Td>{item.stock}</Td>
        <Td>{item.expiryDate ?? "N/A"}</Td>
        <Td>{daysLabel}</Td>
        <Td>
          <span
            title={item.statusDescription}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${item.statusSoftClass}`}
          >
            {/* Simple icon cues based on status */}
            {item.status === "Fresh" && "🌿"}
            {item.status === "Stable" && "✅"}
            {item.status === "Warning" && "⚠️"}
            {item.status === "Near Expiry" && "⏳"}
            {item.status === "Expired" && "❌"}
            {item.status === "No Expiry" && "📦"}
            <span>{item.status}</span>
          </span>
        </Td>
        <Td>
          <div className="w-full max-w-[180px]">
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  item.status === "Expired"
                    ? "bg-red-500"
                    : item.status === "Near Expiry"
                    ? "bg-orange-500"
                    : item.status === "Warning"
                    ? "bg-amber-400"
                    : item.status === "Stable"
                    ? "bg-sky-400"
                    : item.status === "Fresh"
                    ? "bg-emerald-500"
                    : "bg-gray-300"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </Td>
      </tr>
    );
  });

  return <>{rows}</>;
}

/* ========================================
   SMALL REUSABLE COMPONENTS
======================================== */

function SummaryCard({
  label,
  count,
  icon,
  gradient,
  subtitle,
}: {
  label: string;
  count: number | string;
  icon: React.ReactNode;
  gradient: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      className={`relative p-4 rounded-xl shadow-lg text-white bg-gradient-to-br ${gradient} border border-white/20`}
    >
      <div className="relative flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-white/80">
            {label}
          </p>
          <div className="p-2 bg-white/20 rounded-full shadow">{icon}</div>
        </div>
        <p className="text-2xl font-extrabold leading-none">{count}</p>
        {subtitle && (
          <p className="text-[11px] text-white/80 mt-1">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}

function Th({ label }: { label: string }) {
  return (
    <th className="p-3 font-semibold border border-emerald-700/40 text-xs uppercase tracking-wide">
      {label}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="p-3 border border-gray-200 text-sm">{children}</td>;
}
