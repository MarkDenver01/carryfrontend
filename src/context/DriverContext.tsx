import { 
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";


export type RiderStatus = "Available" | "On Delivery" | "Offline" | "Not Available";

export interface Rider {
  id: string;
  name: string;
  contact: string;
  status: RiderStatus;
  ordersToday: number;
  lastAssigned: string;
  rating: number;
  completedDeliveries: number;
  workload: number;
  lastActive: string;
  homeBase: string;
}

interface DriverContextType {
  riders: Rider[];
  addRider: (r: Rider) => void;
  deleteRider: (id: string) => void;
  updateRider: (id: string, data: Partial<Rider>) => void;
}

const DriverContext = createContext<DriverContextType | null>(null);

const STORAGE_KEY = "carry_admin_riders";

export const DriverProvider = ({ children }: { children: ReactNode }) => {
  const [riders, setRiders] = useState<Rider[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed as Rider[];
    } catch (e) {
      console.error("Failed to parse riders from localStorage", e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(riders));
    } catch (e) {
      console.error("Failed to save riders to localStorage", e);
    }
  }, [riders]);

  const addRider = (r: Rider) => {
    setRiders((prev) => [...prev, r]);
  };

  const deleteRider = (id: string) => {
    setRiders((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRider = (id: string, data: Partial<Rider>) => {
    setRiders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data } : r))
    );
  };

  return (
    <DriverContext.Provider value={{ riders, addRider, deleteRider, updateRider }}>
      {children}
    </DriverContext.Provider>
  );
};

export const useDrivers = () => {
  const ctx = useContext(DriverContext);
  if (!ctx) {
    throw new Error("useDrivers must be used inside DriverProvider");
  }
  return ctx;
};
