import { useEffect, useState } from "react";

export interface DriverLocation {
  driverId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export function useDriverLocation(driverId?: string | null) {
  const [location, setLocation] = useState<DriverLocation | null>(null);

  useEffect(() => {
    if (!driverId) return;

    const url = `${import.meta.env.VITE_API_BASE_URL}/api/driver/${driverId}/location/stream`;

    const es = new EventSource(url);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as DriverLocation;
        setLocation(data);
      } catch {
        // ignore parse error
      }
    };

    es.addEventListener("location", (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data) as DriverLocation;
        setLocation(data);
      } catch {
        // ignore
      }
    });

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
    };
  }, [driverId]);

  return location;
}
