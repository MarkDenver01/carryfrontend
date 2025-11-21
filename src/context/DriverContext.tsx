import { createContext, useContext, useState } from "react";

export interface Driver {
  id: number;
  userName: string;
  email: string;
  mobileNumber: string;
  address: string;
  driversLicenseNumber: string;
  photoFile: File | null;
  frontIdFile: File | null;
  backIdFile: File | null;
}

interface DriverContextType {
  drivers: Driver[];
  addDriver: (d: Driver) => void;
  updateDriver: (d: Driver) => void;
  deleteDriver: (id: number) => void;
}

const DriverContext = createContext<DriverContextType | undefined>(undefined);

export function DriverProvider({ children }: { children: React.ReactNode }) {
  const [drivers, setDrivers] = useState<Driver[]>([]);

  const addDriver = (d: Driver) => {
    setDrivers((prev) => [...prev, d]);
  };

  const updateDriver = (updated: Driver) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d))
    );
  };

  const deleteDriver = (id: number) => {
    setDrivers((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <DriverContext.Provider
      value={{ drivers, addDriver, updateDriver, deleteDriver }}
    >
      {children}
    </DriverContext.Provider>
  );
}

export function useDrivers() {
  const ctx = useContext(DriverContext);
  if (!ctx) throw new Error("useDrivers must be inside <DriverProvider>");
  return ctx;
}
