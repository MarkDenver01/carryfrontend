import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";
import { useState, useEffect } from "react";

// FIXED LOCATIONS
const STORE_ADDRESS = "34QP+XH3, Trapiche Rd, Tanauan City, Batangas";
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

  // ------------------------------
  // GEOCODE ADDRESSES → COORDS
  // ------------------------------
  useEffect(() => {
    if (!isLoaded) return;

    const geocoder = new google.maps.Geocoder();

    // Customer
    geocoder.geocode({ address: customerAddress }, (res, status) => {
      if (status === "OK" && res?.[0]) {
        setCustomerPos({
          lat: res[0].geometry.location.lat(),
          lng: res[0].geometry.location.lng(),
        });
      }
    });

    // Store (Plus Code)
    geocoder.geocode({ address: STORE_ADDRESS }, (res, status) => {
      if (status === "OK" && res?.[0]) {
        setStorePos({
          lat: res[0].geometry.location.lat(),
          lng: res[0].geometry.location.lng(),
        });
      }
    });
  }, [isLoaded]);

  // ------------------------------
  // BUILD ROUTES
  // Rider → Store → Customer
  // ------------------------------
  useEffect(() => {
    if (!customerPos || !storePos) return;

    const directionsService = new google.maps.DirectionsService();

    if (riderLocation) {
      // Rider → Store → Customer
      directionsService.route(
        {
          origin: riderLocation,
          destination: customerPos,
          waypoints: [{ location: storePos }],
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK") setDirections(result);
        }
      );
    } else {
      // Store → Customer only
      directionsService.route(
        {
          origin: storePos,
          destination: customerPos,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK") setDirections(result);
        }
      );
    }
  }, [customerPos, storePos, riderLocation]);

  if (!isLoaded || !customerPos || !storePos)
    return (
      <div className="flex items-center justify-center w-full h-full text-gray-400 text-xs">
        Loading map…
      </div>
    );

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
      {storePos && (
        <Marker
          position={storePos}
          icon={{
            url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            scaledSize: new google.maps.Size(40, 40),
          }}
        />
      )}

      {/* Rider Live Pin */}
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
