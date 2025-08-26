import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Truck, ChevronDown, ChevronUp, ShoppingCart } from 'lucide-react';

interface Props {
    collapsed: boolean;
}

export default function SidebarDeliveryMenu({ collapsed }: Props) {
    const location = useLocation();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (location.pathname.startsWith('/dashboard/delivery')) {
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
          <Truck size={18} />
            {!collapsed && <span>Delivery Management</span>}
        </span>
                {!collapsed && (open ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
            </button>
            {open && !collapsed && (
                <div className="ml-6 mt-2 space-y-1 text-sm text-emerald-100">
                    <button
                        onClick={() => navigate('/dashboard/delivery/orders')}
                        className={`flex items-center gap-1 px-2 py-1 rounded w-full text-left hover:bg-white/10 ${
                            location.pathname === '/dashboard/delivery/orders'
                                ? 'bg-white/10 text-white font-semibold'
                                : ''
                        }`}
                    >
                        <ShoppingCart size={14} />
                        Orders
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/delivery/riders')}
                        className={`flex items-center gap-1 px-2 py-1 rounded w-full text-left hover:bg-white/10 ${
                            location.pathname === '/dashboard/delivery/riders'
                                ? 'bg-white/10 text-white font-semibold'
                                : ''
                        }`}
                    >
                        <Truck size={14} />
                        Available Riders
                    </button>
                </div>
            )}
        </div>
    );
}
