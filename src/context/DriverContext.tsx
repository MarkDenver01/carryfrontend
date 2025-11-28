import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/* ============================================
   TYPES
============================================ */

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

  ordersToday: number;          // total assigned today
  completedDeliveries: number;  // completed drops
  workload: number;             // = ordersToday * 10
  lastAssigned: string | null;
  lastActive: string | null;
  homeBase: string;
  rating: number;
}

/* ============================================
   CONTEXT INTERFACE
============================================ */

interface DriverContextType {
  riders: Rider[];
  addRider: (r: Rider) => void;
  deleteRider: (id: string) => void;
  updateRider: (id: string, data: Partial<Rider>) => void;

  assignRider: (riderId: string) => void;
  completeDelivery: (riderId: string) => void;

  resetRiders: () => void;
}

const STORAGE_KEY = "carry_admin_riders_v1";
const DriverContext = createContext<DriverContextType | null>(null);

/* ============================================
   DEFAULT RIDERS (Auto-create if empty)
============================================ */

const defaultRiders: Rider[] = [
  {
    id: "r1",
    name: "Rider One",
    contact: "09xx-xxx-xxxx",
    status: "Available",
    ordersToday: 0,
    completedDeliveries: 0,
    workload: 0,
    lastAssigned: null,
    lastActive: null,
    homeBase: "Tanauan",
    rating: 4.9,
  },
  {
    id: "r2",
    name: "Rider Two",
    contact: "09xx-xxx-xxxx",
    status: "Available",
    ordersToday: 0,
    completedDeliveries: 0,
    workload: 0,
    lastAssigned: null,
    lastActive: null,
    homeBase: "Sampaloc",
    rating: 4.8,
  },
];

/* ============================================
   PROVIDER
============================================ */

export const DriverProvider = ({ children }: { children: ReactNode }) => {
  const [riders, setRiders] = useState<Rider[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return defaultRiders; // auto-create
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return defaultRiders;
      }

      return parsed;
    } catch {
      return defaultRiders;
    }
  });

  /* ============================================
     SAVE TO LOCAL STORAGE
  ============================================ */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(riders));
    } catch {}
  }, [riders]);

  /* ============================================
     BASICS
  ============================================ */

  const addRider = (r: Rider) =>
    setRiders((prev) => [...prev, r]);

  const deleteRider = (id: string) =>
    setRiders((prev) => prev.filter((r) => r.id !== id));

  const updateRider = (id: string, data: Partial<Rider>) =>
    setRiders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data } : r))
    );

  /* ============================================
     ASSIGN RIDER
  ============================================ */

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
  };

  /* ============================================
     COMPLETE DELIVERY (Recommended Option A)
  ============================================ */

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
  };

  /* ============================================
     RESET (for debugging)
  ============================================ */

  const resetRiders = () => {
    setRiders(defaultRiders);
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

/* ============================================
   HOOK
============================================ */

export const useDrivers = () => {
  const ctx = useContext(DriverContext);
  if (!ctx) throw new Error("useDrivers must be used inside DriverProvider");
  return ctx;
};
