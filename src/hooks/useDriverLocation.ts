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

    const es = new EventSource(url, { withCredentials: true });

    es.addEventListener("location", (event) => {
      try {
        const data = JSON.parse(event.data);
        setLocation(data);
      } catch {}
    });

    es.onerror = () => {
      console.error("SSE error");
      es.close();
    };

    return () => es.close();
  }, [driverId]);

  return location;
}

