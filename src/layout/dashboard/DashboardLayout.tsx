import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import AppSidebar from "../../components/Sidebar.tsx";
import Topbar from "../../components/Topbar.tsx";

import DashboardPage from "../../page/dashboard/Dashboard.tsx";
import ProductsPage from "../../page/product/Products.tsx";
import ProductMonitoring from "../../page/product/sub/ProductMonitoring.tsx";
import ProductRecommendation from "../../page/product/sub/ProductRecommendation.tsx";
import ProductPriceMonitoring from "../../page/product/sub/ProductRates.tsx";
import ProductCategoryManagement from "../../page/product/sub/ProductCategoryManagement.tsx";

import AnalyticsPage from "../../page/analytics/Analytics.tsx";
import CustomerReport from "../../page/analytics/sub/CustomerReport.tsx";
import SalesReport from "../../page/analytics/sub/SalesReport.tsx";
import ProductReport from "../../page/analytics/sub/ProductReport.tsx";

import UsersPage from "../../page/customer/Users.tsx";

import DeliveryPage from "../../page/delivery/Delivery.tsx";
import OrdersPage from "../../page/delivery/sub/Orders.tsx";
import RidersPage from "../../page/delivery/sub/Riders.tsx";
import AddDriverPage from "../../page/delivery/AddDriver.tsx";

import { ProductsProvider } from "../../context/ProductsContext";
import { PricesProvider } from "../../context/PricesContext";
import CategoryProvider from "../../context/CategoryContext";
import { RecommendationRuleProvider } from "../../context/RecommendationRulesContext";

export default function DashboardLayout() {
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
    <div className="flex h-screen bg-gray-100">

      {/* ========================== SIDEBAR ========================== */}
      <div
        className={`
          fixed top-0 left-0 h-screen z-50
          transition-all duration-300
          backdrop-blur-xl shadow-lg
        `}
      >
        <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* ============================ MAIN WRAPPER ============================ */}
      <div
        className={`flex-1 flex flex-col ml-0 transition-all duration-300 
        ${collapsed ? "md:ml-20" : "md:ml-64"}`}
      >

        {/* ============================== TOPBAR ============================== */}
        <div className="sticky top-0 z-40">
          <Topbar pageTitle={pageTitle} />
        </div>

        {/* ============================ PAGE CONTENT ============================ */}
        <main
          className="
            p-6 flex-1 overflow-y-auto 
            bg-gradient-to-br from-gray-50 to-gray-100
          "
        >
          <CategoryProvider>
            <ProductsProvider>
              <PricesProvider>
                <RecommendationRuleProvider>
                  <div
                    className="
                      mx-auto 
                      max-w-[1600px] 
                      bg-white rounded-2xl shadow-md 
                      p-6 
                      border border-gray-200
                      transition-all duration-300
                    "
                  >
                    <Routes>
                      <Route path="" element={<DashboardPage />} />

                      {/* Product Management */}
                      <Route path="products" element={<ProductsPage />} />
                      <Route path="products/monitoring" element={<ProductMonitoring />} />
                      <Route
                        path="products/recommendation"
                        element={<ProductRecommendation />}
                      />
                      <Route path="products/rates" element={<ProductPriceMonitoring />} />
                      <Route
                        path="products/categories"
                        element={<ProductCategoryManagement />}
                      />

                      {/* Analytics */}
                      <Route path="analytics" element={<AnalyticsPage />} />
                      <Route path="analytics/customers" element={<CustomerReport />} />
                      <Route path="analytics/sales" element={<SalesReport />} />
                      <Route path="analytics/products" element={<ProductReport />} />

                      {/* Customers / Membership */}
                      <Route path="users" element={<UsersPage />} />

                      {/* Delivery */}
                      <Route path="delivery" element={<DeliveryPage />} />
                      <Route path="delivery/orders" element={<OrdersPage />} />
                      <Route path="delivery/riders" element={<RidersPage />} />
                      <Route path="delivery/add-rider" element={<AddDriverPage />} />
                    </Routes>
                  </div>
                </RecommendationRuleProvider>
              </PricesProvider>
            </ProductsProvider>
          </CategoryProvider>
        </main>
      </div>
    </div>
  );
}
