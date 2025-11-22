import React, { useState, useMemo } from "react";
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

dayjs.extend(relativeTime);

// TYPES
interface Product {
  name: string;
  category: string;
  stock: number;
  expiryDate: string;
}

interface StatusInfo {
  title: string;
  color: string;
  soft: string;
}

// SAMPLE DATA
const productData: Product[] = [
  { name: "Milk", category: "Dairy", stock: 120, expiryDate: "2025-08-10" },
  { name: "Eggs", category: "Poultry", stock: 80, expiryDate: "2025-07-04" },
  { name: "Bread", category: "Bakery", stock: 45, expiryDate: "2025-07-02" },
  { name: "Yogurt", category: "Dairy", stock: 30, expiryDate: "2025-07-01" },
  { name: "Chicken Breast", category: "Meat", stock: 50, expiryDate: "2025-07-06" },
];

// DAYS LEFT
const getDaysLeft = (date: string): number => {
  const today = dayjs();
  const expiry = dayjs(date);
  return expiry.diff(today, "day");
};

// BADGE COLOR SYSTEM
const getStatus = (days: number): StatusInfo => {
  if (days > 30)
    return {
      title: "Fresh",
      color: "bg-green-600",
      soft: "bg-green-100 text-green-700",
    };
  if (days >= 7)
    return {
      title: "Moderate",
      color: "bg-yellow-500",
      soft: "bg-yellow-100 text-yellow-700",
    };
  if (days >= 3)
    return {
      title: "Near Expiry",
      color: "bg-orange-500",
      soft: "bg-orange-100 text-orange-700",
    };
  return {
    title: "Expired / Expiring",
    color: "bg-red-600",
    soft: "bg-red-100 text-red-700",
  };
};

