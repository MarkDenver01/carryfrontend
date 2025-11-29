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

    console.log("🔗 [SSE] Connecting to:", url);

    const es = new EventSource(url);

    // Default event (for 'init' and fallback)
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as DriverLocation;
        console.log("📡 [SSE:onmessage] location =", data);
        setLocation(data);
      } catch {
        // probably "connected" string lang, ignore
      }
    };

    // Named event: "location"
    es.addEventListener("location", (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data) as DriverLocation;
        console.log("📡 [SSE:location] location =", data);
        setLocation(data);
      } catch (err) {
        console.warn("⚠️ Failed to parse location event:", err);
      }
    });

    es.onerror = (err) => {
      console.error("❌ [SSE] Error, closing stream:", err);
      es.close();
    };

    return () => {
      console.log("🔌 [SSE] Closing connection");
      es.close();
    };
  }, [driverId]);

  return location;
}
