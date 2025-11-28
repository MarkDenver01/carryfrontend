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

  ordersToday: number;          // total orders assigned today
  completedDeliveries: number;  // delivered orders result
  workload: number;             // = ordersToday * 10
  lastAssigned: string;         // last time na-assign
  lastActive: string;           // last time nag-complete/active
  homeBase: string;
  rating: number;
}

/* ============================================
    CONTEXT
============================================ */

interface DriverContextType {
  riders: Rider[];
  addRider: (r: Rider) => void;
  deleteRider: (id: string) => void;
  updateRider: (id: string, data: Partial<Rider>) => void;

  // NEW — FOR AUTO-ASSIGN LOGIC
  assignRider: (riderId: string) => void;
  completeDelivery: (riderId: string) => void;
}

const DriverContext = createContext<DriverContextType | null>(null);
const STORAGE_KEY = "carry_admin_riders";

/* ============================================
    PROVIDER
============================================ */

export const DriverProvider = ({ children }: { children: ReactNode }) => {
  const [riders, setRiders] = useState<Rider[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as Rider[];
    } catch {
      return [];
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
      BASIC CRUD
  ============================================ */

  const addRider = (r: Rider) => setRiders((prev) => [...prev, r]);

  const deleteRider = (id: string) =>
    setRiders((prev) => prev.filter((r) => r.id !== id));

  const updateRider = (id: string, data: Partial<Rider>) =>
    setRiders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data } : r))
    );

  /* ============================================
      RIDER ASSIGNMENT LOGIC
      (WORKLOAD = ordersToday * 10)
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
      DELIVERY COMPLETED
      OPTION A (Recommended)
      - available again
      - completedDeliveries += 1
      - workload - 10
      - lastActive = now
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

  return (
    <DriverContext.Provider
      value={{
        riders,
        addRider,
        deleteRider,
        updateRider,
        assignRider,
        completeDelivery,
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
