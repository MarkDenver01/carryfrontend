import { createContext, useContext, useState } from "react";
import { registerDriver } from "../libs/ApiGatewayDatasource";

export interface Driver {
  driverId: number;
  userName: string;
  email: string;
  mobileNumber: string;
  address: string;
  driversLicenseNumber: string;
  photoUrl: string | null;
  frontIdUrl: string | null;
  backIdUrl: string | null;
}

interface DriverContextType {
  drivers: Driver[];
  addDriver: (formData: FormData) => Promise<Driver>;
  updateDriver: (driver: Driver) => void;
  deleteDriver: (driverId: number) => void;
}

const DriverContext = createContext<DriverContextType | undefined>(undefined);

export function DriverProvider({ children }: { children: React.ReactNode }) {
  const [drivers, setDrivers] = useState<Driver[]>([]);

  const addDriver = async (formData: FormData): Promise<Driver> => {
    const savedDriver = await registerDriver(formData);

    // append saved driver to list
    setDrivers((prev) => [...prev, savedDriver]);

    return savedDriver;
  };

  const updateDriver = (updated: Driver) => {
    setDrivers((prev) =>
      prev.map((d) => (d.driverId === updated.driverId ? updated : d))
    );
  };

  const deleteDriver = (driverId: number) => {
    setDrivers((prev) => prev.filter((d) => d.driverId !== driverId));
  };

  return (
    <DriverContext.Provider value={{ drivers, addDriver, updateDriver, deleteDriver }}>
      {children}
    </DriverContext.Provider>
  );
}

export function useDrivers() {
  const ctx = useContext(DriverContext);
  if (!ctx) throw new Error("useDrivers must be inside <DriverProvider>");
  return ctx;
}
