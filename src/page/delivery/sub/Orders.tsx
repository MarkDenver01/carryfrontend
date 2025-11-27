import React, { useEffect, useMemo, useState } from "react";
import {
  Truck,
  CheckCircle,
  XCircle,
  Package,
} from "lucide-react";
import {  fetchAllOrders } from "../../../libs/ApiGatewayDatasource";
import { useDrivers } from "../../../context/DriverContext";

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
  createdAt: string;
  rider?: string;
  paymentStatus?: "Paid" | "COD" | "Unpaid";
  notes?: string;
  scheduledTime?: string;
  distanceKm?: number;
};

/* ============================================================
   HELPERS
============================================================ */

const summaryToneGradient = {
  blue: "from-sky-500 to-sky-700",
  amber: "from-amber-500 to-amber-700",
  indigo: "from-indigo-500 to-indigo-700",
  emerald: "from-emerald-500 to-emerald-700",
  red: "from-rose-500 to-rose-700",
} as const;

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

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function Orders() {
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

  // Riders
  const { riders } = useDrivers();
  const availableRiders = riders.filter((r) => r.status === "Available");

  /* ============================================================
     LOAD REAL ORDERS FROM BACKEND
  ============================================================= */

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const raw = await fetchAllOrders();

      const mapped: Order[] = raw.map((o: any) => ({
        id: o.orderId.toString(),
        name: o.customerName ?? "Customer",
        address: o.deliveryAddress,
        products: o.items.map(
          (i: any) => `${i.productName} x${i.quantity}`
        ),
        total: Number(o.totalAmount),
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
        createdAt: new Date(o.createdAt).toLocaleString(),
        rider: "Unassigned",
      }));

      setOrders(mapped);
    } catch (e) {
      console.error("Error mapping orders:", e);
    }
  }

  /* ============================================================
     FILTERS
  ============================================================= */

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

  /* ============================================================
     CLICK ACTIONS
  ============================================================= */

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

  /* ============================================================
     HANDLE MOUSE LOCATION (for spotlight)
  ============================================================= */

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }
};