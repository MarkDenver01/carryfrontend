import type { Rider, RiderStatus } from "../context/DriverContext";

export function applyAssignOrderStats(rider: Rider): Partial<Rider> {
  return {
    ordersToday: rider.ordersToday + 1,
    workload: Math.min(100, rider.workload + 10),
    status: "On Delivery" as RiderStatus, // ✅ FIXED TYPE
  };
}

export function applyDeliveredStats(rider: Rider): Partial<Rider> {
  return {
    completedDeliveries: rider.completedDeliveries + 1,
    ordersToday: Math.max(0, rider.ordersToday - 1),
    workload: Math.max(0, rider.workload - 10),
    status: "Available" as RiderStatus, // ✅ FIXED TYPE
  };
}
