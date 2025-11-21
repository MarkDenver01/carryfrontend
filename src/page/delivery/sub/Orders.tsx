import { useMemo, useState } from "react";
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
  Clock,
  CreditCard,
  AlertTriangle,
  Route,
} from "lucide-react";

// ---- Types ----
type OrderStatus = "Pending" | "In Transit" | "Delivered" | "Cancelled";
type OrderPriority = "Normal" | "High" | "Scheduled";

type Order = {
  id: string;
  name: string;
  address: string;
  products: string[];
  total: number;
  status: OrderStatus;
  priority: OrderPriority;
  scheduledTime?: string;
  rider?: string;
  distanceKm?: number;
  paymentStatus?: "Paid" | "COD" | "Unpaid";
  notes?: string;
  createdAt: string;
};

const initialOrders: Order[] = [
  {
    id: "202407556401",
    name: "Monica Santos",
    address: "Barangay 6, Tanauan City, Batangas",
    products: ["BearBrand Swak x2", "Cornedbeef x3", "Ligo Sardines x10"],
    total: 500,
    status: "Pending",
    priority: "High",
    scheduledTime: "Today • 4:30 PM",
    rider: "Unassigned",
    distanceKm: 3.2,
    paymentStatus: "COD",
    notes: "Customer requested to call upon arrival.",
    createdAt: "2025-07-03 10:15 AM",
  },
  {
    id: "202407556402",
    name: "Joshua Cruz",
    address: "Purok 4, Talisay, Batangas",
    products: ["Nissin Cup x5", "Delimondo x2", "Royal Soda x1"],
    total: 630,
    status: "Delivered",
    priority: "Normal",
    scheduledTime: "Today • 2:00 PM",
    rider: "Carlos Dela Cruz",
    distanceKm: 5.1,
    paymentStatus: "Paid",
    notes: "Left at gate as requested.",
    createdAt: "2025-07-03 09:10 AM",
  },
  {
    id: "202407556403",
    name: "Ana Rodriguez",
    address: "Barangay 2, Sto. Tomas, Batangas",
    products: ["Lucky Me Pancit Canton x20", "Coke 1.5L x2"],
    total: 780,
    status: "In Transit",
    priority: "Scheduled",
    scheduledTime: "Today • 6:00 PM",
    rider: "Jomar Castillo",
    distanceKm: 7.8,
    paymentStatus: "COD",
    notes: "Priority delivery before 7PM.",
    createdAt: "2025-07-03 11:05 AM",
  },
];

