import { Routes, Route } from "react-router-dom";

import DeliveryPage from "../Delivery.tsx";
import RidersPage from "../sub/Riders.tsx";
import AddDriverPage from "../AddDriver.tsx";

export default function DeliveryRoutes() {
  return (
    <Routes>
      <Route path="" element={<DeliveryPage />} />
      <Route path="riders" element={<RidersPage />} />
      <Route path="add-riders" element={<AddDriverPage />} />
    </Routes>
  );
}
