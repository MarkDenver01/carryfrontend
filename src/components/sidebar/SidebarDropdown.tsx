// SidebarDropdown.tsx
import { Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SidebarMenuItem } from "../../types/sidebar";
import { useNavigate, useLocation } from "react-router-dom";

interface Props {
    parent: SidebarMenuItem;           // parent menu item with children
    collapsed: boolean;                // sidebar collapsed?
    isOpen: boolean;                   // dropdown state (strict boolean)
}

export default function SidebarDropdown({ parent, collapsed, isOpen }: Props) {
    const navigate = useNavigate();
    const location = useLocation();

    if (!parent.children || parent.children.length === 0) return null;

    const isChildActive = (path?: string) =>
        path === location.pathname;

    return (
        <AnimatePresence initial={false}>
            {isOpen && !collapsed && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="ml-6 mt-1 mb-2 space-y-1 border-l border-white/20 pl-3"
                >
                    {parent.children.map((child) => {
                        const active = isChildActive(child.path);

                        return (
                            <Fragment key={child.label}>
                                <button
                                    className={`
                                        flex items-center gap-2 w-full
                                        text-left text-sm py-1.5 pr-2 rounded
                                        transition-all duration-150 
                                        ${
                                            active
                                                ? "text-white font-semibold"
                                                : "text-emerald-100 hover:text-white"
                                        }
                                    `}
                                    onClick={() => navigate(child.path!)}
                                >
                                    <child.icon size={16} />
                                    <span>{child.label}</span>
                                </button>
                            </Fragment>
                        );
                    })}
                </motion.div>
            )}

            {/* Collapsed sidebar tooltip dropdown */}
            {isOpen && collapsed && (
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-full top-0 ml-2 py-2 px-3 bg-black/80 rounded shadow-xl text-white text-xs space-y-1 z-50"
                >
                    {parent.children.map((child) => (
                        <div
                            key={child.label}
                            onClick={() => navigate(child.path!)}
                            className="cursor-pointer hover:text-yellow-300"
                        >
                            {child.label}
                        </div>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
