import { Routes, Route } from "react-router-dom";

import DeliveryPage from "../Delivery";
import RidersPage from "../sub/Riders";
import AddDriverPage from "../AddDriver";

export default function DeliveryRoutes() {
  return (
    <Routes>
      <Route path="" element={<DeliveryPage />} />
      <Route path="riders" element={<RidersPage />} />
      <Route path="add-riders" element={<AddDriverPage />} />
    </Routes>
  );
}
