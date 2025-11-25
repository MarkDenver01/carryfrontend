import { initThemeMode } from "flowbite-react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import React from "react";

// CONTEXT PROVIDERS
import { AuthProvider } from "./context/AuthContext";
import { DriverProvider } from "./context/DriverContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DriverProvider>
          <App />
        </DriverProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

initThemeMode();
