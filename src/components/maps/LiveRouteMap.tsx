import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { useEffect, useState } from "react";

type Props = {
  customerAddress: string;
  riderLocation?: { lat: number; lng: number };
};

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "12px",
};

export default function LiveRouteMap({ customerAddress, riderLocation }: Props) {
  const [mapCenter, setMapCenter] = useState({ lat: 14.5995, lng: 120.9842 }); // Default Manila
  const [directions, setDirections] = useState<any>(null);

  // Load Google maps
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  // 🔥 Convert address → coordinates
  useEffect(() => {
    if (!isLoaded) return;

    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address: customerAddress }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const loc = results[0].geometry.location;
        setMapCenter({ lat: loc.lat(), lng: loc.lng() });

        if (riderLocation) {
          const directionsService = new google.maps.DirectionsService();
          directionsService.route(
            {
              origin: riderLocation,
              destination: loc,
              travelMode: google.maps.TravelMode.DRIVING,
            },
            (res, stats) => {
              if (stats === "OK") {
                setDirections(res);
              }
            }
          );
        }
      }
    });
  }, [isLoaded, customerAddress, riderLocation]);

  if (!isLoaded)
    return (
      <div className="flex items-center justify-center w-full h-full text-gray-400 text-xs">
        Loading map…
      </div>
    );

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={mapCenter} zoom={14}>
      {/* Customer marker */}
      <Marker
        position={mapCenter}
        icon={{
          url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
          scaledSize: new google.maps.Size(40, 40),
        }}
      />

      {/* Rider marker (live) */}
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
