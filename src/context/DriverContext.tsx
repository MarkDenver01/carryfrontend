import { createContext, useContext, useState } from "react";

export type RiderStatus = "Available" | "On Delivery" | "Offline";

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

export const DriverProvider = ({ children }: { children: React.ReactNode }) => {
  const [riders, setRiders] = useState<Rider[]>([]);

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
  if (!ctx) throw new Error("useDrivers must be used inside DriverProvider");
  return ctx;
};
