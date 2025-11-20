import React, { useState, useMemo } from "react";
import { Dropdown, DropdownItem } from "flowbite-react";
import { ChevronDown, AlertCircle, Leaf, Clock, Layers } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
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

// FRESHNESS BADGE
const getStatus = (days: number): StatusInfo => {
  if (days > 30) return { title: "Fresh", color: "bg-green-600", soft: "bg-green-100 text-green-700" };
  if (days >= 7) return { title: "Moderate", color: "bg-yellow-500", soft: "bg-yellow-100 text-yellow-700" };
  if (days >= 3) return { title: "Near Expiry", color: "bg-orange-500", soft: "bg-orange-100 text-orange-700" };
  return { title: "Expired / Expiring", color: "bg-red-600", soft: "bg-red-100 text-red-700" };
};

export default function ProductReport() {
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [productFilter, setProductFilter] = useState<string>("All");

  const filteredData = useMemo(() => {
    return productData.filter((item) => {
      const matchCat = categoryFilter === "All" || item.category === categoryFilter;
      const matchProd = productFilter === "All" || item.name === productFilter;
      return matchCat && matchProd;
    });
  }, [categoryFilter, productFilter]);

  const uniqueCategories = Array.from(new Set(productData.map((p) => p.category)));
  const uniqueProducts = Array.from(new Set(productData.map((p) => p.name)));

  return (
    <div className="p-6 flex flex-col gap-6">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 rounded-2xl shadow text-white">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Leaf className="w-6 h-6" /> Food Freshness & Expiry Report
        </h1>
        <p className="text-sm opacity-80 mt-1">Track product lifespan and quality status.</p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Fresh Items" count={32} color="bg-green-100" text="text-green-700" icon={<Leaf />} />
        <SummaryCard label="Moderate" count={14} color="bg-yellow-100" text="text-yellow-700" icon={<Layers />} />
        <SummaryCard label="Near Expiry" count={6} color="bg-orange-100" text="text-orange-700" icon={<Clock />} />
        <SummaryCard label="Expired" count={3} color="bg-red-100" text="text-red-700" icon={<AlertCircle />} />
      </div>

      {/* FILTERS */}
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-gray-700 text-lg">Filters</h2>

        <div className="flex gap-4">
          {/* Category Filter */}
          <Dropdown
            dismissOnClick
            renderTrigger={() => (
              <button className="flex items-center gap-2 border border-green-500 bg-green-50 text-green-900 font-medium text-sm px-4 py-1 rounded-full shadow">
                Category: {categoryFilter}
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          >
            <DropdownItem onClick={() => setCategoryFilter("All")}>All</DropdownItem>
            {uniqueCategories.map((c) => (
              <DropdownItem key={c} onClick={() => setCategoryFilter(c)}>{c}</DropdownItem>
            ))}
          </Dropdown>

          {/* Product Filter */}
          <Dropdown
            dismissOnClick
            renderTrigger={() => (
              <button className="flex items-center gap-2 border border-indigo-500 bg-indigo-50 text-indigo-900 font-medium text-sm px-4 py-1 rounded-full shadow">
                Product: {productFilter}
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          >
            <DropdownItem onClick={() => setProductFilter("All")}>All</DropdownItem>
            {uniqueProducts.map((p) => (
              <DropdownItem key={p} onClick={() => setProductFilter(p)}>{p}</DropdownItem>
            ))}
          </Dropdown>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-emerald-600 text-white">
            <tr>
              <Th label="Product Name" />
              <Th label="Category" />
              <Th label="Stock Qty." />
              <Th label="Expiry Date" />
              <Th label="Days Left" />
              <Th label="Freshness" />
            </tr>
          </thead>
          <tbody>
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

      {/* LEGEND */}
      <ProductLegendLayout />
    </div>
  );
}

// COMPONENT TYPES
interface SummaryProps {
  label: string;
  count: number;
  color: string;
  text: string;
  icon: React.ReactNode;
}

// Reusable Components
function SummaryCard({ label, count, color, text, icon }: SummaryProps) {
  return (
    <div className={`p-4 rounded-xl shadow flex items-center gap-3 ${color}`}>
      <div className={text}>{icon}</div>
      <div>
        <span className="text-sm text-gray-600">{label}</span>
        <div className={`text-xl font-bold ${text}`}>{count}</div>
      </div>
    </div>
  );
}

function Th({ label }: { label: string }) {
  return <th className="p-3 font-medium border border-gray-300">{label}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="p-3 border border-gray-200">{children}</td>;
}
