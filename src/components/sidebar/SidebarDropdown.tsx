import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import type { SidebarMenuItem } from "../../types/sidebar";

interface Props {
    parent: SidebarMenuItem;
    collapsed: boolean;
    isOpen: boolean;
}

export default function SidebarDropdown({ parent, collapsed, isOpen }: Props) {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <AnimatePresence>
            {isOpen && !collapsed && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-1 space-y-1 text-sm text-emerald-100 overflow-hidden"
                >
                    {parent.children?.map((child) => (
                        <button
                            key={child.label}
                            onClick={() => navigate(child.path!)}
                            className={`flex items-center gap-2 w-full text-left hover:bg-white/10 ${
                                location.pathname === child.path
                                    ? "bg-white/10 text-white font-semibold"
                                    : ""
                            }`}
                            style={{
                                paddingLeft: collapsed ? "1.5rem" : "2.5rem",
                                paddingRight: "1.25rem",
                                paddingTop: "0.5rem",
                                paddingBottom: "0.5rem",
                            }}
                        >
                            <child.icon size={14} />
                            {child.label}
                        </button>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
