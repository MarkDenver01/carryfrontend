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

// const getStatusIcon = (s: OrderStatus) => {
//   if (s === "Pending") return <Package className="w-4 h-4" />;
//   if (s === "Processing") return <Package className="w-4 h-4" />;
//   if (s === "In Transit") return <Truck className="w-4 h-4" />;
//   if (s === "Delivered") return <CheckCircle className="w-4 h-4" />;
//   if (s === "Cancelled") return <XCircle className="w-4 h-4" />;
//   return <Package className="w-4 h-4" />;
// };

const getPaymentColor = (p?: Order["paymentStatus"]) => {
  if (p === "Paid") return "bg-emerald-50 text-emerald-700";
  if (p === "COD") return "bg-amber-50 text-amber-700";
  if (p === "Unpaid") return "bg-red-50 text-red-700";
  return "bg-gray-50 text-gray-600";
};

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function Orders() {
  // ❗ REPLACED initialOrders → EMPTY ARRAY (backend will load)
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

  // GET RIDERS
  const { riders } = useDrivers();
  const availableRiders = riders.filter((r) => r.status === "Available");

  /* ============================================================
     🚀 LOAD REAL BACKEND ORDERS
  ============================================================= */

  React.useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const raw = await fetchAllOrders();

    const mapped: Order[] = raw.map((o: any) => ({
      id: o.orderId?.toString() ?? "",
      name: o.customerName ?? "Unknown Customer",
      address: o.deliveryAddress ?? "Unknown Address",
      products: o.items
        ? o.items.map((i: any) => `${i.productName} x${i.quantity}`)
        : [],
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

      // Keep UI structure intact
      rider: "Unassigned",
      distanceKm: undefined,
      scheduledTime: undefined,
    }));

    setOrders(mapped);
  }
  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          (filter === "All" || order.status === filter) &&
          order.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
      ),
    [orders, filter, searchTerm]
  );

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
  ============================================================ */

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
            delivery &amp; orders control center
          </span>
          . Track pipelines, riders, and order health in one view.
        </p>

        <div className="mt-3 h-[3px] w-24 bg-gradient-to-r from-emerald-400 via-emerald-500 to-transparent rounded-full" />
      </div>
      {/* ---------- SUMMARY CARDS ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-2">
        <SummaryCard
          title="Total Orders"
          value={totalOrders}
          tone="indigo"
          icon={<Package className="w-6 h-6" />}
        />
        <SummaryCard
          title="Pending"
          value={totalPending}
          tone="amber"
          icon={<Clock className="w-6 h-6" />}
        />
        <SummaryCard
          title="In Transit"
          value={totalInTransit}
          tone="blue"
          icon={<Truck className="w-6 h-6" />}
        />
        <SummaryCard
          title="Delivered"
          value={totalDelivered}
          tone="emerald"
          icon={<CheckCircle className="w-6 h-6" />}
        />
        <SummaryCard
          title="Cancelled"
          value={totalCancelled}
          tone="red"
          icon={<XCircle className="w-6 h-6" />}
        />
      </div>

      {/* ---------- SEARCH + FILTERS ---------- */}
      <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full md:w-1/2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search customers..."
              className="w-full px-4 py-2.5 bg-white/60 backdrop-blur-md rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            onClick={() => setFilter("All")}
            className={`px-4 py-2 rounded-lg cursor-pointer shadow-sm ${
              filter === "All"
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            All
          </div>
          <div
            onClick={() => setFilter("Pending")}
            className={`px-4 py-2 rounded-lg cursor-pointer shadow-sm ${
              filter === "Pending"
                ? "bg-amber-500 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Pending
          </div>
          <div
            onClick={() => setFilter("Processing")}
            className={`px-4 py-2 rounded-lg cursor-pointer shadow-sm ${
              filter === "Processing"
                ? "bg-sky-500 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Processing
          </div>
          <div
            onClick={() => setFilter("In Transit")}
            className={`px-4 py-2 rounded-lg cursor-pointer shadow-sm ${
              filter === "In Transit"
                ? "bg-indigo-500 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            In Transit
          </div>
          <div
            onClick={() => setFilter("Delivered")}
            className={`px-4 py-2 rounded-lg cursor-pointer shadow-sm ${
              filter === "Delivered"
                ? "bg-emerald-500 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Delivered
          </div>
          <div
            onClick={() => setFilter("Cancelled")}
            className={`px-4 py-2 rounded-lg cursor-pointer shadow-sm ${
              filter === "Cancelled"
                ? "bg-rose-500 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Cancelled
          </div>
        </div>
      </div>

      {/* ---------- ORDERS TABLE ---------- */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white/70 backdrop-blur-md shadow-md">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100/80 text-gray-700">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Order ID</th>
              <th className="px-6 py-3 text-left font-semibold">Customer</th>
              <th className="px-6 py-3 text-left font-semibold">Items</th>
              <th className="px-6 py-3 text-left font-semibold">Total</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-left font-semibold">Payment</th>
              <th className="px-6 py-3 text-left font-semibold">Rider</th>
              <th className="px-6 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50/70">
                <td className="px-6 py-4 font-medium">{order.id}</td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <User className="text-gray-400 w-4 h-4" />
                    {order.name}
                  </div>
                </td>

                <td className="px-6 py-4">
                  {order.products.slice(0, 2).join(", ")}
                  {order.products.length > 2 && (
                    <span className="text-xs text-gray-500">
                      {" "}
                      +{order.products.length - 2} more
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 font-semibold text-gray-800">
                  ₱{order.total.toLocaleString()}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${getPaymentColor(
                      order.paymentStatus
                    )}`}
                  >
                    {order.paymentStatus}
                  </span>
                </td>

                <td className="px-6 py-4 text-gray-700">
                  {order.rider || "—"}
                </td>

                <td className="px-6 py-4 flex items-center gap-2">
                  <button
                    onClick={() => openDetails(order)}
                    className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => openContact(order)}
                    className="p-2 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  >
                    <Phone className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => openRoute(order)}
                    className="p-2 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                  >
                    <Route className="w-4 h-4" />
                  </button>

                  {order.status !== "Delivered" &&
                    order.status !== "Cancelled" && (
                      <button
                        onClick={() => openCancel(order)}
                        className="p-2 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}

                  {getPrimaryActionLabel(order) && (
                    <button
                      onClick={() => handlePrimaryAction(order)}
                      className="px-3 py-2 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      {getPrimaryActionLabel(order)}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
   SUB COMPONENTS (UNCHANGED)
============================================================ */

function SummaryCard({
  title,
  value,
  tone,
  icon,
}: {
  title: string;
  value: number;
  tone: SummaryTone;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`flex flex-col p-5 rounded-xl text-white shadow-md bg-gradient-to-br ${summaryToneGradient[tone]}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium opacity-90">{title}</span>
        {icon}
      </div>
      <span className="text-3xl font-extrabold mt-2">{value}</span>
    </motion.div>
  );
}

/* ============================================================
   ALL OTHER COMPONENTS FROM YOUR FILE CONTINUE BELOW
   OrderDetailsModal
   AssignRiderDrawer
   RouteDrawer
   ContactDrawer
   CancelOrderModal
   MarkDeliveredModal
============================================================ */

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
        className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4 shadow-lg"
      >
        <h2 className="text-xl font-bold">Order Details</h2>

        <div className="text-sm space-y-2">
          <p>
            <span className="font-medium">Order ID:</span> {order.id}
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
          <p>
            <span className="font-medium">Status:</span>{" "}
            <span className={getStatusColor(order.status)}>
              {order.status}
            </span>
          </p>
          <p>
            <span className="font-medium">Payment:</span>{" "}
            {order.paymentStatus}
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
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
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
        className="w-80 h-full bg-white shadow-xl p-5"
      >
        <h2 className="text-lg font-bold mb-4">
          Assign Rider — Order #{order.id}
        </h2>

        {availableRiders.length === 0 ? (
          <p className="text-gray-500 text-sm">No riders available</p>
        ) : (
          <ul className="space-y-2">
            {availableRiders.map((rider, idx) => (
              <li
                key={idx}
                className="p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200"
                onClick={() => onAssign(rider.name)}
              >
                {rider.name}
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
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
        className="w-96 h-full bg-white shadow-xl p-5"
      >
        <h2 className="text-lg font-bold mb-4">Delivery Route</h2>

        <p className="text-sm text-gray-600 mb-3">
          Customer Address:
          <br />
          <span className="font-semibold">{order.address}</span>
        </p>

        <div className="h-64 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
          🗺️ Map Placeholder
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
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
        className="w-80 h-full bg-white shadow-xl p-5"
      >
        <h2 className="text-lg font-bold mb-4">Contact Customer</h2>

        <p className="text-sm text-gray-600">
          <span className="font-semibold">{order.name}</span>
        </p>

        <div className="mt-4">
          <button className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            Call Customer
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
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
        className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 shadow-lg"
      >
        <h2 className="text-lg font-bold">Cancel Order #{order.id}</h2>

        <textarea
          placeholder="Reason for cancellation..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full h-28 p-3 border rounded-lg bg-gray-50"
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
          <button
            onClick={() => onConfirm(reason)}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
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
        className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 shadow-lg"
      >
        <h2 className="text-lg font-bold">Mark as Delivered</h2>

        <textarea
          placeholder="Add delivery note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full h-28 p-3 border rounded-lg bg-gray-50"
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>

          <button
            onClick={() => onConfirm({ note })}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
}
