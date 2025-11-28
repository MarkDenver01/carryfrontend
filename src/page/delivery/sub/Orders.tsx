import React, { useMemo, useState, useEffect } from "react";
import {
  Search,
  Eye,
  Phone,
  Truck,
  CheckCircle,
  XCircle,
  Package,
  User,
  Clock,
  Route,
} from "lucide-react";
import { motion } from "framer-motion";

// ✅ IMPORT GLOBAL RIDERS CONTEXT
import {
  useDrivers,
  type Rider,
} from "../../../context/DriverContext";

// ✅ IMPORT BACKEND API
import {
  fetchAllOrders,
  cancelOrder,
  markDelivered,
} from "../../../libs/ApiGatewayDatasource";

/* ============================================================
   TYPES
============================================================ */

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
  riderId?: string;
  rider?: string;
  scheduledTime?: string;
  distanceKm?: number;
  paymentStatus?: "Paid" | "COD" | "Unpaid";
  notes?: string;
  createdAt: string;
};

type SummaryTone = "blue" | "amber" | "indigo" | "emerald" | "red";

type ToastState =
  | {
      type: "success" | "error";
      message: string;
    }
  | null;

/* ============================================================
   CONSTANTS / HELPERS
============================================================ */

const summaryToneGradient: Record<SummaryTone, string> = {
  blue: "from-sky-500 to-sky-700",
  amber: "from-amber-500 to-amber-700",
  indigo: "from-indigo-500 to-indigo-700",
  emerald: "from-emerald-500 to-emerald-700",
  red: "from-rose-500 to-rose-700",
};

const getStatusColor = (s: OrderStatus) => {
  if (s === "Pending") return "bg-amber-100 text-amber-700";
  if (s === "Processing") return "bg-sky-100 text-sky-700";
  if (s === "In Transit") return "bg-indigo-100 text-indigo-700";
  if (s === "Delivered") return "bg-emerald-100 text-emerald-700";
  if (s === "Cancelled") return "bg-rose-100 text-rose-700";
  return "bg-gray-100 text-gray-600";
};

