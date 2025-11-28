import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import api from "../libs/api";

/* ================================
   TYPES
================================ */

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

/* ================================
   CONTEXT TYPE
================================ */

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

/* ================================
   STATUS MAPPER
================================ */

const mapBackendStatusToFrontend = (value?: string | null): RiderStatus => {
  const s = (value || "").toUpperCase();

  if (s === "AVAILABLE") return "Available";
  if (s === "ON_DELIVERY") return "On Delivery";
  if (s === "OFFLINE") return "Offline";
  if (s === "NOT_AVAILABLE") return "Not Available";

  return "Available";
};

/* ================================
   DRIVER PROVIDER
================================ */

export const DriverProvider = ({ children }: { children: ReactNode }) => {
  const [riders, setRiders] = useState<Rider[]>([]);

  /* ------------------------------
     LOAD FROM BACKEND
     Correct endpoint:
     GET /user/public/api/riders/all
  ------------------------------ */

  const loadRidersFromBackend = async () => {
    try {
      const res = await api.get("/user/public/api/riders/all");
      const raw = res.data ?? [];

      const mapped: Rider[] = raw.map((d: any) => {
        const name =
          typeof d?.name === "string" && d.name.trim().length > 0
            ? d.name
            : "Unknown Rider";

        return {
          id: d.riderId?.toString() ?? "", // correct mapping
          name,
          contact: d.contact ?? "",
          status: mapBackendStatusToFrontend(d.status),

          ordersToday: d.ordersToday ?? 0,
          completedDeliveries: d.completedDeliveries ?? 0,
          workload: d.workload ?? (d.ordersToday ?? 0) * 10,

          lastAssigned: d.lastAssigned ?? null,
          lastActive: d.lastActive ?? null,

          homeBase: d.homeBase ?? "N/A",
          rating: d.rating ?? 5,
        };
      });

      setRiders(mapped);
    } catch (err) {
      console.error("❌ Failed to load riders:", err);
      setRiders([]);
    }
  };

  useEffect(() => {
    loadRidersFromBackend();
  }, []);

  /* ================================
     CRUD
  ================================ */

  const addRider = (r: Rider) => setRiders((p) => [...p, r]);

  const deleteRider = (id: string) =>
    setRiders((p) => p.filter((r) => r.id !== id));

  const updateRider = (id: string, data: Partial<Rider>) =>
    setRiders((p) => p.map((r) => (r.id === id ? { ...r, ...data } : r)));

  /* ================================
     ASSIGN RIDER
  ================================ */

  const assignRider = (riderId: string) => {
    const now = new Date().toLocaleString();

    // optimistic update
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

    // call backend
    void (async () => {
      try {
        await api.put(`/user/public/api/riders/${riderId}/assign`);
      } catch (e) {
        console.error("❌ Backend assign failed:", e);
      }
    })();
  };

  /* ================================
     COMPLETE DELIVERY
  ================================ */

  const completeDelivery = (riderId: string) => {
    const now = new Date().toLocaleString();

    setRiders((prev) =>
      prev.map((r) =>
        r.id === riderId
          ? {
              ...r,
              status: "Available",
              completedDeliveries: r.completedDeliveries + 1,
              workload: Math.max(0, r.workload - 10),
              lastActive: now,
            }
          : r
      )
    );

    void (async () => {
      try {
        await api.put(`/user/public/api/riders/${riderId}/complete`);
      } catch (e) {
        console.error("❌ Backend complete failed:", e);
      }
    })();
  };

  /* ================================
     RESET / REFRESH
  ================================ */

  const resetRiders = () => {
    loadRidersFromBackend();
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
        resetRiders,
      }}
    >
      {children}
    </DriverContext.Provider>
  );
};

/* ================================
   HOOK
================================ */

export const useDrivers = () => {
  const ctx = useContext(DriverContext);
  if (!ctx) throw new Error("useDrivers must be inside DriverProvider");
  return ctx;
};
