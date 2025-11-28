// src/context/DriverContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import api from "../libs/api";

export type RiderStatus =
  | "Available"
  | "On Delivery"
  | "Offline"
  | "Not Available";

export interface Rider {
  id: string;
  name: string;
  contact: string;
  status: RiderStatus;
  ordersToday: number;
  completedDeliveries: number;
  workload: number;
  lastAssigned: string | null;
  lastActive: string | null;
  homeBase: string;
  rating: number;
}

interface DriverContextType {
  riders: Rider[];
  addRider: (r: Rider) => void;
  deleteRider: (id: string) => void;
  updateRider: (id: string, data: Partial<Rider>) => void;
  assignRider: (riderId: string) => void;
  completeDelivery: (riderId: string) => void;
  resetRiders: () => void;
}

const DriverContext = createContext<DriverContextType | null>(null);

const mapStatus = (value?: string | null): RiderStatus => {
  const s = (value || "").replace(/[\s_]/g, "").toUpperCase();

  if (s === "AVAILABLE") return "Available";
  if (s === "ONDELIVERY") return "On Delivery";
  if (s === "OFFLINE") return "Offline";
  if (s === "NOTAVAILABLE") return "Not Available";

  return "Available";
};


export const DriverProvider = ({ children }: { children: ReactNode }) => {
  const [riders, setRiders] = useState<Rider[]>([]);

  const loadRidersFromBackend = async () => {
    try {
      const res = await api.get("/user/public/api/riders/all");
      const raw = res.data ?? [];

      const mapped: Rider[] = Array.isArray(raw)
  ? raw
      .filter((item: any) => item && item.riderId != null)
      .map((d: any) => ({
        id: d.riderId.toString(),
        name: d.name ?? "Unnamed Driver",
        contact: d.contact ?? "",
        status: mapStatus(d.status),
        ordersToday: d.ordersToday ?? 0,
        completedDeliveries: d.completedDeliveries ?? 0,
        workload: d.workload ?? (d.ordersToday ?? 0) * 10,
        lastAssigned: d.lastAssigned ?? null,
        lastActive: d.lastActive ?? null,
        homeBase: d.homeBase ?? "N/A",
        rating: d.rating ?? 5,
      }))
  : [];


      setRiders(mapped);
    } catch (err) {
      console.error("❌ Failed to load riders:", err);
      setRiders([]);
    }
  };

  useEffect(() => {
    loadRidersFromBackend();
  }, []);

  const addRider = (r: Rider) => setRiders((prev) => [...prev, r]);
  const deleteRider = async (id: string) => {
  // 🔹 Optimistic update sa UI
  setRiders((prev) => prev.filter((r) => r.id !== id));

  try {
    await api.delete(`/user/public/api/riders/${id}`);
    console.log("✅ Rider deleted in backend:", id);
  } catch (err) {
    console.error("❌ Failed to delete rider in backend:", err);
    // Optional: rollback / reload from backend para sure
    await loadRidersFromBackend();
  }
};


  const updateRider = (id: string, data: Partial<Rider>) =>
    setRiders((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));

  const assignRider = (riderId: string) => {
    const now = new Date().toLocaleString();

    setRiders((prev) =>
      prev.map((r) =>
        r.id === riderId
          ? {
              ...r,
              status: "On Delivery",
              ordersToday: r.ordersToday + 1,
              workload: (r.ordersToday + 1) * 10,
              lastAssigned: now,
            }
          : r
      )
    );

    void api.put(`/user/public/api/riders/${riderId}/assign`).catch((e) =>
      console.error("❌ Assign failed:", e)
    );
  };

  const completeDelivery = async (riderId: string) => {
  try {
    // 1. Tell backend that this rider has completed the delivery
    await api.put(`/user/public/api/riders/${riderId}/complete`);

    // 2. Refresh riders from backend para 100% accurate
    await loadRidersFromBackend();

    console.log("✅ Rider refreshed after delivery:", riderId);
  } catch (err) {
    console.error("❌ Complete delivery failed:", err);
  }
};

  return (
    <DriverContext.Provider
      value={{
        riders,
        addRider,
        deleteRider,
        updateRider,
        assignRider,
        completeDelivery,
        resetRiders: loadRidersFromBackend,
      }}
    >
      {children}
    </DriverContext.Provider>
  );
};

export const useDrivers = () => {
  const ctx = useContext(DriverContext);
  if (!ctx) throw new Error("useDrivers must be inside DriverProvider");
  return ctx;
};