const getPaymentColor = (p?: Order["paymentStatus"]) => {
  if (p === "Paid") return "bg-emerald-50 text-emerald-700";
  if (p === "COD") return "bg-amber-50 text-amber-700";
  if (p === "Unpaid") return "bg-rose-50 text-rose-700";
  return "bg-gray-50 text-gray-600";
};

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function Orders() {
  // 🔹 allOrders = lahat ng orders galing backend (kasama Delivered/Cancelled)
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  // 🔹 orders = ACTIVE ORDERS lang (hindi Delivered / Cancelled)
  const [orders, setOrders] = useState<Order[]>([]);

  const [filter, setFilter] = useState<"All" | OrderStatus>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isRouteOpen, setIsRouteOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isDeliveredOpen, setIsDeliveredOpen] = useState(false);

  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  // GET RIDERS + ACTIONS
  const { riders, assignRider, completeDelivery, updateRider } = useDrivers();
  const availableRiders = riders.filter((r) => r.status === "Available");

  /* ============================================================
     🚀 LOAD REAL BACKEND ORDERS
  ============================================================= */

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadOrders() {
    try {
      setIsLoading(true);
      const raw = await fetchAllOrders();
      const mobileOnly = raw ?? [];

      const mapped: Order[] = mobileOnly.map((o: any) => ({
        id: o.orderId?.toString() ?? "",

        // Backend only returns customerId, so fallback tayo
        name: o.customerName ?? `Customer #${o.customerId}`,

        address: o.deliveryAddress ?? "No address provided",

        products:
          o.items?.map(
            (i: any) => `${i.productName ?? "Item"} x${i.quantity ?? 0}`
          ) ?? [],

        total: Number(o.totalAmount) || 0,

        status:
          o.status === "PENDING"
            ? "Pending"
            : o.status === "PROCESSING"
            ? "Processing"
            : o.status === "IN_TRANSIT"
            ? "In Transit"
            : o.status === "DELIVERED"
            ? "Delivered"
            : "Cancelled",

        paymentStatus:
          o.paymentMethod === "WALLET"
            ? "Paid"
            : o.paymentMethod === "COD"
            ? "COD"
            : "Unpaid",

        notes: o.notes,

        createdAt: o.createdAt
          ? new Date(o.createdAt).toLocaleString()
          : "Unknown date",

        riderId: o.riderId ? String(o.riderId) : undefined,
        rider: o.riderName ?? "Unassigned",
      }));

      // 🔥 FRONTEND RULE:
      // - allOrders: lahat (for summary counts & history)
      // - orders: HIDE Delivered + Cancelled from list
      const activeOnly = mapped.filter(
        (o) => o.status !== "Delivered" && o.status !== "Cancelled"
      );

      setAllOrders(mapped);
      setOrders(activeOnly);
    } catch (error: any) {
      console.error("❌ Error loading orders:", error);
      setToast({
        type: "error",
        message:
          error?.message || "Failed to load orders. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  /* ============================================================
     FILTERED ORDERS
  ============================================================= */

  const filteredOrders = useMemo(() => {
    const source =
      filter === "Delivered" || filter === "Cancelled" ? allOrders : orders;

    return source.filter((order) => {
      const matchesStatus = filter === "All" || order.status === filter;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        order.name.toLowerCase().includes(term) ||
        order.id.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [orders, allOrders, filter, searchTerm]);

  // Para sa "Showing X of Y ..." text
  const currentSource = useMemo(() => {
    if (filter === "Delivered" || filter === "Cancelled") {
      return allOrders.filter((o) => o.status === filter);
    }
    return orders;
  }, [allOrders, orders, filter]);

  /* ============================================================
     SUMMARY COUNTS
  ============================================================= */

  // 👉 Total Orders = ACTIVE orders only (bababa pag cancel/deliver)
  const totalOrders = orders.length;

  // 👉 Other stats based on ALL orders para may history view ka pa rin
  const totalPending = allOrders.filter((o) => o.status === "Pending").length;
  const totalInTransit = allOrders.filter(
    (o) => o.status === "In Transit"
  ).length;
  const totalDelivered = allOrders.filter(
    (o) => o.status === "Delivered"
  ).length;
  const totalCancelled = allOrders.filter(
    (o) => o.status === "Cancelled"
  ).length;

  /* ============================================================
     HANDLERS
  ============================================================= */

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

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

  /* ---------------- ASSIGN RIDER + UPDATE CONTEXT ---------------- */

  const assignRiderToOrder = (rider: Rider) => {
    if (!selectedOrder) return;

    // 1) UPDATE RIDER STATS (GLOBAL CONTEXT)
    assignRider(rider.id);

    // 2) UPDATE ACTIVE ORDERS LIST
    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id
          ? {
              ...o,
              rider: rider.name,
              riderId: rider.id,
              status: o.status === "Processing" ? "In Transit" : o.status,
            }
          : o
      )
    );

    // 3) UPDATE ALL ORDERS (FOR SUMMARY & HISTORY)
    setAllOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id
          ? {
              ...o,
              rider: rider.name,
              riderId: rider.id,
              status: o.status === "Processing" ? "In Transit" : o.status,
            }
          : o
      )
    );

    // 4) UPDATE SELECTED ORDER STATE
    setSelectedOrder((prev) =>
      prev
        ? {
            ...prev,
            rider: rider.name,
            riderId: rider.id,
            status:
              prev.status === "Processing" ? "In Transit" : prev.status,
          }
        : prev
    );

    setToast({
      type: "success",
      message: `Rider ${rider.name} assigned to order #${selectedOrder.id}`,
    });

    closeAssign();
  };

  /* ---------------- CANCEL ORDER ---------------- */

  const handleCancelOrder = async (orderId: string, reason: string) => {
    // Hanapin mo muna current order state bago i-update
    const currentOrder = allOrders.find((o) => o.id === orderId);
    const riderId = currentOrder?.riderId;
    const wasInTransit = currentOrder?.status === "In Transit";

    try {
      await cancelOrder(orderId, reason || "No reason provided");

      // 🧠 Update allOrders: mark as Cancelled
      setAllOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: "Cancelled" } : o
        )
      );

      // 🔥 Update active orders: REMOVE from list (bababa yung Total Orders)
      setOrders((prev) => prev.filter((o) => o.id !== orderId));

      // Kung may rider at nasa biyahe siya, ibalik sa Available (pero hindi completed)
      if (riderId && wasInTransit) {
        const rider = riders.find((r) => r.id === riderId);
        const newWorkload = rider ? Math.max(0, rider.workload - 10) : 0;

        updateRider(riderId, {
          status: "Available",
          workload: newWorkload,
        });
      }

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
      }

      setToast({
        type: "success",
        message: `Order #${orderId} has been cancelled and removed.`,
      });
    } catch (error: any) {
      console.error("❌ Cancel order failed:", error);
      setToast({
        type: "error",
        message:
          error?.message || "Failed to cancel order. Please try again.",
      });
    } finally {
      closeCancel();
    }
  };

  /* ---------------- MARK DELIVERED ---------------- */

  const handleMarkDelivered = async (
    orderId: string,
    payload: { note?: string }
  ) => {
    // Kunin muna kung sinong rider ang naka-assign
    const currentOrder = allOrders.find((o) => o.id === orderId);
    const riderId = currentOrder?.riderId;

    try {
      // ✅ CALL BACKEND TO PERSIST DELIVERED STATUS
      await markDelivered(orderId, payload);

      // 🧠 Update allOrders: mark as Delivered + note
      setAllOrders((prev) =>
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

      // 🔥 Remove from active orders list (bababa yung Total Orders)
      setOrders((prev) => prev.filter((o) => o.id !== orderId));

      // ✅ UPDATE RIDER STATS IF ANY
      if (riderId) {
        completeDelivery(riderId);
      }

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

      setToast({
        type: "success",
        message: `Order #${orderId} marked as delivered.`,
      });
    } catch (error: any) {
      console.error("❌ Mark delivered failed:", error);
      setToast({
        type: "error",
        message:
          error?.message || "Failed to mark as delivered. Please try again.",
      });
    } finally {
      closeDelivered();
    }
  };

  /* ---------------- PRIMARY CTA PER STATUS ---------------- */

  const getPrimaryActionLabel = (order: Order): string | null => {
    if (order.status === "Pending") return "Accept Order";
    if (order.status === "Processing") return "Complete & Assign Rider";
    if (order.status === "In Transit") return "Mark Delivered";
    return null;
  };

  const handlePrimaryAction = (order: Order) => {
    if (order.status === "Pending") {
      // Accept -> Processing
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id ? { ...o, status: "Processing" } : o
        )
      );

      setAllOrders((prev) =>
        prev.map((o) =>
          o.id === order.id ? { ...o, status: "Processing" } : o
        )
      );

      if (selectedOrder?.id === order.id) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: "Processing" } : prev
        );
      }

      return;
    }

    if (order.status === "Processing") {
      // Open assign rider drawer
      openAssign(order);
      return;
    }

    if (order.status === "In Transit") {
      // Mark as delivered
      openDelivered(order);
      return;
    }
  };

  const handleCloseToast = () => setToast(null);

  /* ============================================================
     RENDER
  ============================================================= */

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative p-6 md:p-8 flex flex-col gap-8 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* ---------- BACKDROP GRID + BLOB ---------- */}
      <div className="pointer-events-none absolute inset-0 -z-30">
        <div className="w-full h-full opacity-40 mix-blend-soft-light bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 opacity-[0.08] mix-blend-soft-light bg-[repeating-linear-gradient(to_bottom,rgba(15,23,42,0.9)_0px,rgba(15,23,42,0.9)_1px,transparent_1px,transparent_3px)]" />

        <motion.div
          className="absolute -top-20 -left-16 h-64 w-64 bg-emerald-500/30 blur-3xl"
          animate={{
            x: [0, 18, 8, -6, 0],
            y: [0, 8, 18, 4, 0],
            borderRadius: ["45%", "60%", "55%", "65%", "45%"],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-0 bottom-[-5rem] h-72 w-72 bg-sky-400/26 blur-3xl"
          animate={{
            x: [0, -15, -25, -8, 0],
            y: [0, -10, -16, -5, 0],
            borderRadius: ["50%", "65%", "55%", "70%", "50%"],
          }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* ---------- CURSOR SPOTLIGHT ---------- */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background: `radial-gradient(520px at ${cursorPos.x}px ${cursorPos.y}px, rgba(34,197,94,0.25), transparent 70%)`,
        }}
      />

      {/* ---------- HEADER ---------- */}
      <div className="relative flex flex-col gap-3">
        <motion.h1
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-emerald-500 to-sky-500 bg-clip-text text-transparent"
        >
          Orders Management
        </motion.h1>

        <p className="text-gray-500 text-sm max-w-xl">
          Central view for{" "}
          <span className="font-medium text-emerald-700">
            live mobile orders & deliveries
          </span>
          . Filter by status, review details, and manage riders in one flow.
        </p>

        <div className="mt-3 h-[3px] w-32 bg-gradient-to-r from-emerald-400 via-emerald-500 to-transparent rounded-full" />
      </div>

      {/* ---------- SUMMARY CARDS (CLICKABLE FILTERS) ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5 mt-2">
        <SummaryCard
          title="Total Orders"
          value={totalOrders}
          tone="indigo"
          icon={<Package className="w-6 h-6" />}
          subtitle="Active mobile orders"
          isActive={filter === "All"}
          onClick={() => setFilter("All")}
        />
        <SummaryCard
          title="Pending"
          value={totalPending}
          tone="amber"
          icon={<Clock className="w-6 h-6" />}
          subtitle="Waiting acceptance"
          isActive={filter === "Pending"}
          onClick={() => setFilter("Pending")}
        />
        <SummaryCard
          title="In Transit"
          value={totalInTransit}
          tone="blue"
          icon={<Truck className="w-6 h-6" />}
          subtitle="On the road"
          isActive={filter === "In Transit"}
          onClick={() => setFilter("In Transit")}
        />
        <SummaryCard
          title="Delivered"
          value={totalDelivered}
          tone="emerald"
          icon={<CheckCircle className="w-6 h-6" />}
          subtitle="Completed drops"
          isActive={filter === "Delivered"}
          onClick={() => setFilter("Delivered")}
        />
        <SummaryCard
          title="Cancelled"
          value={totalCancelled}
          tone="red"
          icon={<XCircle className="w-6 h-6" />}
          subtitle="Removed orders"
          isActive={filter === "Cancelled"}
          onClick={() => setFilter("Cancelled")}
        />
      </div>

      {/* ---------- SEARCH + STATUS FILTER ---------- */}
      <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full md:w-2/3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by customer name or order ID..."
              className="w-full px-4 py-2.5 bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <label className="text-xs font-medium text-gray-500">
            Status Filter
          </label>
          <select
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white/80 text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as "All" | OrderStatus)
            }
          >
            <option value="All">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* ---------- ORDERS TABLE ---------- */}
      <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md shadow-[0_18px_45px_rgba(15,23,42,0.12)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200/80 bg-slate-50/80">
          <span className="text-sm font-semibold text-slate-700">
            Orders List
          </span>
          <span className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-emerald-600">
              {filteredOrders.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {currentSource.length}
            </span>{" "}
            {filter === "All"
              ? "active mobile orders"
              : `${filter.toLowerCase()} orders`}
          </span>
        </div>

        {isLoading ? (
          <div className="py-10 flex items-center justify-center text-sm text-gray-500">
            Loading orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-sm text-gray-500">
            <div className="w-10 h-10 rounded-full border border-dashed border-emerald-400/60 flex items-center justify-center mb-2">
              <Package className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="font-medium text-gray-600">
              No orders found for this view.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Try adjusting the status filter or search keyword.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200/80">
                <tr className="text-left">
                  <Th>Order ID</Th>
                  <Th>Customer</Th>
                  <Th>Items</Th>
                  <Th>Total</Th>
                  <Th>Status</Th>
                  <Th>Payment</Th>
                  <Th>Rider</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const isTerminal =
                    order.status === "Delivered" ||
                    order.status === "Cancelled";

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <Td>
                        <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                          #{order.id}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {order.createdAt}
                        </div>
                      </Td>

                      <Td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-800 text-xs sm:text-sm">
                              {order.name}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[220px]">
                              {order.address}
                            </span>
                          </div>
                        </div>
                      </Td>

                      <Td>
                        <span className="text-slate-700 text-xs sm:text-sm">
                          {order.products.slice(0, 2).join(", ")}
                        </span>
                        {order.products.length > 2 && (
                          <span className="text-[10px] text-gray-400 ml-1">
                            +{order.products.length - 2} more
                          </span>
                        )}
                      </Td>

                      <Td>
                        <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                          ₱{order.total.toLocaleString()}
                        </span>
                      </Td>

                      <Td>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </Td>

                      <Td>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${getPaymentColor(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </Td>

                      <Td>
                        <span className="text-xs text-slate-700">
                          {order.rider && order.rider !== "Unassigned"
                            ? order.rider
                            : "Unassigned"}
                        </span>
                      </Td>

                      <Td align="right">
                        <div className="flex justify-end gap-1.5">
                          <IconActionButton
                            title="View details"
                            onClick={() => openDetails(order)}
                            variant="blue"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </IconActionButton>

                          <IconActionButton
                            title="Contact customer"
                            onClick={() => openContact(order)}
                            variant="green"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </IconActionButton>

                          <IconActionButton
                            title="View route"
                            onClick={() => openRoute(order)}
                            variant="indigo"
                          >
                            <Route className="w-3.5 h-3.5" />
                          </IconActionButton>

                          {!isTerminal && (
                            <IconActionButton
                              title="Cancel order"
                              onClick={() => openCancel(order)}
                              variant="red"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </IconActionButton>
                          )}

                          {!isTerminal && getPrimaryActionLabel(order) && (
                            <button
                              onClick={() => handlePrimaryAction(order)}
                              className="hidden sm:inline-flex px-3 py-1.5 text-[11px] rounded-full bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-sm shadow-emerald-500/30"
                            >
                              {getPrimaryActionLabel(order)}
                            </button>
                          )}
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============= TOAST ============= */}
      {toast && (
        <ToastBanner
          type={toast.type}
          message={toast.message}
          onClose={handleCloseToast}
        />
      )}

      {/* ============= DETAILS MODAL ============= */}
      {isDetailOpen && selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={closeDetails} />
      )}

      {/* ============= ASSIGN RIDER DRAWER ============= */}
      {isAssignOpen && selectedOrder && (
        <AssignRiderDrawer
          order={selectedOrder}
          availableRiders={availableRiders}
          onAssign={assignRiderToOrder}
          onClose={closeAssign}
        />
      )}

      {/* ============= ROUTE DRAWER ============= */}
      {isRouteOpen && selectedOrder && (
        <RouteDrawer order={selectedOrder} onClose={closeRoute} />
      )}

      {/* ============= CONTACT DRAWER ============= */}
      {isContactOpen && selectedOrder && (
        <ContactDrawer order={selectedOrder} onClose={closeContact} />
      )}

      {/* ============= CANCEL MODAL ============= */}
      {isCancelOpen && selectedOrder && (
        <CancelOrderModal
          order={selectedOrder}
          onConfirm={(reason) =>
            handleCancelOrder(selectedOrder.id, reason)
          }
          onClose={closeCancel}
        />
      )}

      {/* ============= DELIVERED MODAL ============= */}
      {isDeliveredOpen && selectedOrder && (
        <MarkDeliveredModal
          order={selectedOrder}
          onConfirm={(payload) =>
            handleMarkDelivered(selectedOrder.id, payload)
          }
          onClose={closeDelivered}
        />
      )}
    </motion.div>
  );
}

/* ============================================================
   SUB COMPONENTS
============================================================ */

function SummaryCard({
  title,
  value,
  tone,
  icon,
  subtitle,
  isActive,
  onClick,
}: {
  title: string;
  value: number;
  tone: SummaryTone;
  icon: React.ReactNode;
  subtitle?: string;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`relative flex flex-col p-4 rounded-xl text-white text-left bg-gradient-to-br ${summaryToneGradient[tone]} shadow-md overflow-hidden ${
        onClick ? "cursor-pointer" : "cursor-default"
      } ${isActive ? "ring-2 ring-emerald-300 shadow-lg" : ""}`}
    >
      {isActive && (
        <div className="absolute inset-0 pointer-events-none border border-emerald-200/60 rounded-xl" />
      )}

      <div className="flex items-center justify-between z-10">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium opacity-90">
            {title}
          </span>
          <span className="text-2xl font-extrabold">{value}</span>
          {subtitle && (
            <span className="text-[10px] opacity-80">{subtitle}</span>
          )}
        </div>
        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-black/10 backdrop-blur">
          {icon}
        </div>
      </div>
    </motion.button>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
}) {
  return (
    <th
      className={`px-5 py-3 text-xs font-semibold ${
        align === "right"
          ? "text-right"
          : align === "center"
          ? "text-center"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
}) {
  return (
    <td
      className={`px-5 py-3 align-middle ${
        align === "right"
          ? "text-right"
          : align === "center"
          ? "text-center"
          : "text-left"
      }`}
    >
      {children}
    </td>
  );
}

function IconActionButton({
  children,
  onClick,
  title,
  variant,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  variant: "blue" | "green" | "indigo" | "red";
}) {
  const map: Record<
    typeof variant,
    { bg: string; hover: string; text: string }
  > = {
    blue: {
      bg: "bg-sky-50",
      hover: "hover:bg-sky-100",
      text: "text-sky-700",
    },
    green: {
      bg: "bg-emerald-50",
      hover: "hover:bg-emerald-100",
      text: "text-emerald-700",
    },
    indigo: {
      bg: "bg-indigo-50",
      hover: "hover:bg-indigo-100",
      text: "text-indigo-700",
    },
    red: {
      bg: "bg-rose-50",
      hover: "hover:bg-rose-100",
      text: "text-rose-700",
    },
  };

  const c = map[variant];

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${c.bg} ${c.hover} ${c.text} text-[11px] shadow-sm`}
    >
      {children}
    </button>
  );
}

/* ---- TOAST ---- */
function ToastBanner({
  type,
  message,
  onClose,
}: {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}) {
  const isSuccess = type === "success";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.98 }}
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm ${
        isSuccess
          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
          : "bg-rose-50 text-rose-800 border border-rose-200"
      }`}
    >
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/80">
        {isSuccess ? (
          <CheckCircle className="w-4 h-4 text-emerald-600" />
        ) : (
          <XCircle className="w-4 h-4 text-rose-600" />
        )}
      </div>
      <span className="flex-1 text-xs sm:text-sm">{message}</span>
      <button
        onClick={onClose}
        className="text-[11px] font-semibold opacity-70 hover:opacity-100"
      >
        Close
      </button>
    </motion.div>
  );
}

/* ---- ORDER DETAILS ---- */
function OrderDetailsModal({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4 shadow-xl"
      >
        <h2 className="text-xl font-bold text-slate-800">Order Details</h2>

        <div className="text-sm space-y-2 text-slate-700">
          <p>
            <span className="font-medium">Order ID:</span> #{order.id}
          </p>
          <p>
            <span className="font-medium">Customer:</span> {order.name}
          </p>
          <p>
            <span className="font-medium">Address:</span> {order.address}
          </p>
          <p>
            <span className="font-medium">Items:</span>
            <br />
            {order.products.map((p, i) => (
              <div key={i} className="ml-4">
                • {p}
              </div>
            ))}
          </p>
          <p>
            <span className="font-medium">Total:</span> ₱
            {order.total.toLocaleString()}
          </p>
          <p className="flex items-center gap-2">
            <span className="font-medium">Status:</span>
            <span
              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(
                order.status
              )}`}
            >
              {order.status}
            </span>
          </p>
          <p>
            <span className="font-medium">Payment:</span>{" "}
            {order.paymentStatus}
          </p>
          <p>
            <span className="font-medium">Rider:</span>{" "}
            {order.rider || "Unassigned"}
          </p>
          <p>
            <span className="font-medium">Notes:</span>{" "}
            {order.notes || "—"}
          </p>
          <p>
            <span className="font-medium">Created:</span>{" "}
            {order.createdAt}
          </p>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ---- ASSIGN RIDER DRAWER ---- */
