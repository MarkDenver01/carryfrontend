// src/index.tsx
import { initThemeMode } from "flowbite-react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import React from "react";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { DriverProvider } from "./context/DriverContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DriverProvider>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </DriverProvider>
  </React.StrictMode>
);

initThemeMode();
