import { Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from "../../context/AuthContext";

import AppSidebar from '../../components/Sidebar.tsx';
import Topbar from '../../components/Topbar.tsx';
import ProtectedRoute from "../../components/ProtectedRoute";

import DashboardPage from '../../page/dashboard/Dashboard.tsx';
import SubDashboardPage from '../../page/dashboard/SubDashboard.tsx';

import ProductsPage from '../../page/product/Products.tsx';
import ProductMonitoring from '../../page/product/sub/ProductMonitoring.tsx';
import ProductRecommendation from '../../page/product/sub/ProductRecommendation.tsx';
import ProductPriceMonitoring from '../../page/product/sub/ProductRates.tsx';
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
    const { user } = useAuth();
    const role = user?.role;

    const [collapsed, setCollapsed] = useState(false);
    const [pageTitle, setPageTitle] = useState('Dashboard');
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
        <div className="flex h-screen bg-gray-200">
            <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

            <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
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

                                        {/* ---------------------- */}
                                        {/* ADMIN EXCLUSIVE ROUTES */}
                                        {/* ---------------------- */}
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

                                        {/* -------------------------- */}
                                        {/* SUB ADMIN EXCLUSIVE ROUTES */}
                                        {/* -------------------------- */}
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

                                        {/* ------------------------------ */}
                                        {/* ROUTES ACCESSIBLE BY BOTH ROLES */}
                                        {/* ------------------------------ */}
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
    );
}
