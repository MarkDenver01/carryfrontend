// src/page/Products.tsx

import { useNavigate } from 'react-router-dom';
import { Search, Star } from 'lucide-react';

export default function ProductsPage() {
    const navigate = useNavigate();

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold mb-4">Product Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => navigate('monitoring')}
                    className="flex items-center gap-2 bg-white shadow px-4 py-3 rounded hover:bg-emerald-100"
                >
                    <Search size={18} />
                    Product Monitoring
                </button>

                <button
                    onClick={() => navigate('recommendation')}
                    className="flex items-center gap-2 bg-white shadow px-4 py-3 rounded hover:bg-emerald-100"
                >
                    <Star size={18} />
                    Product Recommendation
                </button>
            </div>
        </div>
    );
}
