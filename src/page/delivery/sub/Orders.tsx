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
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Orders Management</h1>
        <p className="text-emerald-100 text-sm mt-1">
          Track customer orders, monitor deliveries, and assign riders.
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: "Total", value: 27, color: "bg-blue-100 text-blue-700" },
          { label: "Pending", value: 3, color: "bg-yellow-100 text-yellow-700" },
          { label: "Delivered", value: 7, color: "bg-green-100 text-green-700" },
          { label: "Cancelled", value: 9, color: "bg-red-100 text-red-700" },
          { label: "In Transit", value: 8, color: "bg-indigo-100 text-indigo-700" },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow hover:shadow-md transition"
          >
            <p className="text-sm font-medium text-gray-600">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <Dropdown
          dismissOnClick
          renderTrigger={() => (
            <button className="flex items-center gap-2 border border-emerald-500 bg-emerald-100 text-emerald-900 font-semibold text-sm px-4 py-2 rounded-full shadow hover:shadow-md transition">
              <Filter className="w-4 h-4" />
              Filter: {filter}
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
            className="w-full border border-emerald-300 rounded-xl px-4 py-2 pl-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
        </div>
      </div>

      {/* ORDER LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredOrders.map((order, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow hover:shadow-xl transition-all"
          >
            {/* HEADER */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">{order.name}</p>
                  <p className="text-xs text-gray-500">ORD - {order.id}</p>
                </div>
              </div>

              <span
                className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(
                  order.status
                )}`}
              >
                {getStatusIcon(order.status)}
                {order.status}
              </span>
            </div>

            {/* ADDRESS */}
            <p className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <MapPin className="w-4 h-4 text-emerald-500" />
              {order.address}
            </p>

            {/* PRODUCTS */}
            <div className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 border border-gray-200 mb-3">
              <p className="font-semibold text-gray-700 mb-1">Items Ordered:</p>
              <ul className="space-y-1 list-disc list-inside">
                {order.products.map((product, i) => (
                  <li key={i}>{product}</li>
                ))}
              </ul>
            </div>

            {/* TOTAL */}
            <p className="font-bold text-gray-800 text-lg mb-4">
              Total: ₱{order.total}
            </p>

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
              <button className="bg-blue-100 text-blue-700 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-blue-200 transition flex items-center justify-center gap-1">
                <Eye className="w-4 h-4" /> View
              </button>
              <button className="bg-emerald-100 text-emerald-700 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-200 transition flex items-center justify-center gap-1">
                <UserPlus className="w-4 h-4" /> Assign
              </button>
              <button className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-indigo-200 transition flex items-center justify-center gap-1">
                <Truck className="w-4 h-4" /> Track
              </button>
              <button className="bg-orange-100 text-orange-700 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-orange-200 transition flex items-center justify-center gap-1">
                <Phone className="w-4 h-4" /> Contact
              </button>
              <button className="bg-green-100 text-green-700 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-green-200 transition flex items-center justify-center gap-1">
                <CheckCircle className="w-4 h-4" /> Delivered
              </button>
              <button className="bg-red-100 text-red-700 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-red-200 transition flex items-center justify-center gap-1">
                <XCircle className="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
