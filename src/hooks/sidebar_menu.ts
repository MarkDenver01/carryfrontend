import {
    LayoutDashboard,
    Boxes,
    Search,
    Star,
    BarChart2,
    Users,
    ShoppingCart,
    Truck,
    UserCheck,
} from "lucide-react";
import type { SidebarMenuSection } from "../types/sidebar.ts";

export const sidebarMenu: SidebarMenuSection[] = [
    {
        section: "Main",
        items: [
            {
                label: "Dashboard",
                icon: LayoutDashboard,
                path: "/dashboard",
            },
        ],
    },
    {
        section: "Product",
        items: [
            {
                label: "Product Management",
                icon: Boxes,
                children: [
                    {
                        label: "Product Monitoring",
                        icon: Search,
                        path: "/dashboard/products/monitoring",
                    },
                    {
                        label: "Product Recommendation",
                        icon: Star,
                        path: "/dashboard/products/recommendation",
                    },
                ],
            },
        ],
    },
    {
        section: "Analytics",
        items: [
            {
                label: "Analytics Dashboard",
                icon: BarChart2,
                children: [
                    {
                        label: "Customer Report",
                        icon: Users,
                        path: "/dashboard/analytics/customers",
                    },
                    {
                        label: "Sales Report",
                        icon: ShoppingCart,
                        path: "/dashboard/analytics/sales",
                    },
                    {
                        label: "Product Report",
                        icon: Boxes,
                        path: "/dashboard/analytics/products",
                    },
                ],
            },
        ],
    },
    {
        section: "Operations",
        items: [
            {
                label: "Customer Membership",
                icon: UserCheck,
                path: "/dashboard/users",
            },
            {
                label: "Delivery Management",
                icon: Truck,
                children: [
                    {
                        label: "Orders",
                        icon: ShoppingCart,
                        path: "/dashboard/delivery/orders",
                    },
                    {
                        label: "Available Riders",
                        icon: Truck,
                        path: "/dashboard/delivery/riders",
                    },
                ],
            },
        ],
    },
];
