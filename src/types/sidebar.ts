import type {LucideIcon} from "lucide-react";

export interface SidebarMenuItem {
    label: string;
    icon: LucideIcon;
    path?: string;
    children?: SidebarMenuItem[];
}

export interface SidebarMenuSection {
    section: string;
    items: SidebarMenuItem[];
}