function AssignRiderDrawer({
  order,
  availableRiders,
  onAssign,
  onClose,
}: {
  order: Order;
  availableRiders: Rider[];
  onAssign: (rider: Rider) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm">
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        className="w-80 h-full bg-white shadow-xl p-5 flex flex-col"
      >
        <h2 className="text-lg font-bold mb-1 text-slate-800">
          Assign Rider
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Order #{order.id} • {order.name}
        </p>

        {availableRiders.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No riders available at the moment.
          </p>
        ) : (
          <ul className="space-y-2 flex-1 overflow-y-auto">
            {availableRiders.map((rider) => (
              <li
                key={rider.id}
                className="p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-emerald-50 border border-slate-100 flex items-center justify-between"
                onClick={() => onAssign(rider)}
              >
                <span className="text-sm text-slate-800">
                  {rider.name}
                </span>
                <span className="text-[10px] text-emerald-600">
                  Tap to assign
                </span>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-slate-100 rounded-lg hover:bg-slate-200 text-sm font-medium text-slate-700"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
}

/* ---- ROUTE DRAWER ---- */
function RouteDrawer({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm">
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        className="w-96 h-full bg-white shadow-xl p-5 flex flex-col"
      >
        <h2 className="text-lg font-bold mb-1 text-slate-800">
          Delivery Route
        </h2>

        <p className="text-xs text-slate-500 mb-3">
          Customer Address:
          <br />
          <span className="font-semibold text-slate-700">
            {order.address}
          </span>
        </p>

        <div className="flex-1 flex items-center justify-center">
          <div className="h-64 w-full bg-slate-100 rounded-xl flex items-center justify-center text-gray-400 text-sm border border-dashed border-slate-300">
            🗺️ Map Placeholder
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-slate-100 rounded-lg hover:bg-slate-200 text-sm font-medium text-slate-700"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
}

/* ---- CONTACT DRAWER ---- */
function ContactDrawer({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm">
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        className="w-80 h-full bg-white shadow-xl p-5 flex flex-col"
      >
        <h2 className="text-lg font-bold mb-1 text-slate-800">
          Contact Customer
        </h2>

        <p className="text-sm text-slate-600">
          <span className="font-semibold">{order.name}</span>
        </p>

        <div className="mt-4">
          <button className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium shadow-sm">
            Call Customer
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-slate-100 rounded-lg hover:bg-slate-200 text-sm font-medium text-slate-700"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
}

/* ---- CANCEL ORDER MODAL ---- */
function CancelOrderModal({
  order,
  onConfirm,
  onClose,
}: {
  order: Order;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl"
      >
        <h2 className="text-lg font-bold text-slate-900">
          Cancel Order #{order.id}
        </h2>

        <p className="text-xs text-slate-500">
          This will remove the order from the active list. You can still keep
          the record in backend as cancelled.
        </p>

        <textarea
          placeholder="Reason for cancellation..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full h-28 p-3 border rounded-lg bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-rose-400"
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 text-sm font-medium text-slate-700"
          >
            Close
          </button>
          <button
            onClick={() => onConfirm(reason)}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-sm font-semibold shadow-sm"
          >
            Confirm Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ---- MARK AS DELIVERED ---- */
function MarkDeliveredModal({
  order,
  onConfirm,
  onClose,
}: {
  order: Order;
  onConfirm: (payload: { note?: string }) => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl"
      >
        <h2 className="text-lg font-bold text-slate-900">
          Mark as Delivered
        </h2>

        <p className="text-xs text-slate-500">
          Order #{order.id}. Optionally add a note, like drop-off details or
          special remarks.
        </p>

        <textarea
          placeholder="Add delivery note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full h-28 p-3 border rounded-lg bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 text-sm font-medium text-slate-700"
          >
            Close
          </button>

          <button
            onClick={() => onConfirm({ note })}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-semibold shadow-sm"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
}
