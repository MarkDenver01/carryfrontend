import type { LucideIcon } from "lucide-react";

/** Allowed admin roles */
export type UserRole = "ADMIN" | "SUB_ADMIN";

/** A single child link inside a dropdown */
export interface SidebarChildItem {
    label: string;
    icon: LucideIcon;
    path: string;
    role?: UserRole; // optional role (if omitted => visible to both ADMIN & SUB_ADMIN)
}

/** A top-level sidebar item (with or without dropdown children) */
export interface SidebarMenuItem {
    label: string;
    icon: LucideIcon;
    path?: string; // optional only when children exist
    role?: UserRole; // optional role restriction
    children?: SidebarChildItem[]; // dropdown items (optional)
}

/** A grouping section for sidebar (e.g. MAIN, PRODUCT, ANALYTICS) */
export interface SidebarMenuSection {
    section: string; // example: "Product", "Analytics"
    items: SidebarMenuItem[];
}
