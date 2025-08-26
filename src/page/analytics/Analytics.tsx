import { useNavigate } from 'react-router-dom';

export default function AnalyticsPage() {
    const navigate = useNavigate();

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Analytics Dashboard</h1>
            <div className="space-y-2">
                <button
                    onClick={() => navigate('customers')}
                    className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
                >
                    Customer Report
                </button>
                <br />
                <button
                    onClick={() => navigate('sales')}
                    className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
                >
                    Sales Report
                </button>
                <br />
                <button
                    onClick={() => navigate('products')}
                    className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
                >
                    Product Report
                </button>
            </div>
        </div>
    );
}
