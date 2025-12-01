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
  addRider: (formData: FormData) => Promise<void>;
  deleteRider: (id: string) => Promise<void>;
  updateRider: (id: string, data: Partial<Rider>) => Promise<void>;
  assignRider: (riderId: string) => Promise<void>;
  completeDelivery: (riderId: string) => Promise<void>;
  resetRiders: () => Promise<void>;
}

const DriverContext = createContext<DriverContextType | null>(null);

/* ----------------------------------------------------
   STATUS MAPPER
---------------------------------------------------- */
const mapStatus = (value?: string | null): RiderStatus => {
  if (!value) return "Available";

  const s = value.toUpperCase().replace("_", " ");

  switch (s) {
    case "AVAILABLE":
      return "Available";
    case "ON DELIVERY":
      return "On Delivery";
    case "OFFLINE":
      return "Offline";
    case "NOT AVAILABLE":
      return "Not Available";
    default:
      return "Available";
  }
};

/* ----------------------------------------------------
   PROVIDER
---------------------------------------------------- */
export const DriverProvider = ({ children }: { children: ReactNode }) => {
  const [riders, setRiders] = useState<Rider[]>([]);

  /* ------------------------------
      LOAD FROM BACKEND
  ------------------------------ */
  const loadRidersFromBackend = async () => {
    try {
      const res = await api.get("/user/public/api/riders/all");
      const raw = res.data ?? [];

      const mapped: Rider[] = raw.map((d: any) => ({
        id: String(d.riderId), // ALWAYS string, NEVER null
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
      }));

      setRiders(mapped);
    } catch (err) {
      console.error("❌ Failed to load riders:", err);
      setRiders([]);
    }
  };

  useEffect(() => {
    loadRidersFromBackend();
  }, []);

  /* ----------------------------------------------------
     ADD RIDER (BACKEND SAVE)
  ---------------------------------------------------- */
  const addRider = async (formData: FormData) => {
    try {
      // POST → backend register
      await api.post("/admin/api/driver/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Refresh list para updated agad
      await loadRidersFromBackend();
    } catch (err) {
      console.error("❌ Failed to register rider:", err);
      throw err;
    }
  };

  /* ----------------------------------------------------
      DELETE RIDER
  ---------------------------------------------------- */
  const deleteRider = async (id: string) => {
    try {
      await api.delete(`/user/public/api/riders/${id}`);
      await loadRidersFromBackend();
    } catch (err) {
      console.error("❌ Failed to delete rider:", err);
    }
  };

  /* ----------------------------------------------------
      UPDATE RIDER (LOCAL ONLY)
      ⚠ OPTIONAL: Connect backend later if needed
  ---------------------------------------------------- */
  const updateRider = async (id: string, data: Partial<Rider>) => {
    setRiders((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
  };

  /* ----------------------------------------------------
      ASSIGN RIDER
  ---------------------------------------------------- */
  const assignRider = async (riderId: string) => {
    try {
      await api.put(`/user/public/api/riders/${riderId}/assign`);
      await loadRidersFromBackend();
    } catch (err) {
      console.error("❌ Failed to assign rider:", err);
    }
  };

  /* ----------------------------------------------------
      COMPLETE DELIVERY
  ---------------------------------------------------- */
  const completeDelivery = async (riderId: string) => {
    try {
      await api.put(`/user/public/api/riders/${riderId}/complete`);
      await loadRidersFromBackend();
    } catch (err) {
      console.error("❌ Complete delivery failed:", err);
    }
  };

  /* ----------------------------------------------------
      FINAL RETURN CONTEXT
  ---------------------------------------------------- */
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
