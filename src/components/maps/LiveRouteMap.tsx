import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useEffect, useMemo, useState } from "react";

type LatLng = { lat: number; lng: number };

type Props = {
  customerAddress: string;
  riderLocation?: LatLng | null;
};

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "12px",
};

// 🔒 IMPORTANT: libraries array should be stable
const libraries: ("places")[] = ["places"];

export default function LiveRouteMap({ customerAddress, riderLocation }: Props) {
  const [customerLatLng, setCustomerLatLng] = useState<LatLng | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // 🔥 Geocode customer address → coordinates (once per address)
  useEffect(() => {
    if (!isLoaded || !customerAddress) return;

    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address: customerAddress }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const loc = results[0].geometry.location;
        const coords = { lat: loc.lat(), lng: loc.lng() };
        console.log("📍 Customer geocoded:", coords);
        setCustomerLatLng(coords);
      } else {
        console.warn("⚠️ Geocoding failed:", status);
      }
    });
  }, [isLoaded, customerAddress]);

  // 🔥 Compute directions whenever rider or customer changes
  useEffect(() => {
    if (!isLoaded || !riderLocation || !customerLatLng) {
      setDirections(null);
      return;
    }

    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: riderLocation,
        destination: customerLatLng,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (res, status) => {
        if (status === "OK" && res) {
          console.log("🗺️ Directions updated");
          setDirections(res);
        } else {
          console.warn("⚠️ Directions request failed:", status);
          setDirections(null);
        }
      }
    );
  }, [isLoaded, riderLocation, customerLatLng]);

  // 🧠 Center logic: follow rider; fallback to customer; else default Manila
  const mapCenter: LatLng = useMemo(() => {
    if (riderLocation) return riderLocation;
    if (customerLatLng) return customerLatLng;
    return { lat: 14.5995, lng: 120.9842 }; // Manila default
  }, [riderLocation, customerLatLng]);

  if (!isLoaded)
    return (
      <div className="flex items-center justify-center w-full h-full text-gray-400 text-xs">
        Loading map…
      </div>
    );

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={mapCenter} zoom={14}>
      {/* Customer marker */}
      {customerLatLng && (
        <Marker
          position={customerLatLng}
          icon={{
            url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
            scaledSize: new google.maps.Size(36, 36),
          }}
        />
      )}

      {/* Rider marker (LIVE) */}
      {riderLocation && (
        <Marker
          position={riderLocation}
          icon={{
            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            scaledSize: new google.maps.Size(40, 40),
          }}
        />
      )}

      {/* Route line */}
      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  );
}
