import React, { useMemo, useState } from "react";
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
import { useDrivers } from "../../../context/DriverContext";

// ✅ IMPORT BACKEND API
import { fetchAllOrders } from "../../../libs/ApiGatewayDatasource";

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
  scheduledTime?: string;
  rider?: string;
  distanceKm?: number;
  paymentStatus?: "Paid" | "COD" | "Unpaid";
  notes?: string;
  createdAt: string;
};

type SummaryTone = "blue" | "amber" | "indigo" | "emerald" | "red";

/* ============================================================
   CONSTANTS
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
  if (s === "Cancelled") return "bg-red-100 text-red-700";
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
  // ✅ Orders from backend only
  const [orders, setOrders] = useState<Order[]>([]);

  const [filter, setFilter] = useState<"All" | OrderStatus>("All");
  const [activeCard, setActiveCard] = useState<"All" | OrderStatus>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isRouteOpen, setIsRouteOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isDeliveredOpen, setIsDeliveredOpen] = useState(false);

  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  // GET RIDERS
  const { riders } = useDrivers();
  const availableRiders = riders.filter((r) => r.status === "Available");

  /* ============================================================
     🚀 LOAD REAL BACKEND ORDERS
     (NO CHANGE TO BACKEND CALL)
  ============================================================= */

  React.useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const raw = await fetchAllOrders();

      const mapped: Order[] = raw
        .map((o: any): Order | null => {
          // ❗ Skip invalid / dummy orders
          if (!o || !o.orderId || !o.customerName) {
            return null;
          }

          const status: OrderStatus =
            o.status === "PENDING"
              ? "Pending"
              : o.status === "PROCESSING"
              ? "Processing"
              : o.status === "IN_TRANSIT"
              ? "In Transit"
              : o.status === "DELIVERED"
              ? "Delivered"
              : "Cancelled";

          const paymentStatus: Order["paymentStatus"] =
            o.paymentMethod === "WALLET"
              ? "Paid"
              : o.paymentMethod === "COD"
              ? "COD"
              : "Unpaid";

          return {
            id: o.orderId?.toString(),
            name: o.customerName,
            address: o.deliveryAddress || "No address provided",
            products: o.items
              ? o.items.map(
                  (i: any) =>
                    `${i.productName ?? "Item"} x${i.quantity ?? 1}`
                )
              : [],
            total: Number(o.totalAmount) || 0,
            status,
            paymentStatus,
            notes: o.notes,
            createdAt: o.createdAt
              ? new Date(o.createdAt).toLocaleString()
              : "Unknown date",
            rider: "Unassigned",
            distanceKm: undefined,
            scheduledTime: undefined,
          };
        })
        .filter((o: Order | null): o is Order => o !== null);

      setOrders(mapped);
    } catch (error) {
      console.error("Failed to load orders: ", error);
    }
  }

  /* ============================================================
     FILTERED DATA + METRICS
  ============================================================= */

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const matchesStatus =
          filter === "All" || order.status === filter;

        const matchesSearch = order.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase().trim());

        return matchesStatus && matchesSearch;
      }),
    [orders, filter, searchTerm]
  );

  const totalOrders = orders.length;
  const totalPending = orders.filter((o) => o.status === "Pending").length;
  const totalProcessing = orders.filter(
    (o) => o.status === "Processing"
  ).length;
  const totalInTransit = orders.filter(
    (o) => o.status === "In Transit"
  ).length;
  const totalDelivered = orders.filter(
    (o) => o.status === "Delivered"
  ).length;
  const totalCancelled = orders.filter(
    (o) => o.status === "Cancelled"
  ).length;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleCardClick = (status: "All" | OrderStatus) => {
    // toggle behavior: if already selected → back to "All"
    if (activeCard === status) {
      setActiveCard("All");
      setFilter("All");
      return;
    }
    setActiveCard(status);
    setFilter(status);
  };

  /* ----------------- ACTIONS ----------------- */

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

  const getPrimaryActionLabel = (order: Order): string | null => {
    if (order.status === "Pending") return "Accept Order";
    if (order.status === "Processing") return "Complete & Assign Rider";
    if (order.status === "In Transit") return "Mark Delivered";
    return null;
  };

  const handlePrimaryAction = (order: Order) => {
    if (order.status === "Pending") {
      setOrders((prev) =>
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
      openAssign(order);
      return;
    }

    if (order.status === "In Transit") {
      openDelivered(order);
      return;
    }
  };

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
        <div className="w-full h-full opacity-40 mix-blend-soft-light bg-[linear-gradient(to_right,rgba(148,163,184,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.15)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 opacity-[0.08] mix-blend-soft-light bg-[repeating-linear-gradient(to_bottom,rgba(15,23,42,0.85)_0px,rgba(15,23,42,0.85)_1px,transparent_1px,transparent_3px)]" />

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

      {/* ---------- CURSOR SPOTLIGHT ---------- */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background: `radial-gradient(550px at ${cursorPos.x}px ${cursorPos.y}px, rgba(34,197,94,0.26), transparent 70%)`,
        }}
      />

      {/* ---------- HEADER ---------- */}
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
            live customer orders, delivery status, and payment health
          </span>{" "}
          in one premium dashboard view.
        </p>

        <div className="mt-3 h-[3px] w-24 bg-gradient-to-r from-emerald-400 via-emerald-500 to-transparent rounded-full" />
      </div>

      {/* ---------- SUMMARY CARDS (CLICKABLE FILTERS) ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mt-2">
        <SummaryCard
          title="Total Orders"
          value={totalOrders}
          subtitle="All statuses"
          tone="indigo"
          icon={<Package className="w-6 h-6" />}
          isActive={activeCard === "All"}
          onClick={() => handleCardClick("All")}
        />
        <SummaryCard
          title="Pending"
          value={totalPending}
          subtitle="Waiting confirmation"
          tone="amber"
          icon={<Clock className="w-6 h-6" />}
          isActive={activeCard === "Pending"}
          onClick={() => handleCardClick("Pending")}
        />
        <SummaryCard
          title="Processing"
          value={totalProcessing}
          subtitle="Being prepared"
          tone="blue"
          icon={<Package className="w-6 h-6" />}
          isActive={activeCard === "Processing"}
          onClick={() => handleCardClick("Processing")}
        />
        <SummaryCard
          title="In Transit"
          value={totalInTransit}
          subtitle="On the way"
          tone="blue"
          icon={<Truck className="w-6 h-6" />}
          isActive={activeCard === "In Transit"}
          onClick={() => handleCardClick("In Transit")}
        />
        <SummaryCard
          title="Delivered"
          value={totalDelivered}
          subtitle="Successfully completed"
          tone="emerald"
          icon={<CheckCircle className="w-6 h-6" />}
          isActive={activeCard === "Delivered"}
          onClick={() => handleCardClick("Delivered")}
        />
        {/* Optional: Cancelled card could replace processing if you prefer 5 only.
            Or keep 6 cards by adjusting grid. */}
      </div>

      {/* Status overview & search/filter */}
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-xs md:text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-800">
              {filteredOrders.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-800">
              {totalOrders}
            </span>{" "}
            orders
            {filter !== "All" && (
              <>
                {" "}
                for status{" "}
                <span className="font-semibold text-emerald-700">
                  {filter}
                </span>
              </>
            )}
            .
          </p>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none md:w-64">
              <input
                type="text"
                placeholder="Search by customer name..."
                className="w-full px-4 py-2.5 bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute right-3 top-2.5 text-gray-400 w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* ---------- ORDERS TABLE ---------- */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-md shadow-lg">
        <div className="border-b border-gray-100 px-6 py-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">
            Orders List
          </p>
          <span className="text-xs text-gray-400">
            Updated in real-time from mobile orders
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50/90 text-gray-500 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Order</th>
                <th className="px-6 py-3 text-left font-semibold">
                  Customer
                </th>
                <th className="px-6 py-3 text-left font-semibold">
                  Items
                </th>
                <th className="px-6 py-3 text-left font-semibold">
                  Total
                </th>
                <th className="px-6 py-3 text-left font-semibold">
                  Status
                </th>
                <th className="px-6 py-3 text-left font-semibold">
                  Payment
                </th>
                <th className="px-6 py-3 text-left font-semibold">
                  Rider
                </th>
                <th className="px-6 py-3 text-left font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-10 text-center text-gray-400 text-sm"
                  >
                    No orders found for the selected filter/search.
                  </td>
                </tr>
              )}

              {filteredOrders.map((order, idx) => (
                <tr
                  key={order.id}
                  className={`hover:bg-gray-50/80 transition-colors ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                  }`}
                >
                  {/* Order / date */}
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        #{order.id}
                      </span>
                      <span className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {order.createdAt}
                      </span>
                    </div>
                  </td>

                  {/* Customer + address */}
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-emerald-50 flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <span className="font-medium text-gray-800 text-sm">
                          {order.name}
                        </span>
                      </div>
                      <p className="ml-9 text-xs text-gray-500 line-clamp-2">
                        {order.address}
                      </p>
                    </div>
                  </td>

                  {/* Items summary */}
                  <td className="px-6 py-4 align-top">
                    {order.products.length === 0 ? (
                      <span className="text-xs text-gray-400">
                        No items
                      </span>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-700">
                          {order.products.slice(0, 2).join(", ")}
                        </span>
                        {order.products.length > 2 && (
                          <button
                            className="text-[11px] text-emerald-700 font-medium hover:underline text-left"
                            onClick={() => openDetails(order)}
                          >
                            +{order.products.length - 2} more • View
                            details
                          </button>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Total */}
                  <td className="px-6 py-4 align-top font-semibold text-gray-900">
                    ₱{order.total.toLocaleString()}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 align-top">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                      {order.status}
                    </span>
                  </td>

                  {/* Payment */}
                  <td className="px-6 py-4 align-top">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold ${getPaymentColor(
                        order.paymentStatus
                      )}`}
                    >
                      {order.paymentStatus ?? "N/A"}
                    </span>
                  </td>

                  {/* Rider */}
                  <td className="px-6 py-4 align-top text-sm text-gray-700">
                    {order.rider || "—"}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => openDetails(order)}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openContact(order)}
                        className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100"
                      >
                        <Phone className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openRoute(order)}
                        className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100"
                      >
                        <Route className="w-4 h-4" />
                      </button>

                      {order.status !== "Delivered" &&
                        order.status !== "Cancelled" && (
                          <button
                            onClick={() => openCancel(order)}
                            className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                      {getPrimaryActionLabel(order) && (
                        <button
                          onClick={() => handlePrimaryAction(order)}
                          className="px-3 py-2 text-[11px] rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-semibold"
                        >
                          {getPrimaryActionLabel(order)}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
  subtitle,
  tone,
  icon,
  isActive,
  onClick,
}: {
  title: string;
  value: number;
  subtitle?: string;
  tone: SummaryTone;
  icon: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`group flex flex-col items-start p-4 rounded-2xl text-white shadow-md bg-gradient-to-br ${
        summaryToneGradient[tone]
      } ${
        isActive
          ? "ring-2 ring-emerald-300 scale-[1.02]"
          : "opacity-95 hover:shadow-lg hover:scale-[1.01]"
      } transition-all duration-200 cursor-pointer`}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-wide opacity-90">
            {title}
          </span>
          {subtitle && (
            <span className="text-[11px] opacity-80 mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
        <div className="p-2 rounded-xl bg-white/15 group-hover:bg-white/20">
          {icon}
        </div>
      </div>
      <span className="text-2xl md:text-3xl font-extrabold mt-3">
        {value}
      </span>
    </motion.button>
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
        className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl border border-gray-100"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Order Details
          </h2>
          <span className="text-xs text-gray-400">
            #{order.id}
          </span>
        </div>

        <div className="text-sm space-y-3">
          <div>
            <span className="font-medium text-gray-700">Customer:</span>
            <p className="mt-0.5 text-gray-800 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              {order.name}
            </p>
          </div>

          <div>
            <span className="font-medium text-gray-700">Address:</span>
            <p className="mt-0.5 text-gray-600 text-xs">
              {order.address}
            </p>
          </div>

          <div>
            <span className="font-medium text-gray-700">
              Items:
            </span>
            <div className="mt-1 space-y-1 max-h-40 overflow-auto pr-1">
              {order.products.map((p, i) => (
                <div
                  key={i}
                  className="ml-2 text-xs text-gray-700 flex items-start gap-2"
                >
                  <span className="mt-[3px]">•</span>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-1">
            <div>
              <span className="font-medium text-gray-700">
                Total:
              </span>{" "}
              <span className="font-semibold text-gray-900">
                ₱{order.total.toLocaleString()}
              </span>
            </div>

            <div>
              <span className="font-medium text-gray-700">
                Status:
              </span>{" "}
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>

            <div>
              <span className="font-medium text-gray-700">
                Payment:
              </span>{" "}
              <span className="text-xs font-semibold">
                {order.paymentStatus ?? "N/A"}
              </span>
            </div>
          </div>

          <div>
            <span className="font-medium text-gray-700">
              Created:
            </span>{" "}
            <span className="text-xs text-gray-500">
              {order.createdAt}
            </span>
          </div>

          <div>
            <span className="font-medium text-gray-700">
              Notes:
            </span>{" "}
            <span className="text-xs text-gray-600">
              {order.notes || "—"}
            </span>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium"
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
  availableRiders: any[];
  onAssign: (rider: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm">
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        className="w-80 h-full bg-white shadow-xl p-5 border-l border-gray-200"
      >
        <h2 className="text-lg font-bold mb-1 text-gray-900">
          Assign Rider
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Order #{order.id} • {order.name}
        </p>

        {availableRiders.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No riders available at the moment.
          </p>
        ) : (
          <ul className="space-y-2">
            {availableRiders.map((rider, idx) => (
              <li
                key={idx}
                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                onClick={() => onAssign(rider.name)}
              >
                <span className="text-sm font-medium text-gray-800">
                  {rider.name}
                </span>
                <span className="text-[11px] text-gray-500">
                  {rider.status}
                </span>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium text-gray-700"
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
        className="w-96 h-full bg-white shadow-xl p-5 border-l border-gray-200"
      >
        <h2 className="text-lg font-bold mb-2 text-gray-900">
          Delivery Route
        </h2>

        <p className="text-xs text-gray-500 mb-3">
          Order #{order.id} • {order.name}
        </p>

        <p className="text-sm text-gray-600 mb-3">
          <span className="font-medium text-gray-700">
            Customer Address:
          </span>
          <br />
          <span>{order.address}</span>
        </p>

        <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 text-sm border border-dashed border-gray-300">
          🗺️ Map placeholder (Google Maps / HyperTrack integration here)
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium text-gray-700"
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
        className="w-80 h-full bg-white shadow-xl p-5 border-l border-gray-200"
      >
        <h2 className="text-lg font-bold mb-2 text-gray-900">
          Contact Customer
        </h2>

        <p className="text-sm text-gray-700 mb-1">{order.name}</p>
        <p className="text-xs text-gray-500 mb-4">
          Order #{order.id}
        </p>

        <div className="mt-2 space-y-2">
          <button className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">
            Call Customer
          </button>
          <button className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
            Send SMS / Message
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium text-gray-700"
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
  const [reason, setReason] = React.useState("");

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl border border-gray-100"
      >
        <h2 className="text-lg font-bold text-gray-900">
          Cancel Order #{order.id}
        </h2>

        <textarea
          placeholder="Reason for cancellation..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full h-28 p-3 border rounded-lg bg-gray-50 text-sm"
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium text-gray-700"
          >
            Close
          </button>
          <button
            onClick={() => onConfirm(reason)}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-sm font-medium"
          >
            Confirm
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
  const [note, setNote] = React.useState("");

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl border border-gray-100"
      >
        <h2 className="text-lg font-bold text-gray-900">
          Mark as Delivered
        </h2>
        <p className="text-xs text-gray-500">
          Order #{order.id} • {order.name}
        </p>

        <textarea
          placeholder="Add delivery note (optional)..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full h-28 p-3 border rounded-lg bg-gray-50 text-sm"
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium text-gray-700"
          >
            Close
          </button>

          <button
            onClick={() => onConfirm({ note })}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
}
