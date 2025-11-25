import React, { useMemo, useState } from "react";
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
  Route,
} from "lucide-react";
import { motion } from "framer-motion";

// ---- Types ----
type OrderStatus =
  | "Pending"
  | "Processing"
  | "In Transit"
  | "Delivered"
  | "Cancelled";

type Order = {
  id: string;
  name: string;
  address: string;
  products: string[];
  total: number;
  status: OrderStatus;
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

// ---- Helper Color Functions ----
const getStatusColor = (s: OrderStatus) => {
  if (s === "Pending") return "bg-amber-100 text-amber-700";
  if (s === "Processing") return "bg-sky-100 text-sky-700";
  if (s === "In Transit") return "bg-indigo-100 text-indigo-700";
  if (s === "Delivered") return "bg-emerald-100 text-emerald-700";
  if (s === "Cancelled") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
};

const getStatusIcon = (s: OrderStatus) => {
  if (s === "Pending") return <Package className="w-4 h-4" />;
  if (s === "Processing") return <Package className="w-4 h-4" />;
  if (s === "In Transit") return <Truck className="w-4 h-4" />;
  if (s === "Delivered") return <CheckCircle className="w-4 h-4" />;
  if (s === "Cancelled") return <XCircle className="w-4 h-4" />;
  return <Package className="w-4 h-4" />;
};

const getPaymentColor = (p?: Order["paymentStatus"]) => {
  if (p === "Paid") return "bg-emerald-50 text-emerald-700";
  if (p === "COD") return "bg-amber-50 text-amber-700";
  if (p === "Unpaid") return "bg-red-50 text-red-700";
  return "bg-gray-50 text-gray-600";
};

// ---- Summary Card Color Type ----
type SummaryTone = "blue" | "amber" | "indigo" | "emerald" | "red";

const summaryToneGradient: Record<SummaryTone, string> = {
  blue: "from-sky-500 to-sky-700",
  amber: "from-amber-500 to-amber-700",
  indigo: "from-indigo-500 to-indigo-700",
  emerald: "from-emerald-500 to-emerald-700",
  red: "from-rose-500 to-rose-700",
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filter, setFilter] = useState<"All" | OrderStatus>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isRouteOpen, setIsRouteOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isDeliveredOpen, setIsDeliveredOpen] = useState(false);

  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  // ---- Derived values ----
  const filteredOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        (filter === "All" || order.status === filter) &&
        order.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
  }, [orders, filter, searchTerm]);

  const totalOrders = orders.length;
  const totalPending = orders.filter((o) => o.status === "Pending").length;
  const totalInTransit = orders.filter((o) => o.status === "In Transit").length;
  const totalDelivered = orders.filter((o) => o.status === "Delivered").length;
  const totalCancelled = orders.filter((o) => o.status === "Cancelled").length;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
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

  const openRoute = (order: Order) => {
    setSelectedOrder(order);
    setIsRouteOpen(true);
  };

  const openContact = (order: Order) => {
    setSelectedOrder(order);
    setIsContactOpen(true);
  };

  const openCancel = (order: Order) => {
    setSelectedOrder(order);
    setIsCancelOpen(true);
  };

  const openDelivered = (order: Order) => {
    setSelectedOrder(order);
    setIsDeliveredOpen(true);
  };

  const closeDetails = () => setIsDetailOpen(false);
  const closeAssign = () => setIsAssignOpen(false);
  const closeRoute = () => setIsRouteOpen(false);
  const closeContact = () => setIsContactOpen(false);
  const closeCancel = () => setIsCancelOpen(false);
  const closeDelivered = () => setIsDeliveredOpen(false);

  const assignRiderToOrder = (riderName: string) => {
    if (!selectedOrder) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id
          ? {
              ...o,
              rider: riderName,
              // once rider is assigned, we make sure status is In Transit
              status: o.status === "Processing" ? "In Transit" : o.status,
            }
          : o
      )
    );
    setSelectedOrder((prev) =>
      prev
        ? {
            ...prev,
            rider: riderName,
            status:
              prev.status === "Processing" ? "In Transit" : prev.status,
          }
        : prev
    );
    closeAssign();
  };

  const handleCancelOrder = (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "Cancelled",
              notes: reason
                ? `Cancelled: ${reason}`
                : o.notes || "Order has been cancelled.",
            }
          : o
      )
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              status: "Cancelled",
              notes: reason
                ? `Cancelled: ${reason}`
                : prev.notes || "Order has been cancelled.",
            }
          : prev
      );
    }
    closeCancel();
  };

  const handleMarkDelivered = (
    orderId: string,
    payload: { deliveredAt?: string; note?: string }
  ) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "Delivered",
              notes:
                payload.note && payload.note.trim().length > 0
                  ? `Delivered: ${payload.note}`
                  : o.notes || "Marked as delivered.",
            }
          : o
      )
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              status: "Delivered",
              notes:
                payload.note && payload.note.trim().length > 0
                  ? `Delivered: ${payload.note}`
                  : prev.notes || "Marked as delivered.",
            }
          : prev
      );
    }
    closeDelivered();
  };

  // ---- Single dynamic button logic ----
  const getPrimaryActionLabel = (order: Order): string | null => {
    if (order.status === "Pending") return "Accept Order";
    if (order.status === "Processing") return "Complete & Assign Rider";
    if (order.status === "In Transit") return "Mark Delivered";
    return null; // Delivered / Cancelled = no main button
  };

  const handlePrimaryAction = (order: Order) => {
    if (order.status === "Pending") {
      // Pending -> Processing
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? {
                ...o,
                status: "Processing",
              }
            : o
        )
      );
      if (selectedOrder?.id === order.id) {
        setSelectedOrder((prev) =>
          prev
            ? {
                ...prev,
                status: "Processing",
              }
            : prev
        );
      }
      return;
    }

    if (order.status === "Processing") {
      // Processing -> open Assign Rider (and we also consider it "In Transit"
      // once rider chosen; status updates in assignRiderToOrder)
      openAssign(order);
      return;
    }

    if (order.status === "In Transit") {
      // In Transit -> Mark Delivered modal
      openDelivered(order);
      return;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative p-6 md:p-8 flex flex-col gap-8 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* ---------- GLOBAL HUD BACKDROP ---------- */}
      <div className="pointer-events-none absolute inset-0 -z-30">
        {/* Grid background */}
        <div className="w-full h-full opacity-40 mix-blend-soft-light bg-[linear-gradient(to_right,rgba(148,163,184,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.15)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Scanlines */}
        <div className="absolute inset-0 opacity-[0.08] mix-blend-soft-light bg-[repeating-linear-gradient(to_bottom,rgba(15,23,42,0.85)_0px,rgba(15,23,42,0.85)_1px,transparent_1px,transparent_3px)]" />

        {/* Ambient blobs */}
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

      {/* Cursor spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background: `radial-gradient(550px at ${cursorPos.x}px ${cursorPos.y}px, rgba(34,197,94,0.26), transparent 70%)`,
        }}
        animate={{ opacity: [0.7, 1, 0.85] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* ---------- PAGE HEADER ---------- */}
      <div className="relative flex flex-col gap-3">
        <motion.h1
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-600 bg-clip-text text-transparent"
        >
          Orders Management
        </motion.h1>

        <p className="text-gray-500 text-sm max-w-xl">
          Monitor{" "}
          <span className="font-medium text-emerald-700">
            delivery &amp; orders control center
          </span>
          . Track pipelines, riders, and order health in one view.
        </p>

        <div className="mt-3 h-[3px] w-24 bg-gradient-to-r from-emerald-400 via-emerald-500 to-transparent rounded-full" />
      </div>

      {/* ---------- MAIN HUD CONTAINER ---------- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative rounded-[26px] border border-emerald-500/30 bg-white/90 shadow-[0_22px_70px_rgba(15,23,42,0.40)] overflow-hidden"
      >
        {/* HUD corner brackets */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-3 left-3 h-5 w-5 border-t-2 border-l-2 border-emerald-400/80" />
          <div className="absolute top-3 right-3 h-5 w-5 border-t-2 border-r-2 border-emerald-400/80" />
          <div className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-emerald-400/80" />
          <div className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-emerald-400/80" />
        </div>

        <div className="relative flex flex-col gap-8 p-5 md:p-6 lg:p-7">
          {/* Scanner line */}
          <motion.div
            className="pointer-events-none absolute top-10 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent opacity-70"
            animate={{ x: ["-20%", "20%", "-20%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* ---------- TOP CONTROLS + SUMMARY ---------- */}
          <div className="flex flex-col gap-6">
            {/* Status Tabs + Filter + Search */}
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
              {/* Status Tabs */}
              <div className="flex gap-3 overflow-x-auto pb-1">
                {[
                  "All",
                  "Pending",
                  "Processing",
                  "In Transit",
                  "Delivered",
                  "Cancelled",
                ].map((tab) => (
                  <button
                    key={tab}
                    onClick={() =>
                      setFilter(tab as "All" | OrderStatus)
                    }
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border transition whitespace-nowrap ${
                      filter === tab
                        ? "bg-slate-900 text-emerald-100 border-emerald-400 shadow-lg shadow-emerald-500/40"
                        : "bg-white/90 border-gray-300 text-gray-700 hover:bg-emerald-50"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Filter label + Search */}
              <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-end">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Filter className="w-4 h-4 text-emerald-600" />
                  <span>
                    Showing:{" "}
                    <span className="font-semibold text-gray-800">
                      {filter}
                    </span>
                  </span>
                </div>

                <div className="relative w-full md:w-64">
                  <input
                    type="text"
                    placeholder="Search customer name..."
                    className="w-full border border-emerald-300/80 rounded-xl px-4 py-2 pl-11 shadow-sm bg-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 text-emerald-500 w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <OrdersSummaryCard
                icon={<Package size={38} />}
                label="Total Orders"
                value={totalOrders.toString()}
                accent="All orders in the current cycle"
                tone="blue"
              />
              <OrdersSummaryCard
                icon={<Package size={38} />}
                label="Pending"
                value={totalPending.toString()}
                accent="Waiting to be processed"
                tone="amber"
              />
              <OrdersSummaryCard
                icon={<Truck size={38} />}
                label="In Transit"
                value={totalInTransit.toString()}
                accent="Currently on the road"
                tone="indigo"
              />
              <OrdersSummaryCard
                icon={<CheckCircle size={38} />}
                label="Delivered"
                value={totalDelivered.toString()}
                accent="Successfully completed deliveries"
                tone="emerald"
              />
              <OrdersSummaryCard
                icon={<XCircle size={38} />}
                label="Cancelled"
                value={totalCancelled.toString()}
                accent="Failed / cancelled orders"
                tone="red"
              />
            </section>
          </div>

          {/* Divider */}
          <div className="relative h-px w-full bg-gradient-to-r from-transparent via-gray-300/90 to-transparent" />

          {/* ---------- MAIN GRID: ORDER CARDS + SIDE INSIGHTS ---------- */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* ORDER LIST */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="xl:col-span-8"
            >
              {filteredOrders.length === 0 && (
                <div className="bg-white/90 border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-500 shadow-[0_10px_35px_rgba(15,23,42,0.12)]">
                  <p className="font-semibold mb-1">No orders found</p>
                  <p className="text-sm">
                    Try adjusting filters or searching for a different customer.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredOrders.map((order) => {
                  const primaryLabel = getPrimaryActionLabel(order);
                  return (
                    <motion.div
                      key={order.id}
                      whileHover={{
                        y: -4,
                        scale: 1.01,
                        boxShadow: "0 22px 60px rgba(15,23,42,0.35)",
                      }}
                      transition={{ duration: 0.25 }}
                      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_14px_45px_rgba(15,23,42,0.18)] flex flex-col gap-3"
                    >
                      {/* HEADER */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <User className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">
                              {order.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              ORD - {order.id}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              Created: {order.createdAt}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`flex items-center gap-1 px-3 py-1 text-[11px] font-semibold rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusIcon(order.status)}
                            {order.status}
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
                          <p className="text-xs text-gray-500">
                            Assigned Rider
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            {order.rider ?? "Unassigned"}
                          </p>
                        </div>
                      </div>

                      {/* NOTES */}
                      {order.notes && (
                        <p className="text-xs text-gray-600 bg-amber-50 border border-amber-100 rounded-lg p-2 mt-1">
                          <span className="font-semibold">Note: </span>
                          {order.notes}
                        </p>
                      )}

                      {/* ACTIONS */}
                      <div className="mt-4 flex flex-col gap-2 text-[11px] sm:text-xs">
                        {/* MAIN SINGLE BUTTON (DYNAMIC) */}
                        {primaryLabel && (
                          <button
                            className="w-full bg-slate-900 text-emerald-100 px-3 py-2 rounded-xl font-semibold hover:bg-emerald-700 hover:text-white transition flex items-center justify-center gap-1"
                            onClick={() => handlePrimaryAction(order)}
                          >
                            {order.status === "Pending" && (
                              <Package className="w-4 h-4" />
                            )}
                            {order.status === "Processing" && (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            {order.status === "In Transit" && (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            {primaryLabel}
                          </button>
                        )}

                        {/* SECONDARY ACTIONS (kept but toned down) */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            className="w-full bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl font-semibold hover:bg-emerald-100 transition flex items-center justify-center gap-1"
                            onClick={() => openDetails(order)}
                          >
                            <Eye className="w-4 h-4" /> View Details
                          </button>
                          <button
                            className="w-full bg-indigo-50 text-indigo-700 px-3 py-2 rounded-xl font-semibold hover:bg-indigo-100 transition flex items-center justify-center gap-1"
                            onClick={() => openRoute(order)}
                          >
                            <Truck className="w-4 h-4" /> View Route
                          </button>
                          <button
                            className="w-full bg-orange-50 text-orange-700 px-3 py-2 rounded-xl font-semibold hover:bg-orange-100 transition flex items-center justify-center gap-1"
                            onClick={() => openContact(order)}
                          >
                            <Phone className="w-4 h-4" /> View Contact
                          </button>
                          <button
                            className="w-full bg-red-50 text-red-700 px-3 py-2 rounded-xl font-semibold hover:bg-red-100 transition flex items-center justify-center gap-1"
                            onClick={() => openCancel(order)}
                          >
                            <XCircle className="w-4 h-4" /> Cancel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* SIDE PANE: SIMPLE INSIGHTS / KEY METRICS */}
            <div className="xl:col-span-4 flex flex-col gap-5">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-gradient-to-br from-emerald-600 via-teal-500 to-emerald-700 rounded-2xl p-5 shadow-[0_18px_55px_rgba(16,185,129,0.5)] text-white relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.45),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.45),transparent_55%)]" />

                <div className="relative flex items-center gap-3 mb-4">
                  <div className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-emerald-100" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Live Delivery Snapshot</h2>
                    <p className="text-xs text-emerald-100">
                      Quick overview of today&apos;s delivery pipeline.
                    </p>
                  </div>
                </div>

                <div className="relative grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/10 rounded-xl px-3 py-2.5 border border-white/15">
                    <p className="text-emerald-100 mb-1">On the road</p>
                    <p className="text-2xl font-bold">
                      {totalInTransit || 0}
                    </p>
                    <p className="text-[0.7rem] text-emerald-100/80">
                      Currently in transit.
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-xl px-3 py-2.5 border border-white/15">
                    <p className="text-emerald-100 mb-1">Pending queue</p>
                    <p className="text-2xl font-bold">
                      {totalPending || 0}
                    </p>
                    <p className="text-[0.7rem] text-emerald-100/80">
                      Waiting for riders / packing.
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-xl px-3 py-2.5 border border-white/15">
                    <p className="text-emerald-100 mb-1">Success rate</p>
                    <p className="text-2xl font-bold">
                      {totalOrders === 0
                        ? "0%"
                        : `${Math.round(
                            (totalDelivered / totalOrders) * 100
                          )}%`}
                    </p>
                    <p className="text-[0.7rem] text-emerald-100/80">
                      Delivered vs total orders.
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-xl px-3 py-2.5 border border-white/15">
                    <p className="text-emerald-100 mb-1">At risk</p>
                    <p className="text-2xl font-bold">
                      {totalPending + totalInTransit}
                    </p>
                    <p className="text-[0.7rem] text-emerald-100/80">
                      Orders that still need attention.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        </div>
      </motion.div>

      {/* ---------- VIEW DETAILS DRAWER (GLASS HUD) ---------- */}
      {isDetailOpen && selectedOrder && (
        <div className="fixed inset-0 z-40 flex items-stretch">
          {/* Overlay */}
          <div
            className="flex-1 bg-slate-950/70 backdrop-blur-sm"
            onClick={closeDetails}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-md bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-l border-emerald-500/40 text-slate-50 shadow-[0_25px_80px_rgba(15,23,42,0.9)] p-6 overflow-y-auto relative"
          >
            <div className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.35),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.35),transparent_55%)]" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-50 flex items-center gap-2">
                    <span className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Package className="w-4 h-4 text-emerald-400" />
                    </span>
                    Order Details
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    ORD - {selectedOrder.id}
                  </p>
                </div>
                <button
                  className="text-slate-400 hover:text-slate-100 text-sm px-2 py-1 rounded-full bg-slate-800/60 border border-slate-600/70"
                  onClick={closeDetails}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-700/80">
                  <p className="text-xs text-slate-400 mb-1">Customer</p>
                  <p className="font-semibold text-slate-50">
                    {selectedOrder.name}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                    <MapPin className="w-4 h-4 text-emerald-400" />
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
                  <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-700/80">
                    <p className="text-xs text-slate-400 mb-1">Schedule</p>
                    <p className="flex items-center gap-2 text-sm text-slate-100">
                      <Clock className="w-4 h-4 text-slate-300" />
                      {selectedOrder.scheduledTime}
                    </p>
                  </div>
                )}

                <div className="border border-slate-700/80 rounded-xl p-3 bg-slate-900/70">
                  <p className="text-xs font-semibold text-slate-200 mb-1">
                    Items
                  </p>
                  <ul className="list-disc list-inside text-xs text-slate-200 space-y-1">
                    {selectedOrder.products.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-between items-center border rounded-xl p-3 bg-slate-900/70 border-slate-700/80">
                  <div>
                    <p className="text-xs text-slate-400">Total Amount</p>
                    <p className="font-bold text-lg text-emerald-300">
                      ₱{selectedOrder.total.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Assigned Rider</p>
                    <p className="text-sm font-semibold text-slate-100">
                      {selectedOrder.rider ?? "Unassigned"}
                    </p>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="border rounded-xl p-3 bg-amber-900/30 border-amber-600/50 text-xs text-amber-100">
                    <p className="font-semibold mb-1 text-amber-200">
                      Order Note
                    </p>
                    <p>{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ---------- ASSIGN RIDER DRAWER (GLASS HUD) ---------- */}
      {isAssignOpen && selectedOrder && (
        <div className="fixed inset-0 z-40 flex items-stretch">
          {/* Overlay */}
          <div
            className="flex-1 bg-slate-950/70 backdrop-blur-sm"
            onClick={closeAssign}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-md bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-l border-emerald-500/40 text-slate-50 shadow-[0_25px_80px_rgba(15,23,42,0.9)] p-6 overflow-y-auto relative"
          >
            <div className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.35),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.35),transparent_55%)]" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-50 flex items-center gap-2">
                    <span className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-emerald-400" />
                    </span>
                    Assign Rider
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    ORD - {selectedOrder.id}
                  </p>
                </div>
                <button
                  className="text-slate-400 hover:text-slate-100 text-sm px-2 py-1 rounded-full bg-slate-800/60 border border-slate-600/70"
                  onClick={closeAssign}
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-400 mb-3">
                Select a rider for this order. This can later be wired to your
                Riders table or dispatching API.
              </p>

              <div className="space-y-2 mt-3">
                {sampleRiders.map((rider) => (
                  <button
                    key={rider}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition ${
                      selectedOrder.rider === rider
                        ? "border-emerald-500 bg-emerald-900/40 text-emerald-100"
                        : "border-slate-600/80 bg-slate-900/40 text-slate-100 hover:bg-slate-800/70"
                    }`}
                    onClick={() => assignRiderToOrder(rider)}
                  >
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-400" />
                      {rider}
                    </span>
                    {selectedOrder.rider === rider && (
                      <span className="text-xs text-emerald-300 font-semibold">
                        Assigned
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ---------- VIEW ROUTE MODAL ---------- */}
      <RouteModal
        isOpen={isRouteOpen}
        order={selectedOrder}
        onClose={closeRoute}
      />

      {/* ---------- VIEW CONTACT MODAL ---------- */}
      <ContactModal
        isOpen={isContactOpen}
        order={selectedOrder}
        onClose={closeContact}
      />

      {/* ---------- CANCEL ORDER MODAL ---------- */}
      <CancelOrderModal
        isOpen={isCancelOpen}
        order={selectedOrder}
        onClose={closeCancel}
        onConfirm={handleCancelOrder}
      />

      {/* ---------- MARK DELIVERED MODAL ---------- */}
      <MarkDeliveredModal
        isOpen={isDeliveredOpen}
        order={selectedOrder}
        onClose={closeDelivered}
        onConfirm={handleMarkDelivered}
      />
    </motion.div>
  );
}

/* ============================================================
   SUB COMPONENTS
============================================================ */

function OrdersSummaryCard({
  icon,
  label,
  value,
  accent,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
  tone: SummaryTone;
}) {
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
      className={`relative p-5 rounded-2xl border border-white/40 text-white bg-gradient-to-br ${summaryToneGradient[tone]} shadow-xl overflow-hidden`}
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
          <p className="text-[0.7rem] text-white/80 mt-1">{accent}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   MODALS
============================================================ */

function RouteModal({
  isOpen,
  order,
  onClose,
}: {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
}) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-emerald-500/40 shadow-[0_24px_80px_rgba(15,23,42,0.9)] p-5 md:p-6 relative overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.4),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.35),transparent_55%)]" />
        <div className="relative z-10 space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-50 flex items-center gap-2">
                <span className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Route className="w-4 h-4 text-emerald-400" />
                </span>
                Route tracker
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                ORD - {order.id} • {order.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-100 text-sm px-2 py-1 rounded-full bg-slate-800/60 border border-slate-600/70"
            >
              ✕
            </button>
          </div>

          {/* Map placeholder */}
          <div className="mt-2 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="relative rounded-xl overflow-hidden border border-emerald-500/40 bg-slate-900/80 h-64 md:h-72">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.6),transparent_60%),radial-gradient(circle_at_bottom,rgba(15,23,42,1),rgba(15,23,42,1))]" />
                <div className="relative z-10 w-full h-full">
                  <div className="absolute inset-6 border border-dashed border-emerald-300/40 rounded-3xl" />
                  <div className="absolute inset-0 opacity-30 bg-[linear-gradient(to_right,rgba(148,163,184,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
                  <div className="absolute left-10 bottom-10 flex flex-col gap-2 text-xs text-emerald-100">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-950/70 border border-emerald-300/40">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      Current rider location
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-950/70 border border-sky-300/40">
                      <span className="h-2 w-2 rounded-full bg-sky-400" />
                      Customer drop-off point
                    </span>
                  </div>

                  {/* Fake route line */}
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 400 260"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M40,220 C120,190 140,160 190,150 C250,135 280,110 340,60"
                      stroke="rgba(56,189,248,0.8)"
                      strokeWidth="3"
                      strokeDasharray="4 6"
                      fill="none"
                    />
                  </svg>

                  {/* Origin + destination pins */}
                  <div className="absolute left-[10%] bottom-[20%] flex flex-col items-center gap-1">
                    <div className="h-7 w-7 rounded-full bg-emerald-400 flex items-center justify-center text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/60">
                      R
                    </div>
                    <span className="text-[10px] text-emerald-100/90">
                      Rider
                    </span>
                  </div>
                  <div className="absolute right-[10%] top-[20%] flex flex-col items-center gap-1">
                    <div className="h-7 w-7 rounded-full bg-sky-400 flex items-center justify-center text-slate-950 text-xs font-bold shadow-lg shadow-sky-500/60">
                      C
                    </div>
                    <span className="text-[10px] text-emerald-100/90">
                      Customer
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Route details */}
            <div className="space-y-3 text-xs text-slate-200">
              <div className="bg-slate-900/70 border border-slate-700/70 rounded-xl p-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400 mb-1">
                  route summary
                </p>
                <p className="font-semibold text-sm mb-1">
                  {order.address.split(",")[0]}
                </p>
                <p className="text-[11px] text-slate-400 mb-2">
                  {order.address}
                </p>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="inline-flex items-center gap-1">
                    <Route className="w-3 h-3 text-emerald-300" />
                    Est. distance:
                  </span>
                  <span className="font-semibold text-emerald-300">
                    {order.distanceKm
                      ? `${order.distanceKm.toFixed(1)} km`
                      : "~ – km"}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/70 border border-slate-700/70 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">
                    Assigned rider
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-200 font-semibold">
                    <User className="w-3 h-3" />
                    {order.rider ?? "Unassigned"}
                  </span>
                </div>
                {order.scheduledTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">
                      Target schedule
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-sky-200">
                      <Clock className="w-3 h-3" />
                      {order.scheduledTime}
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-emerald-900/40 border border-emerald-500/40 rounded-xl p-3 text-[11px] text-emerald-50">
                <p className="font-semibold mb-1 text-emerald-100">
                  Integration note
                </p>
                <p>
                  This map is a UI placeholder. You can later bind this section
                  to Google Maps / Mapbox using the order&apos;s coordinates and
                  rider live location.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ContactModal({
  isOpen,
  order,
  onClose,
}: {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
}) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 18 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-emerald-500/40 shadow-[0_24px_80px_rgba(15,23,42,0.9)] p-5 relative overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.45),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.35),transparent_55%)]" />

        <div className="relative z-10 space-y-4 text-sm text-slate-100">
          {/* Header */}
          <div className="flex justify-between items-start gap-3">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-amber-300" />
                </span>
                Contact details
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                ORD - {order.id} • {order.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-100 text-sm px-2 py-1 rounded-full bg-slate-800/60 border border-slate-600/70"
            >
              ✕
            </button>
          </div>

          {/* Contact info */}
          <div className="bg-slate-900/70 border border-slate-700/80 rounded-xl p-3 space-y-2">
            <div>
              <p className="text-[11px] text-slate-400 mb-1">Customer name</p>
              <p className="text-sm font-semibold">{order.name}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 mb-1">
                Delivery address
              </p>
              <p className="text-xs text-slate-200 flex gap-2 items-start">
                <MapPin className="w-3 h-3 text-emerald-400 mt-[2px]" />
                {order.address}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 mb-1">
                Preferred instructions
              </p>
              <p className="text-xs text-slate-200">
                {order.notes ?? "No special notes recorded for this customer."}
              </p>
            </div>
          </div>

          {/* Quick actions (mock only) */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-emerald-50 font-semibold transition border border-emerald-400/70">
              <Phone className="w-3 h-3" />
              Call customer
            </button>
            <button className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-100 font-semibold transition border border-slate-600/80">
              <span className="text-[10px]">SMS</span>
              Send text
            </button>
            <button className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-[11px] transition border border-slate-600/80">
              Copy contact &amp; address
            </button>
          </div>

          <p className="text-[11px] text-slate-500">
            This panel is purely UI. You can wire the buttons to your SMS /
            tel: link / VOIP integration later.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function CancelOrderModal({
  isOpen,
  order,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onConfirm: (orderId: string, reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  React.useEffect(() => {
    if (isOpen) {
      setReason("");
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 18 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-red-500/50 shadow-[0_24px_80px_rgba(127,29,29,0.9)] p-5 relative overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,rgba(248,113,113,0.45),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(30,64,175,0.4),transparent_55%)]" />

        <div className="relative z-10 space-y-4 text-sm text-slate-100">
          {/* Header */}
          <div className="flex justify-between items-start gap-3">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2 text-red-100">
                <span className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-red-300" />
                </span>
                Cancel order
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                ORD - {order.id} • {order.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-100 text-sm px-2 py-1 rounded-full bg-slate-800/60 border border-slate-600/70"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-300">
            You&apos;re about to mark this order as{" "}
            <span className="font-semibold text-red-300">Cancelled</span>.
            Please provide a short reason. This will be attached as an internal
            note and can also be shown to the customer.
          </p>

          <div>
            <label className="text-[11px] text-slate-300 mb-1 block">
              Cancellation reason
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 text-xs text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/70 focus:border-red-500/70 resize-none h-24"
              placeholder="Example: Customer unavailable / address cannot be located / payment declined..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 text-xs">
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl border border-slate-600 bg-slate-900/80 text-slate-100 hover:bg-slate-800 transition"
            >
              Back
            </button>
            <button
              onClick={() => onConfirm(order.id, reason.trim())}
              className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-semibold transition border border-red-300 text-xs"
            >
              Confirm cancel
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MarkDeliveredModal({
  isOpen,
  order,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onConfirm: (
    orderId: string,
    payload: { deliveredAt?: string; note?: string }
  ) => void;
}) {
  const [note, setNote] = useState("");
  const [deliveredAt, setDeliveredAt] = useState("");

  React.useEffect(() => {
    if (isOpen) {
      setNote("");
      const now = new Date();
      setDeliveredAt(now.toLocaleString());
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 18 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-emerald-500/60 shadow-[0_24px_80px_rgba(6,95,70,0.9)] p-5 relative overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.45),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.35),transparent_55%)]" />

        <div className="relative z-10 space-y-4 text-sm text-slate-100">
          {/* Header */}
          <div className="flex justify-between items-start gap-3">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2 text-emerald-100">
                <span className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                </span>
                Mark as delivered
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                ORD - {order.id} • {order.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-100 text-sm px-2 py-1 rounded-full bg-slate-800/60 border border-slate-600/70"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-300">
            Confirm that this order has been successfully delivered to the
            customer. You can add a short note for audit / reference (e.g. who
            received it, building / gate instructions, etc.).
          </p>

          <div className="space-y-2">
            <div>
              <label className="text-[11px] text-slate-300 mb-1 block">
                Delivered at
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/60 text-xs text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500/70"
                value={deliveredAt}
                onChange={(e) => setDeliveredAt(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-300 mb-1 block">
                Delivery note (optional)
              </label>
              <textarea
                className="w-full rounded-xl border border-slate-700 bg-slate-950/60 text-xs text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500/70 resize-none h-24"
                placeholder="Example: Received by security guard / left at front desk / photo proof captured..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 text-xs">
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl border border-slate-600 bg-slate-900/80 text-slate-100 hover:bg-slate-800 transition"
            >
              Back
            </button>
            <button
              onClick={() =>
                onConfirm(order.id, {
                  deliveredAt: deliveredAt.trim(),
                  note: note.trim(),
                })
              }
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition border border-emerald-300 text-xs"
            >
              Confirm delivered
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
