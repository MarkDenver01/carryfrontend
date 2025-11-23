export type OrderStatus = "Pending" | "In Transit" | "Delivered" | "Cancelled";
export type OrderPriority = "Normal" | "High" | "Scheduled";

export type Order = {
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
