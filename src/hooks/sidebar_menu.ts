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
        Currency,
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
                            label: "Product Categories",
                            icon: Boxes,    // or any icon you used
                            path: "/dashboard/products/categories",
                        },
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
                        {
                            label: "Product Rates",
                            icon: Currency,
                            path: "/dashboard/products/rates",
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
                            role: "ADMIN"
                        },
                        {
                            label: "Sales Report",
                            icon: ShoppingCart,
                            path: "/dashboard/analytics/sales",
                            role: "ADMIN"
                        },
                        {
                            label: "Product Report",
                            icon: Boxes,
                            path: "/dashboard/analytics/products",
                            role: "SUB_ADMIN"
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
                            label: "Available Driver",
                            icon: Truck,
                            path: "/dashboard/delivery/riders",
                        },
                         {
                        label: "Add Driver",
                        icon: Truck,
                        path: "/dashboard/delivery/add-rider",
                    },
                ],
                },
            ],
        },
    ];