export default function ProductReport() {
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [productFilter, setProductFilter] = useState<string>("All");
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const filteredData = useMemo(() => {
    return productData.filter((item) => {
      const matchCat = categoryFilter === "All" || item.category === categoryFilter;
      const matchProd = productFilter === "All" || item.name === productFilter;
      return matchCat && matchProd;
    });
  }, [categoryFilter, productFilter]);

  const uniqueCategories = Array.from(new Set(productData.map((p) => p.category)));
  const uniqueProducts = Array.from(new Set(productData.map((p) => p.name)));

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
      {/* HUD BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 -z-30">
        {/* GRID */}
        <div className="w-full h-full opacity-40 mix-blend-soft-light bg-[linear-gradient(to_right,rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* SCANLINES */}
        <div className="absolute inset-0 opacity-[0.08] bg-[repeating-linear-gradient(to_bottom,rgba(15,23,42,0.9)_0px,rgba(15,23,42,0.9)_1px,transparent_1px,transparent_3px)]" />

        {/* AMBIENT BLOBS */}
        <motion.div
          className="absolute -top-24 -left-20 h-64 w-64 bg-emerald-500/25 blur-3xl"
          animate={{
            x: [0, 20, 10, -5, 0],
            y: [0, 10, 15, 5, 0],
            borderRadius: ["45%", "55%", "50%", "60%", "45%"],
          }}
          transition={{ duration: 18, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-[-5rem] right-0 h-72 w-72 bg-cyan-400/25 blur-3xl"
          animate={{
            x: [0, -15, -25, -10, 0],
            y: [0, -10, -20, -5, 0],
            borderRadius: ["50%", "65%", "55%", "70%", "50%"],
          }}
          transition={{ duration: 22, repeat: Infinity }}
        />
      </div>

      {/* CURSOR SPOTLIGHT */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background: `radial-gradient(520px at ${cursorPos.x}px ${cursorPos.y}px, rgba(34,197,94,0.20), transparent 70%)`,
        }}
        animate={{ opacity: [0.8, 1, 0.85] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* PAGE HEADER */}
      <div className="relative">
        <motion.h1
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-600 bg-clip-text text-transparent"
        >
          Food Freshness & Expiry Report
        </motion.h1>

        <p className="text-gray-500 text-sm mt-1">
          Monitor product lifespan, stock condition, and expiry status.
        </p>

        <div className="mt-3 h-[3px] w-24 bg-gradient-to-r from-emerald-400 via-emerald-500 to-transparent rounded-full" />
      </div>

      {/* HUD SCANNER BARS */}
      <motion.div
        className="pointer-events-none absolute top-[150px] w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent opacity-70"
        animate={{ x: ["-25%", "25%", "-25%"] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.div
        className="pointer-events-none absolute top-[158px] w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent opacity-70"
        animate={{ x: ["25%", "-25%", "25%"] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Fresh Items" count={32} icon={<Leaf />} gradient="from-green-500 to-green-700" />
        <SummaryCard label="Moderate" count={14} icon={<Layers />} gradient="from-yellow-500 to-amber-600" />
        <SummaryCard label="Near Expiry" count={6} icon={<Clock />} gradient="from-orange-500 to-red-500" />
        <SummaryCard label="Expired" count={3} icon={<AlertCircle />} gradient="from-red-600 to-red-800" />
      </div>

      {/* FILTERS */}
      <div className="flex justify-between items-center mt-4">
        <h2 className="font-semibold text-gray-700 text-lg">Filters</h2>

        <div className="flex gap-4">
          <Dropdown
            dismissOnClick
            renderTrigger={() => (
              <button className="flex items-center gap-2 border border-emerald-500 bg-emerald-50 text-emerald-900 px-4 py-1 rounded-full shadow">
                Category: {categoryFilter}
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          >
            <DropdownItem onClick={() => setCategoryFilter("All")}>All</DropdownItem>
            {uniqueCategories.map((c) => (
              <DropdownItem key={c} onClick={() => setCategoryFilter(c)}>
                {c}
              </DropdownItem>
            ))}
          </Dropdown>

          <Dropdown
            dismissOnClick
            renderTrigger={() => (
              <button className="flex items-center gap-2 border border-indigo-500 bg-indigo-50 text-indigo-900 px-4 py-1 rounded-full shadow">
                Product: {productFilter}
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          >
            <DropdownItem onClick={() => setProductFilter("All")}>All</DropdownItem>
            {uniqueProducts.map((p) => (
              <DropdownItem key={p} onClick={() => setProductFilter(p)}>
                {p}
              </DropdownItem>
            ))}
          </Dropdown>
        </div>
      </div>

      {/* TABLE WRAPPER (HUD STYLE) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative rounded-2xl border border-emerald-500/25 bg-white/95 shadow-[0_18px_55px_rgba(15,23,42,0.35)] overflow-hidden mt-3 backdrop-blur-xl"
      >
        {/* CORNER BRACKETS */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-3 left-3 h-5 w-5 border-t-2 border-l-2 border-emerald-400/80" />
          <div className="absolute top-3 right-3 h-5 w-5 border-t-2 border-r-2 border-emerald-400/80" />
          <div className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-emerald-400/80" />
          <div className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-emerald-400/80" />
        </div>

        {/* TABLE */}
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
              {filteredData.length ? (
                filteredData.map((item, i) => {
                  const days = getDaysLeft(item.expiryDate);
                  const status = getStatus(days);

                  return (
                    <tr key={i} className="hover:bg-gray-100 transition">
                      <Td>{item.name}</Td>
                      <Td>{item.category}</Td>
                      <Td>{item.stock}</Td>
                      <Td>{item.expiryDate}</Td>
                      <Td>{days} day(s)</Td>
                      <Td>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.soft}`}>
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

      {/* LEGEND */}
      <ProductLegendLayout />
    </motion.div>
  );
}

// COMPONENTS
function SummaryCard({
  label,
  count,
  icon,
  gradient,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <motion.div
      whileHover={{
        scale: 1.03,
        y: -4,
        rotateX: -4,
        rotateY: 4,
        boxShadow:
          "0 22px 55px rgba(15,23,42,0.28), 0 0 20px rgba(34,197,94,0.35)",
      }}
      className={`relative p-4 rounded-xl shadow-lg text-white bg-gradient-to-br ${gradient} border border-white/20`}
    >
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,white,transparent)]" />
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
