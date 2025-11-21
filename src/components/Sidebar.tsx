
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo, Fragment } from "react";
import { motion } from "framer-motion";

import { sidebarMenu } from "../hooks/sidebar_menu";
import type { SidebarMenuItem, SidebarMenuSection, UserRole } from "../types/sidebar";

import carry_admin_logo from "../assets/cary_admin_logo.svg";
import RotateIcon from "../components/sidebar/RotateIcon";
import SidebarDropdown from "../components/sidebar/SidebarDropdown";
import { useAuth } from "../context/AuthContext";

interface Props {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

export default function AppSidebar({ collapsed, setCollapsed }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const role: UserRole | undefined = user?.role as UserRole | undefined;

  /** 🔹 Track opened dropdowns */
  const [open, setOpen] = useState<Record<string, boolean>>({});

  /** 🔹 Helper: role-based visibility for an item */
  const allowItem = (item: SidebarMenuItem): boolean =>
    !item.role || item.role === role;

  /** 🔹 Build visible sections based on role (memoized) */
  const visibleSections: SidebarMenuSection[] = useMemo(() => {
    return sidebarMenu
      .map((section) => {
        const filteredItems = section.items
          .map<SidebarMenuItem | null>((item) => {
            // Parent hidden by role
            if (!allowItem(item)) return null;

            // Filter children by role if any
            const filteredChildren = item.children?.filter(allowItem) ?? [];

            // If it had children originally but after filtering zero remain → hide whole parent
            if (item.children && filteredChildren.length === 0) return null;

            // Return new item with filtered children
            return {
              ...item,
              children: filteredChildren.length ? filteredChildren : item.children,
            };
          })
          .filter(Boolean) as SidebarMenuItem[];

        if (!filteredItems.length) return null;

        return {
          ...section,
          items: filteredItems,
        };
      })
      .filter(Boolean) as SidebarMenuSection[];
  }, [role]);

  /** 🔹 Auto-open dropdowns based on current path */
  useEffect(() => {
    const next: Record<string, boolean> = {};

    visibleSections.forEach((section) => {
      section.items.forEach((item) => {
        if (
          item.children?.some((child) =>
            location.pathname.startsWith(child.path)
          )
        ) {
          next[item.label] = true;
        }
      });
    });

    setOpen(next);
  }, [location.pathname, visibleSections]);

  /** 🔹 Check if item (or its children) is active */
  const isActive = (item: SidebarMenuItem): boolean => {
    if (item.path && item.path === location.pathname) return true;
    if (item.children?.some((child) => child.path === location.pathname)) {
      return true;
    }
    return false;
  };

  /** 🔹 Base button style */
  const menuClass = (active: boolean): string =>
    `group relative flex items-center gap-3 w-full text-left border-l-4 transition-all duration-200
    ${collapsed ? "px-2 py-1.5" : "px-4 py-2"}
    ${
      active
        ? "bg-white/10 font-semibold border-white/50"
        : "border-transparent hover:bg-emerald-700 hover:border-white/30"
    }`;

  /** 🔹 Toggle dropdown open/close */
  const toggleDropdown = (label: string) =>
    setOpen((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));

  /** 🔹 Reusable tooltip (collapsed mode) */
  const CollapsedTooltip = ({ label }: { label: string }) => (
    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-black/80 text-white text-xs rounded px-3 py-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
      {label}
    </div>
  );

  return (
    <motion.div
      animate={{ width: collapsed ? "5rem" : "16rem" }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 h-full bg-emerald-800 text-white border-r border-emerald-700 z-40 overflow-hidden flex flex-col"
    >
      {/* HEADER */}
      <div
        className="bg-emerald-900 flex items-center justify-between px-4 py-4 border-b border-emerald-700 cursor-pointer"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <img className="h-8 w-8" src={carry_admin_logo} alt="Logo" />
          {!collapsed && (
            <span className="text-xl font-semibold">Wrap & Carry</span>
          )}
        </div>
      </div>

      {/* MENU */}
      <div className="flex-1 overflow-y-auto bg-emerald-800">
        <nav className="py-4 space-y-7">
          {visibleSections.map((section) => (
            <Fragment key={section.section}>
              {/* SECTION TITLE */}
              {!collapsed && (
                <div className="px-4 py-1 text-xs font-bold text-emerald-200 uppercase tracking-wide">
                  {section.section}
                </div>
              )}

              {/* SECTION ITEMS */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item);
                  const isOpen = !!open[item.label];

                  const hasChildren = !!item.children && item.children.length > 0;

                  if (hasChildren) {
                    return (
                      <div key={item.label} className="relative group">
                        {/* Parent with dropdown */}
                        <button
                          className={menuClass(active)}
                          onClick={() => toggleDropdown(item.label)}
                        >
                          <item.icon size={18} />
                          {!collapsed && (
                            <span className="flex-1">{item.label}</span>
                          )}
                          {!collapsed && <RotateIcon rotate={isOpen} />}
                        </button>

                        {/* Tooltip in collapsed mode */}
                        {collapsed && <CollapsedTooltip label={item.label} />}

                        {/* Dropdown list */}
                        <SidebarDropdown
                          parent={item}
                          collapsed={collapsed}
                          isOpen={isOpen}
                        />
                      </div>
                    );
                  }

                  // Simple single menu item
                  return (
                    <div key={item.label} className="relative group">
                      <button
                        onClick={() => item.path && navigate(item.path)}
                        className={menuClass(active)}
                        title={collapsed ? item.label : ""}
                      >
                        <item.icon size={18} />
                        {!collapsed && <span>{item.label}</span>}
                      </button>

                      {/* Tooltip in collapsed mode */}
                      {collapsed && <CollapsedTooltip label={item.label} />}
                    </div>
                  );
                })}
              </div>
            </Fragment>
          ))}
        </nav>
      </div>
    </motion.div>
  );
}
