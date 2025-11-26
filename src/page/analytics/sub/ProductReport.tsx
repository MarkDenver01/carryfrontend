import React, { useState, useMemo, useEffect } from "react";

import { Dropdown, DropdownItem } from "flowbite-react";
import {
  ChevronDown,
  AlertCircle,
  Leaf,
  Clock,
  Layers,
} from "lucide-react";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { motion } from "framer-motion";

import ProductLegendLayout from "../../../layout/product/ProductLegendLayout";

// API
import { 
  getExpiryAnalytics, 
  getAllProducts 
} from "../../../libs/ApiGatewayDatasource";

import type { ExpiryAnalyticsDTO } from "../../../libs/ApiGatewayDatasource";
import type { ProductDTO } from "../../../libs/models/product/Product";

dayjs.extend(relativeTime);

// STATUS COLOR LOGIC
const getStatus = (days: number) => {
  if (days > 30)
    return {
      title: "Fresh",
      soft: "bg-green-100 text-green-700",
    };

  if (days >= 7)
    return {
      title: "Moderate",
      soft: "bg-yellow-100 text-yellow-700",
    };

  if (days >= 3)
    return {
      title: "Near Expiry",
      soft: "bg-orange-100 text-orange-700",
    };

  return {
    title: "Expired / Expiring",
    soft: "bg-red-100 text-red-700",
  };
};

export default function ProductReport() {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [productFilter, setProductFilter] = useState("All");

  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  // Analytics
  const [analytics, setAnalytics] = useState<ExpiryAnalyticsDTO | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // REAL PRODUCTS
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // FETCH ANALYTICS
  useEffect(() => {
    (async () => {
      try {
        const data = await getExpiryAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoadingAnalytics(false);
      }
    })();
  }, []);

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

  // MAP BACKEND DATA → TABLE FORMAT
  const tableData = useMemo(() => {
    return products.map((p) => ({
      name: p.productName,
      category: p.categoryName ?? "Uncategorized",
      stock: p.stocks,
      expiryDate: p.expiryDate, // Already in string format
    }));
  }, [products]);

  // FILTERING
  const filteredData = useMemo(() => {
    return tableData.filter((item) => {
      const matchCat = categoryFilter === "All" || item.category === categoryFilter;
      const matchProd = productFilter === "All" || item.name === productFilter;
      return matchCat && matchProd;
    });
  }, [categoryFilter, productFilter, tableData]);

  // UNIQUE FILTER OPTIONS
  const uniqueCategories = [...new Set(tableData.map((p) => p.category))];
  const uniqueProducts = [...new Set(tableData.map((p) => p.name))];

  const getDaysLeft = (expiryDate: string | null) => {
    if (!expiryDate) return 0;
    const today = dayjs();
    const expiry = dayjs(expiryDate);
    return expiry.diff(today, "day");
  };

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
          background: `radial-gradient(520px at ${cursorPos.x}px ${cursorPos.y}px, rgba(34,197,94,0.20), transparent 70%)`,
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
          className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-green-600 bg-clip-text text-transparent"
        >
          Food Freshness & Expiry Report
        </motion.h1>
        <p className="text-gray-500 text-sm mt-1">
          Monitor product lifespan and expiry status.
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          label="Fresh Items"
          count={loadingAnalytics ? "…" : analytics?.freshItems ?? 0}
          icon={<Leaf />}
          gradient="from-green-500 to-green-700"
        />
        <SummaryCard
          label="Moderate"
          count={loadingAnalytics ? "…" : analytics?.moderateItems ?? 0}
          icon={<Layers />}
          gradient="from-yellow-500 to-amber-600"
        />
        <SummaryCard
          label="Near Expiry"
          count={loadingAnalytics ? "…" : analytics?.nearExpiryItems ?? 0}
          icon={<Clock />}
          gradient="from-orange-500 to-red-500"
        />
        <SummaryCard
          label="Expired"
          count={loadingAnalytics ? "…" : analytics?.expiringOrExpiredItems ?? 0}
          icon={<AlertCircle />}
          gradient="from-red-600 to-red-800"
        />
      </div>

      {/* FILTERS */}
      <div className="flex justify-between items-center mt-4">
        <h2 className="font-semibold text-gray-700 text-lg">Filters</h2>

        <div className="flex gap-4">
          {/* Category Filter */}
          <Dropdown
            dismissOnClick
            renderTrigger={() => (
              <button className="flex items-center gap-2 border border-emerald-500 bg-emerald-50 text-emerald-900 px-4 py-1 rounded-full shadow">
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
              <button className="flex items-center gap-2 border border-indigo-500 bg-indigo-50 text-indigo-900 px-4 py-1 rounded-full shadow">
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
            <thead className="bg-emerald-600 text-white">
              <tr>
                <Th label="Product Name" />
                <Th label="Category" />
                <Th label="Stock" />
                <Th label="Expiry Date" />
                <Th label="Days Left" />
                <Th label="Status" />
              </tr>
            </thead>

            <tbody className="bg-white">
              {loadingProducts ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    Loading products…
                  </td>
                </tr>
              ) : filteredData.length ? (
                filteredData.map((item, i) => {
                  const days = getDaysLeft(item.expiryDate);
                  const status = getStatus(days);

                  return (
                    <tr key={i} className="hover:bg-gray-100 transition">
                      <Td>{item.name}</Td>
                      <Td>{item.category}</Td>
                      <Td>{item.stock}</Td>
                      <Td>{item.expiryDate ?? "N/A"}</Td>
                      <Td>{days} day(s)</Td>
                      <Td>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${status.soft}`}
                        >
                          {status.title}
                        </span>
                      </Td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-600">
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <ProductLegendLayout />
    </motion.div>
  );
}

// SUMMARY CARD COMPONENT
function SummaryCard({ label, count, icon, gradient }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      className={`relative p-4 rounded-xl shadow-lg text-white bg-gradient-to-br ${gradient} border border-white/20`}
    >
      <div className="relative flex gap-3 items-center">
        <div className="p-3 bg-white/20 rounded-full shadow">{icon}</div>
        <div>
          <p className="text-sm text-white/80">{label}</p>
          <p className="text-2xl font-extrabold">{count}</p>
        </div>
      </div>
    </motion.div>
  );
}

function Th({ label }: { label: string }) {
  return <th className="p-3 font-medium border border-gray-300">{label}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="p-3 border border-gray-200">{children}</td>;
}
