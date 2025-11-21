import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { sidebarMenu } from "../hooks/sidebar_menu.ts";
import type { SidebarMenuItem } from "../types/sidebar";
import carry_admin_logo from "../assets/cary_admin_logo.svg";
import RotateIcon from "../components/sidebar/RotateIcon";
import SidebarDropdown from "../components/sidebar/SidebarDropdown";
import { useAuth } from "../context/AuthContext";

interface Props {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

export default function AppSidebar({ collapsed, setCollapsed }: Props) {
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState<Record<string, boolean>>({});

    const { user } = useAuth();
    const role = user?.role; // ADMIN or SUB_ADMIN

    useEffect(() => {
        const expanded: Record<string, boolean> = {};
        sidebarMenu.forEach((section) => {
            section.items.forEach((item) => {
                if (
                    item.children?.some((child) =>
                        location.pathname.startsWith(child.path!)
                    )
                ) {
                    expanded[item.label] = true;
                }
            });
        });
        setOpen(expanded);
    }, [location.pathname]);

    const toggleDropdown = (label: string) => {
        setOpen((prev) => ({ ...prev, [label]: !prev[label] }));
    };

    const isItemActive = (item: SidebarMenuItem): boolean =>
        item.path === location.pathname ||
        !!item.children?.some((child) => location.pathname === child.path);

    const menuClass = (active: boolean) =>
        `group relative flex items-center gap-3 w-full text-left border-l-4 transition-all duration-200 ${
            collapsed ? "px-2 py-1.5" : "px-4 py-2"
        } ${
            active
                ? "bg-white/10 font-semibold border-white/50"
                : "border-transparent hover:bg-emerald-700 hover:border-white/30"
        }`;

    /** ⛔ ROLE FILTER FUNCTION */
    const allowItem = (item: SidebarMenuItem) => {
        if (!item.role) return true;        // no role = visible to all
        return item.role === role;          // only allowed to correct role
    };

    return (
        <motion.div
            animate={{ width: collapsed ? "5rem" : "16rem" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 left-0 h-full bg-emerald-800 text-white border-r border-emerald-700 z-40 overflow-hidden flex flex-col"
        >
            {/* Sidebar Header */}
            <div
                className="bg-emerald-900 flex items-center justify-between px-4 py-4 cursor-pointer border-b border-emerald-700"
                onClick={() => setCollapsed(!collapsed)}
            >
                <div className="flex items-center gap-2">
                    <img className="h-8 w-8" src={carry_admin_logo} alt="Logo" />
                    {!collapsed && (
                        <span className="text-xl font-semibold">Wrap & Carry</span>
                    )}
                </div>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto bg-emerald-800">
                <nav className="py-4 space-y-6">
                    {sidebarMenu.map((section) => (
                        <div key={section.section} className="group transition-all">

                            {/* SECTION TITLE */}
                            {!collapsed && (
                                <div className="px-4 py-1 text-xs font-bold text-emerald-200 uppercase tracking-wide group-hover:text-white group-hover:bg-emerald-700 transition">
                                    {section.section}
                                </div>
                            )}

                            <div className="space-y-1 group-hover:bg-emerald-700 transition-all duration-200">

                                {section.items
                                    .filter(allowItem) // ⛔ parent role filter
                                    .map((item) => {

                                        // Prepare filtered children (role-based)
                                        const filteredChildren = item.children?.filter(allowItem) || [];
                                        const isActive = isItemActive(item);
                                        const isDropdownOpen = open[item.label];

                                        return (
                                            <div key={item.label} className="relative group">

                                                {/* DROPDOWN PARENT */}
                                                {item.children ? (
                                                    <>
                                                        <button
                                                            onClick={() => toggleDropdown(item.label)}
                                                            className={menuClass(isActive)}
                                                        >
                                                            <item.icon size={18} />
                                                            {!collapsed && (
                                                                <span className="flex-1">{item.label}</span>
                                                            )}
                                                            {!collapsed && (
                                                                <RotateIcon rotate={isDropdownOpen} />
                                                            )}
                                                        </button>

                                                        {/* Tooltip for collapsed */}
                                                        {collapsed && (
                                                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-black/80 text-white text-xs rounded px-3 py-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                                                                {item.label}
                                                            </div>
                                                        )}

                                                        {/* DROPDOWN CHILDREN */}
                                                        <SidebarDropdown
                                                            parent={{ ...item, children: filteredChildren }}
                                                            collapsed={collapsed}
                                                            isOpen={isDropdownOpen}
                                                        />
                                                    </>
                                                ) : (
                                                    <>
                                                        {/* SINGLE MENU ITEM */}
                                                        <button
                                                            onClick={() => navigate(item.path!)}
                                                            title={collapsed ? item.label : ""}
                                                            className={menuClass(isActive)}
                                                        >
                                                            <item.icon size={18} />
                                                            {!collapsed && <span>{item.label}</span>}
                                                        </button>

                                                        {/* Tooltip for collapsed */}
                                                        {collapsed && (
                                                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-black/80 text-white text-xs rounded px-3 py-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                                                                {item.label}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    ))}
                </nav>
            </div>
        </motion.div>
    );
}
