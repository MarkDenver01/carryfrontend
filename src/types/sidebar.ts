import type {LucideIcon} from "lucide-react";

export interface SidebarMenuItem {
    label: string;
    icon: LucideIcon;
    path?: string;
    children?: SidebarMenuItem[];
    role?: "ADMIN" | "SUB_ADMIN";
}

export interface SidebarMenuSection {
    section: string;
    role?: "ADMIN" | "SUB_ADMIN";
    items: SidebarMenuItem[];
}
