import { createContext, useContext, useState } from "react";

// =============================================================
// GLOBAL TYPES
// =============================================================
export type RiderStatus =
  | "Available"
  | "On Delivery"
  | "Offline"
  | "Not Available";

export type Rider = {
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
};

// =============================================================
// CONTEXT TYPE
// =============================================================
type DriverContextType = {
  riders: Rider[];
  addRider: (rider: Rider) => void;
  deleteRider: (id: string) => void;
  updateRider: (id: string, updated: Partial<Rider>) => void;
};

// =============================================================
// CREATE CONTEXT
// =============================================================
const DriverContext = createContext<DriverContextType | null>(null);

// =============================================================
// PROVIDER
// =============================================================
export const DriverProvider = ({ children }: { children: React.ReactNode }) => {
  const [riders, setRiders] = useState<Rider[]>([
    // OPTIONAL: Sample default rider para di empty UI
    {
      id: "RDR-101",
      name: "Sample Rider",
      contact: "09123456789",
      status: "Available",
      ordersToday: 0,
      lastAssigned: "Not Assigned",
      rating: 4.8,
      completedDeliveries: 12,
      workload: 10,
      lastActive: "Online now",
      homeBase: "Tanauan City",
    },
  ]);

  // ADD NEW RIDER
  const addRider = (rider: Rider) => {
    setRiders((prev) => [...prev, rider]);
  };

  // DELETE RIDER
  const deleteRider = (id: string) => {
    setRiders((prev) => prev.filter((r) => r.id !== id));
  };

  // UPDATE GLOBAL RIDER ENTRY
  const updateRider = (id: string, updated: Partial<Rider>) => {
    setRiders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
    );
  };

  return (
    <DriverContext.Provider
      value={{
        riders,
        addRider,
        deleteRider,
        updateRider,
      }}
    >
      {children}
    </DriverContext.Provider>
  );
};

// =============================================================
// CONTEXT CONSUMER HOOK
// =============================================================
export const useDrivers = () => {
  const ctx = useContext(DriverContext);
  if (!ctx) throw new Error("useDrivers must be used inside <DriverProvider>");
  return ctx;
};
