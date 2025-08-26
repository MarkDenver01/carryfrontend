import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Boxes, ChevronDown, ChevronUp, Search, Star } from 'lucide-react';

interface Props {
    collapsed: boolean;
}

export default function SidebarProductMenu({ collapsed }: Props) {
    const location = useLocation();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (location.pathname.startsWith('/dashboard/products')) {
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
          <Boxes size={18} />
            {!collapsed && <span>Product Management</span>}
        </span>
                {!collapsed && (open ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
            </button>
            {open && !collapsed && (
                <div className="ml-6 mt-2 space-y-1 text-sm text-emerald-100">
                    <button
                        onClick={() => navigate('/dashboard/products/monitoring')}
                        className={`flex items-center gap-1 px-2 py-1 rounded w-full text-left hover:bg-white/10 ${
                            location.pathname === '/dashboard/products/monitoring'
                                ? 'bg-white/10 text-white font-semibold'
                                : ''
                        }`}
                    >
                        <Search size={14} />
                        Product Monitoring
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/products/recommendation')}
                        className={`flex items-center gap-1 px-2 py-1 rounded w-full text-left hover:bg-white/10 ${
                            location.pathname === '/dashboard/products/recommendation'
                                ? 'bg-white/10 text-white font-semibold'
                                : ''
                        }`}
                    >
                        <Star size={14} />
                        Product Recommendation
                    </button>
                </div>
            )}
        </div>
    );
}
