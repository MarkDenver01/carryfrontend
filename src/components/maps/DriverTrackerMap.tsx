import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";
import { useState, useEffect } from "react";


const STORE_FULL_QUERY = "34QP+XH3 Tanauan, Batangas"; // Better for fallback

const containerStyle = { width: "100%", height: "100%", borderRadius: "12px" };

type Props = {
  customerAddress: string;
  riderLocation?: { lat: number; lng: number };
};

export default function DriverTrackerMap({ customerAddress, riderLocation }: Props) {
  const [customerPos, setCustomerPos] = useState<{ lat: number; lng: number } | null>(null);
  const [storePos, setStorePos] = useState<{ lat: number; lng: number } | null>(null);
  const [directions, setDirections] = useState<any>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  // -------------------------------------------------
  // GEOCODE CUSTOMER ADDRESS
  // -------------------------------------------------
  const geocodeCustomer = (geocoder: google.maps.Geocoder) => {
    geocoder.geocode({ address: customerAddress }, (res, status) => {
      if (status === "OK" && res?.[0]) {
        const loc = res[0].geometry.location;
        setCustomerPos({ lat: loc.lat(), lng: loc.lng() });
      } else {
        console.warn("❌ Cannot geocode customer address. Trying fallback...");
      }
    });
  };

  // -------------------------------------------------
  // GEOCODE STORE PLUS CODE
  // -------------------------------------------------
  const geocodeStorePlusCode = (geocoder: google.maps.Geocoder) => {
    geocoder.geocode({ address: STORE_FULL_QUERY }, (res, status) => {
      if (status === "OK" && res?.[0]) {
        const loc = res[0].geometry.location;
        setStorePos({ lat: loc.lat(), lng: loc.lng() });
      } else {
        console.error("❌ Store Plus Code failed to locate:", status);
      }
    });
  };

  // -------------------------------------------------
  // INITIAL GEOCODING
  // -------------------------------------------------
  useEffect(() => {
    if (!isLoaded) return;

    const geocoder = new google.maps.Geocoder();

    geocodeCustomer(geocoder);
    geocodeStorePlusCode(geocoder);
  }, [isLoaded]);

  // -------------------------------------------------
  // BUILD ROUTES
  // -------------------------------------------------
  useEffect(() => {
    if (!customerPos || !storePos) return;

    const directionsService = new google.maps.DirectionsService();

    const config: google.maps.DirectionsRequest = riderLocation
      ? {
          origin: riderLocation,
          destination: customerPos,
          waypoints: [{ location: storePos }],
          travelMode: google.maps.TravelMode.DRIVING,
        }
      : {
          origin: storePos,
          destination: customerPos,
          travelMode: google.maps.TravelMode.DRIVING,
        };

    directionsService.route(config, (result, status) => {
      if (status === "OK") setDirections(result);
      else console.error("❌ Directions failed:", status);
    });
  }, [customerPos, storePos, riderLocation]);

  if (!isLoaded || !customerPos || !storePos)
    return (
      <div className="flex items-center justify-center w-full h-full text-gray-400 text-xs">
        Locating addresses…
      </div>
    );

  // -------------------------------------------------
  // FINAL RENDER
  // -------------------------------------------------
  return (
    <GoogleMap mapContainerStyle={containerStyle} center={customerPos} zoom={14}>
      {/* Customer Pin */}
      <Marker
        position={customerPos}
        icon={{
          url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
          scaledSize: new google.maps.Size(40, 40),
        }}
      />

      {/* Store Pin */}
      <Marker
        position={storePos}
        icon={{
          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
          scaledSize: new google.maps.Size(40, 40),
        }}
      />

      {/* Rider Pin */}
      {riderLocation && (
        <Marker
          position={riderLocation}
          icon={{
            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            scaledSize: new google.maps.Size(40, 40),
          }}
        />
      )}

      {/* Route */}
      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  );
}
