// YOUR ENHANCED ORDERS MANAGEMENT UI WITH PREMIUM ADMIN FEATURES

import { useState, useMemo } from "react";
import {
  Search,
  Eye,
  UserPlus,
  Phone,
  Truck,
  CheckCircle,
  XCircle,
  Filter,
  Package,
  MapPin,
  User,
  Printer,
  MoreVertical,
} from "lucide-react";
import { Dropdown, DropdownItem } from "flowbite-react";

const sampleOrders = [
  {
    id: "202407556401",
    name: "Monica Santos",
    address: "Barangay 6, Tanauan City Batangas",
    products: ["BearBrand Swak x2", "Cornedbeef x3", "Ligo Sardines x10"],
    total: 500,
    status: "Pending",
  },
  {
    id: "202407556402",
    name: "Joshua Cruz",
    address: "Purok 4, Talisay Batangas",
    products: ["Nissin Cup x5", "Delimondo x2", "Royal Soda x1"],
    total: 630,
    status: "Delivered",
  },
];

export default function Orders() {
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = useMemo(() => {
    return sampleOrders.filter(
      (order) =>
        (filter === "All" || order.status === filter) &&
        order.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [filter, searchTerm]);

  const getStatusColor = (s: string) => {
    if (s === "Pending") return "bg-amber-100 text-amber-700";
    if (s === "Delivered") return "bg-green-100 text-green-700";
    if (s === "Cancelled") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-600";
  };

  const getStatusIcon = (s: string) => {
    if (s === "Pending") return <Package className="w-4 h-4" />;
    if (s === "Delivered") return <CheckCircle className="w-4 h-4" />;
    if (s === "Cancelled") return <XCircle className="w-4 h-4" />;
    return <Package className="w-4 h-4" />;
  };

  return (
    <div className="p-6 flex flex-col gap-8">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl shadow-xl p-6 text-white">
        <h1 className="text-3xl font-bold tracking-tight">Orders Management</h1>
        <p className="text-emerald-100 text-sm opacity-90 mt-1">
          Track customer orders, monitor deliveries, and manage assignments.
        </p>
      </div>

      {/* STATUS FILTER TABS */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {["All", "Pending", "Delivered", "Cancelled"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition
              ${
                filter === tab
                  ? "bg-emerald-600 text-white shadow"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
        {[
          { label: "Total Orders", value: 27, icon: Package, color: "bg-blue-100 text-blue-700" },
          { label: "Pending", value: 3, icon: Package, color: "bg-amber-100 text-amber-700" },
          { label: "Delivered", value: 7, icon: CheckCircle, color: "bg-green-100 text-green-700" },
          { label: "Cancelled", value: 9, icon: XCircle, color: "bg-red-100 text-red-700" },
          { label: "In Transit", value: 8, icon: Truck, color: "bg-indigo-100 text-indigo-700" },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white border border-gray-100 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-3">
              <card.icon className={`w-8 h-8 ${card.color.split(" ")[1]}`} />
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FILTER + SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-2">
        <Dropdown
          dismissOnClick
          renderTrigger={() => (
            <button className="flex items-center gap-2 bg-white border border-gray-300 px-5 py-2 rounded-xl shadow hover:bg-gray-50 transition">
              <Filter className="w-4 h-4 text-emerald-600" />
              <span className="font-medium text-gray-700">Filter: {filter}</span>
            </button>
          )}
        >
          {["All", "Pending", "Delivered", "Cancelled"].map((s) => (
            <DropdownItem key={s} onClick={() => setFilter(s)}>
              {s}
            </DropdownItem>
          ))}
        </Dropdown>

        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Search orders..."
            className="w-full border border-gray-300 rounded-xl px-4 py-2 pl-11 shadow-sm focus:ring-2 focus:ring-emerald-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
        </div>
      </div>

      {/* ORDER LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        {filteredOrders.map((order, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all"
          >
            {/* HEADER */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">{order.name}</p>
                  <p className="text-xs text-gray-500">ORD - {order.id}</p>
                </div>
              </div>

              <span
                className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  order.status
                )}`}
              >
                {getStatusIcon(order.status)}
                {order.status}
              </span>
            </div>

            {/* ADDRESS */}
            <p className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              {order.address}
            </p>

            {/* ITEMS */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 mb-3">
              <p className="font-semibold text-gray-700 mb-1">Items Ordered:</p>
              <ul className="space-y-1 list-disc list-inside text-sm text-gray-600">
                {order.products.map((product, i) => (
                  <li key={i}>{product}</li>
                ))}
              </ul>
            </div>

            {/* TOTAL */}
            <p className="font-bold text-gray-800 text-lg mb-4">Total: ₱{order.total}</p>

            {/* ACTIONS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
              <button className="btn-primary-soft">
                <Eye className="w-4 h-4" /> View
              </button>
              <button className="btn-green-soft">
                <UserPlus className="w-4 h-4" /> Assign
              </button>
              <button className="btn-indigo-soft">
                <Truck className="w-4 h-4" /> Track
              </button>
              <button className="btn-orange-soft">
                <Phone className="w-4 h-4" /> Contact
              </button>
              <button className="btn-blue-soft">
                <Printer className="w-4 h-4" /> Print
              </button>
              <button className="btn-gray-soft">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
