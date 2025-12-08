// src/main.tsx
import { initThemeMode } from "flowbite-react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import React from "react";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from './context/NotificationContext';

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <App /> 
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

initThemeMode();
