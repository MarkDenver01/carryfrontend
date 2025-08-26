import { Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

import AppSidebar from '../../components/Sidebar.tsx';
import Topbar from '../../components/Topbar.tsx';

import DashboardPage from '../../page/dashboard/Dashboard.tsx';
import ProductsPage from '../../page/product/Products.tsx';
import ProductMonitoring from '../../page/product/sub/ProductMonitoring.tsx';
import ProductRecommendation from '../../page/product/sub/ProductRecommendation.tsx';

import AnalyticsPage from '../../page/analytics/Analytics.tsx';
import CustomerReport from '../../page/analytics/sub/CustomerReport.tsx';
import SalesReport from '../../page/analytics/sub/SalesReport.tsx';
import ProductReport from '../../page/analytics/sub/ProductReport.tsx';

import UsersPage from '../../page/customer/Users.tsx';

import DeliveryPage from '../../page/delivery/Delivery.tsx';
import OrdersPage from '../../page/delivery/sub/Orders.tsx';
import RidersPage from '../../page/delivery/sub/Riders.tsx';

export default function DashboardLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const [pageTitle, setPageTitle] = useState('Dashboard');
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;
        if (path.includes('/products')) setPageTitle('Product Management');
        else if (path.includes('/analytics')) setPageTitle('Analytics Dashboard');
        else if (path.includes('/delivery')) setPageTitle('Delivery Management');
        else if (path.includes('/users')) setPageTitle('Customer Membership');
        else setPageTitle('Dashboard');
    }, [location.pathname]);

    return (
        <div className="flex h-screen bg-gray-200">
            <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
                <Topbar pageTitle={pageTitle} />
                <main className="p-4 overflow-y-auto flex-1">
                    <Routes>
                        <Route path="" element={<DashboardPage />} />

                        {/* Product Management */}
                        <Route path="products" element={<ProductsPage />} />
                        <Route path="products/monitoring" element={<ProductMonitoring />} />
                        <Route path="products/recommendation" element={<ProductRecommendation />} />

                        {/* Analytics */}
                        <Route path="analytics" element={<AnalyticsPage />} />
                        <Route path="analytics/customers" element={<CustomerReport />} />
                        <Route path="analytics/sales" element={<SalesReport />} />
                        <Route path="analytics/products" element={<ProductReport />} />

                        {/* Customers */}
                        <Route path="users" element={<UsersPage />} />

                        {/* Delivery Management */}
                        <Route path="delivery" element={<DeliveryPage />} />
                        <Route path="delivery/orders" element={<OrdersPage />} />
                        <Route path="delivery/riders" element={<RidersPage />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}