const sampleRiders = [
  "Carlos Dela Cruz",
  "Jomar Castillo",
  "Leo Mariano",
  "Samuel Reyes",
];

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filter, setFilter] = useState<"All" | OrderStatus>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  // ---- Derived values ----
  const filteredOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        (filter === "All" || order.status === filter) &&
        order.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, filter, searchTerm]);

  const totalOrders = orders.length;
  const totalPending = orders.filter((o) => o.status === "Pending").length;
  const totalInTransit = orders.filter((o) => o.status === "In Transit").length;
  const totalDelivered = orders.filter((o) => o.status === "Delivered").length;
  const totalCancelled = orders.filter((o) => o.status === "Cancelled").length;

  // ---- Helpers ----
  const getStatusColor = (s: OrderStatus) => {
    if (s === "Pending") return "bg-amber-100 text-amber-700";
    if (s === "In Transit") return "bg-indigo-100 text-indigo-700";
    if (s === "Delivered") return "bg-green-100 text-green-700";
    if (s === "Cancelled") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-600";
  };

  const getStatusIcon = (s: OrderStatus) => {
    if (s === "Pending") return <Package className="w-4 h-4" />;
    if (s === "In Transit") return <Truck className="w-4 h-4" />;
    if (s === "Delivered") return <CheckCircle className="w-4 h-4" />;
    if (s === "Cancelled") return <XCircle className="w-4 h-4" />;
    return <Package className="w-4 h-4" />;
  };

  const getPriorityColor = (p: OrderPriority) => {
    if (p === "High") return "bg-red-50 text-red-700 border border-red-200";
    if (p === "Scheduled") return "bg-blue-50 text-blue-700 border border-blue-200";
    return "bg-gray-50 text-gray-600 border border-gray-200";
  };

  const getPaymentColor = (p?: Order["paymentStatus"]) => {
    if (p === "Paid") return "bg-emerald-50 text-emerald-700";
    if (p === "COD") return "bg-amber-50 text-amber-700";
    if (p === "Unpaid") return "bg-red-50 text-red-700";
    return "bg-gray-50 text-gray-600";
  };

  // ---- Actions ----
  const openDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const openAssign = (order: Order) => {
    setSelectedOrder(order);
    setIsAssignOpen(true);
  };

  const closeDetails = () => setIsDetailOpen(false);
  const closeAssign = () => setIsAssignOpen(false);

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
            }
          : o
      )
    );
  };

  const assignRiderToOrder = (riderName: string) => {
    if (!selectedOrder) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id
          ? {
              ...o,
              rider: riderName,
            }
          : o
      )
    );
    // Also update selectedOrder state so UI reflects immediately
    setSelectedOrder((prev) =>
      prev
        ? {
            ...prev,
            rider: riderName,
          }
        : prev
    );
    closeAssign();
  };

  return (
    <div className="p-6 flex flex-col gap-8">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl shadow-xl p-6 text-white">
        <h1 className="text-3xl font-bold tracking-tight">
          Orders Management
        </h1>
        <p className="text-emerald-100 text-sm mt-1 opacity-90">
          Track customer orders, monitor deliveries, and manage rider assignments.
        </p>
      </div>

      {/* STATUS TABS */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {["All", "Pending", "In Transit", "Delivered", "Cancelled"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab as "All" | OrderStatus)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition whitespace-nowrap
              ${
                filter === tab
                  ? "bg-emerald-600 text-white border-emerald-600 shadow"
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
          {
            label: "Total Orders",
            value: totalOrders,
            icon: Package,
            color: "text-blue-700",
            bg: "bg-blue-50",
          },
          {
            label: "Pending",
            value: totalPending,
            icon: Package,
            color: "text-amber-700",
            bg: "bg-amber-50",
          },
          {
            label: "In Transit",
            value: totalInTransit,
            icon: Truck,
            color: "text-indigo-700",
            bg: "bg-indigo-50",
          },
          {
            label: "Delivered",
            value: totalDelivered,
            icon: CheckCircle,
            color: "text-emerald-700",
            bg: "bg-emerald-50",
          },
          {
            label: "Cancelled",
            value: totalCancelled,
            icon: XCircle,
            color: "text-red-700",
            bg: "bg-red-50",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white border border-gray-100 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg}`}
              >
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FILTER + SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Filter Preview (Read-only label since tabs already filter) */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>
            Showing:{" "}
            <span className="font-semibold text-gray-800">{filter}</span>
          </span>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Search customer name..."
            className="w-full border border-gray-300 rounded-xl px-4 py-2 pl-11 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
        </div>
      </div>

      {/* ORDER LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredOrders.length === 0 && (
          <div className="col-span-full bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-500">
            <p className="font-semibold mb-1">No orders found</p>
            <p className="text-sm">
              Try adjusting filters or searching for a different customer.
            </p>
          </div>
        )}

        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all flex flex-col gap-3"
          >
            {/* HEADER */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">{order.name}</p>
                  <p className="text-xs text-gray-500">ORD - {order.id}</p>
                  <p className="text-[11px] text-gray-400">
                    Created: {order.createdAt}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span
                  className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusIcon(order.status)}
                  {order.status}
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${getPriorityColor(
                    order.priority
                  )}`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  {order.priority} priority
                </span>
              </div>
            </div>

            {/* ADDRESS + META */}
            <div className="flex flex-col gap-1 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                {order.address}
              </p>
              <div className="flex flex-wrap gap-3 text-xs mt-1">
                {order.scheduledTime && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                    <Clock className="w-3 h-3" />
                    {order.scheduledTime}
                  </span>
                )}
                {order.distanceKm !== undefined && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                    <Route className="w-3 h-3" />
                    ~{order.distanceKm.toFixed(1)} km
                  </span>
                )}
                {order.paymentStatus && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getPaymentColor(
                      order.paymentStatus
                    )}`}
                  >
                    <CreditCard className="w-3 h-3" />
                    {order.paymentStatus}
                  </span>
                )}
              </div>
            </div>

            {/* ITEMS */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
              <p className="font-semibold text-gray-700 mb-1 text-sm">
                Items Ordered:
              </p>
              <ul className="space-y-1 list-disc list-inside text-xs text-gray-600">
                {order.products.map((product, i) => (
                  <li key={i}>{product}</li>
                ))}
              </ul>
            </div>

            {/* TOTAL + RIDER */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Total Amount</p>
                <p className="font-bold text-lg text-gray-900">
                  ₱{order.total.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Assigned Rider</p>
                <p className="text-sm font-semibold text-gray-800">
                  {order.rider ?? "Unassigned"}
                </p>
              </div>
            </div>

            {/* NOTES */}
            {order.notes && (
              <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-lg p-2 mt-1">
                <span className="font-semibold">Note: </span>
                {order.notes}
              </p>
            )}

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
              <button
                className="w-full bg-blue-50 text-blue-700 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-blue-100 transition flex items-center justify-center gap-1"
                onClick={() => openDetails(order)}
              >
                <Eye className="w-4 h-4" /> View Details
              </button>
              <button
                className="w-full bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition flex items-center justify-center gap-1"
                onClick={() => openAssign(order)}
              >
                <UserPlus className="w-4 h-4" /> Assign Rider
              </button>
              <button className="w-full bg-indigo-50 text-indigo-700 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition flex items-center justify-center gap-1">
                <Truck className="w-4 h-4" /> View Route
              </button>
              <button className="w-full bg-orange-50 text-orange-700 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-orange-100 transition flex items-center justify-center gap-1">
                <Phone className="w-4 h-4" /> Contact
              </button>
              <button
                className="w-full bg-green-50 text-green-700 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-green-100 transition flex items-center justify-center gap-1"
                onClick={() => updateOrderStatus(order.id, "Delivered")}
              >
                <CheckCircle className="w-4 h-4" /> Mark Delivered
              </button>
              <button
                className="w-full bg-red-50 text-red-700 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-red-100 transition flex items-center justify-center gap-1"
                onClick={() => updateOrderStatus(order.id, "Cancelled")}
              >
                <XCircle className="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* VIEW DETAILS DRAWER */}
      {isDetailOpen && selectedOrder && (
        <div className="fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div
            className="flex-1 bg-black/40"
            onClick={closeDetails}
          />
          {/* Drawer */}
          <div className="w-full max-w-md bg-white shadow-2xl p-6 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Order Details
                </h2>
                <p className="text-xs text-gray-500">
                  ORD - {selectedOrder.id}
                </p>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={closeDetails}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 mb-1">Customer</p>
                <p className="font-semibold text-gray-800">
                  {selectedOrder.name}
                </p>
                <p className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  {selectedOrder.address}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    selectedOrder.status
                  )}`}
                >
                  {getStatusIcon(selectedOrder.status)}
                  {selectedOrder.status}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] ${getPriorityColor(
                    selectedOrder.priority
                  )}`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  {selectedOrder.priority} priority
                </span>
                {selectedOrder.paymentStatus && (
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] ${getPaymentColor(
                      selectedOrder.paymentStatus
                    )}`}
                  >
                    <CreditCard className="w-3 h-3" />
                    {selectedOrder.paymentStatus}
                  </span>
                )}
              </div>

              {selectedOrder.scheduledTime && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Schedule</p>
                  <p className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-gray-500" />
                    {selectedOrder.scheduledTime}
                  </p>
                </div>
              )}

              <div className="border rounded-lg p-3 bg-gray-50">
                <p className="text-xs font-semibold text-gray-600 mb-1">
                  Items
                </p>
                <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                  {selectedOrder.products.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between items-center border rounded-lg p-3 bg-white">
                <div>
                  <p className="text-xs text-gray-500">Total Amount</p>
                  <p className="font-bold text-lg text-gray-900">
                    ₱{selectedOrder.total.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Assigned Rider</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {selectedOrder.rider ?? "Unassigned"}
                  </p>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="border rounded-lg p-3 bg-amber-50 border-amber-100 text-xs text-amber-900">
                  <p className="font-semibold mb-1">Order Note</p>
                  <p>{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN RIDER DRAWER */}
      {isAssignOpen && selectedOrder && (
        <div className="fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div
            className="flex-1 bg-black/40"
            onClick={closeAssign}
          />
          {/* Drawer */}
          <div className="w-full max-w-md bg-white shadow-2xl p-6 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Assign Rider
                </h2>
                <p className="text-xs text-gray-500">
                  ORD - {selectedOrder.id}
                </p>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={closeAssign}
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-2">
              Select a rider for this order. You can integrate this later with your
              Riders table / API.
            </p>

            <div className="space-y-2 mt-3">
              {sampleRiders.map((rider) => (
                <button
                  key={rider}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm hover:bg-emerald-50 hover:border-emerald-300 transition ${
                    selectedOrder.rider === rider
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                      : "border-gray-200 text-gray-800"
                  }`}
                  onClick={() => assignRiderToOrder(rider)}
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    {rider}
                  </span>
                  {selectedOrder.rider === rider && (
                    <span className="text-xs text-emerald-600 font-semibold">
                      Assigned
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
