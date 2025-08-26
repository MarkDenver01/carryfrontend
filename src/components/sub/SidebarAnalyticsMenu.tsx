import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart2, ChevronDown, ChevronUp, Users, ShoppingCart, Boxes } from 'lucide-react';

interface Props {
    collapsed: boolean;
}

export default function SidebarAnalyticsMenu({ collapsed }: Props) {
    const location = useLocation();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (location.pathname.startsWith('/dashboard/analytics')) {
            setOpen(true);
        }
    }, [location.pathname]);

    return (
        <div>
            <button
                onClick={() => setOpen(prev => !prev)}
                className="flex items-center justify-between w-full hover:bg-emerald-700 px-2 py-2 rounded"
            >
        <span className="flex items-center gap-2">
          <BarChart2 size={18} />
            {!collapsed && <span>Analytics Dashboard</span>}
        </span>
                {!collapsed && (open ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
            </button>
            {open && !collapsed && (
                <div className="ml-6 mt-2 space-y-1 text-sm text-emerald-100">
                    <button
                        onClick={() => navigate('/dashboard/analytics/customers')}
                        className={`flex items-center gap-1 px-2 py-1 rounded w-full text-left hover:bg-white/10 ${
                            location.pathname === '/dashboard/analytics/customers'
                                ? 'bg-white/10 text-white font-semibold'
                                : ''
                        }`}
                    >
                        <Users size={14} />
                        Customer Report
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/analytics/sales')}
                        className={`flex items-center gap-1 px-2 py-1 rounded w-full text-left hover:bg-white/10 ${
                            location.pathname === '/dashboard/analytics/sales'
                                ? 'bg-white/10 text-white font-semibold'
                                : ''
                        }`}
                    >
                        <ShoppingCart size={14} />
                        Sales Report
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/analytics/products')}
                        className={`flex items-center gap-1 px-2 py-1 rounded w-full text-left hover:bg-white/10 ${
                            location.pathname === '/dashboard/analytics/products'
                                ? 'bg-white/10 text-white font-semibold'
                                : ''
                        }`}
                    >
                        <Boxes size={14} />
                        Product Report
                    </button>
                </div>
            )}
        </div>
    );
}
