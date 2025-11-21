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
        role: "SUB_ADMIN",
        items: [
            {
                label: "Product Management",
                icon: Boxes,
                role: "SUB_ADMIN",
                children: [
                    {
                        label: "Product Categories",
                        icon: Boxes,
                        path: "/dashboard/products/categories",
                        role: "SUB_ADMIN",
                    },
                    {
                        label: "Product Monitoring",
                        icon: Search,
                        path: "/dashboard/products/monitoring",
                        role: "SUB_ADMIN",
                    },
                    {
                        label: "Product Recommendation",
                        icon: Star,
                        path: "/dashboard/products/recommendation",
                        role: "SUB_ADMIN",
                    },
                    {
                        label: "Product Rates",
                        icon: Currency,
                        path: "/dashboard/products/rates",
                        role: "SUB_ADMIN",
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
                        role: "ADMIN",
                    },
                    {
                        label: "Sales Report",
                        icon: ShoppingCart,
                        path: "/dashboard/analytics/sales",
                        role: "ADMIN",
                    },
                    {
                        label: "Product Report",
                        icon: Boxes,
                        path: "/dashboard/analytics/products",
                        role: "SUB_ADMIN",
                    },
                ],
            },
        ],
    },

    {
        section: "Operations",
        role: "SUB_ADMIN",
        items: [
            {
                label: "Customer Membership",
                icon: UserCheck,
                path: "/dashboard/users",
                role: "SUB_ADMIN",
            },
            {
                label: "Delivery Management",
                icon: Truck,
                role: "SUB_ADMIN",
                children: [
                    {
                        label: "Orders",
                        icon: ShoppingCart,
                        path: "/dashboard/delivery/orders",
                        role: "SUB_ADMIN",
                    },
                    {
                        label: "Available Driver",
                        icon: Truck,
                        path: "/dashboard/delivery/riders",
                        role: "SUB_ADMIN",
                    },
                    {
                        label: "Add Driver",
                        icon: Truck,
                        path: "/dashboard/delivery/add-riders",
                        role: "SUB_ADMIN",
                    },
                ],
            },
        ],
    },
];
