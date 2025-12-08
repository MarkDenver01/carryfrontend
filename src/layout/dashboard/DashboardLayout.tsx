// src/layout/dashboard/DashboardLayout.tsx
import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

import AppSidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import ProtectedRoute from "../../components/ProtectedRoute";

import DashboardPage from "../../page/dashboard/Dashboard";
import SubDashboardPage from "../../page/dashboard/SubDashboard";

import ProductsPage from "../../page/product/Products";
import ProductMonitoring from "../../page/product/sub/ProductMonitoring";
import ProductRecommendation from "../../page/product/sub/ProductRecommendation";
import ProductPriceMonitoring from "../../page/product/sub/ProductRates";
import ProductCategoryManagement from "../../page/product/sub/ProductCategoryManagement";
import ProductBanner from "../../page/product/sub/ProductBannerPage";

import AnalyticsPage from "../../page/analytics/Analytics";
import CustomerReport from "../../page/analytics/sub/CustomerReport";
import SalesReport from "../../page/analytics/sub/SalesReport";
import ProductReport from "../../page/analytics/sub/ProductReport";

import UsersPage from "../../page/customer/Users";

import DeliveryPage from "../../page/delivery/Delivery";
import OrdersPage from "../../page/delivery/sub/Orders";
import RidersPage from "../../page/delivery/sub/Riders";
import AddDriverPage from "../../page/delivery/AddDriver";

import { ProductsProvider } from "../../context/ProductsContext";
import { PricesProvider } from "../../context/PricesContext";
import CategoryProvider from "../../context/CategoryContext";
import { RecommendationRuleProvider } from "../../context/RecommendationRulesContext";
import { DriverProvider } from "../../context/DriverContext";
import { NotificationProvider } from '../../context/NotificationContext';

export default function DashboardLayout() {
  const { user } = useAuth();
  const role = user?.role;

  const [collapsed, setCollapsed] = useState(false);
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/products")) setPageTitle("Product Management");
    else if (path.includes("/analytics")) setPageTitle("Analytics Dashboard");
    else if (path.includes("/delivery")) setPageTitle("Delivery Management");
    else if (path.includes("/users")) setPageTitle("Customer Membership");
    else setPageTitle("Dashboard");
  }, [location.pathname]);

  return (
  <DriverProvider>
    <NotificationProvider>
      <div className="flex h-screen bg-gray-200">
        <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            collapsed ? "ml-20" : "ml-64"
          }`}
        >

          <Topbar pageTitle={pageTitle} />

          <main className="p-4 overflow-y-auto flex-1">
   
            <CategoryProvider>
              <ProductsProvider>
                <PricesProvider>
                  <RecommendationRuleProvider>
                    <Routes>
                      {/* LANDING DASHBOARD PER ROLE */}
                      <Route
                        path=""
                        element={
                          role === "ADMIN" ? (
                            <ProtectedRoute requiredRole="ADMIN">
                              <DashboardPage />
                            </ProtectedRoute>
                          ) : (
                            <ProtectedRoute requiredRole="SUB_ADMIN">
                              <SubDashboardPage />
                            </ProtectedRoute>
                          )
                        }
                      />

                      {/* ADMIN EXCLUSIVE ROUTES */}
                      <Route
                        path="analytics/customers"
                        element={
                          <ProtectedRoute requiredRole="ADMIN">
                            <CustomerReport />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="analytics/sales"
                        element={
                          <ProtectedRoute requiredRole="ADMIN">
                            <SalesReport />
                          </ProtectedRoute>
                        }
                      />

                      {/* SUB ADMIN EXCLUSIVE ROUTES */}
                      <Route
                        path="products"
                        element={
                          <ProtectedRoute requiredRole="SUB_ADMIN">
                            <ProductsPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="products/monitoring"
                        element={
                          <ProtectedRoute requiredRole="SUB_ADMIN">
                            <ProductMonitoring />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="products/recommendation"
                        element={
                          <ProtectedRoute requiredRole="SUB_ADMIN">
                            <ProductRecommendation />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="products/rates"
                        element={
                          <ProtectedRoute requiredRole="SUB_ADMIN">
                            <ProductPriceMonitoring />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="products/categories"
                        element={
                          <ProtectedRoute requiredRole="SUB_ADMIN">
                            <ProductCategoryManagement />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="products/banner"
                        element={
                          <ProtectedRoute requiredRole="SUB_ADMIN">
                            <ProductBanner />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="analytics/products"
                        element={
                          <ProtectedRoute requiredRole="SUB_ADMIN">
                            <ProductReport />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="users"
                        element={
                          <ProtectedRoute requiredRole="SUB_ADMIN">
                            <UsersPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="delivery/orders"
                        element={
                          <ProtectedRoute requiredRole="SUB_ADMIN">
                            <OrdersPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="delivery/riders"
                        element={
                          <ProtectedRoute requiredRole="SUB_ADMIN">
                            <RidersPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="delivery/add-riders"
                        element={
                          <ProtectedRoute requiredRole="SUB_ADMIN">
                            <AddDriverPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* ROUTES ACCESSIBLE BY BOTH ROLES */}
                      <Route
                        path="analytics"
                        element={
                          <ProtectedRoute>
                            <AnalyticsPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="delivery"
                        element={
                          <ProtectedRoute>
                            <DeliveryPage />
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  </RecommendationRuleProvider>
                </PricesProvider>
              </ProductsProvider>
            </CategoryProvider>
         
          </main>
        </div>
      </div>
    </NotificationProvider>
  </DriverProvider>
  );
}
