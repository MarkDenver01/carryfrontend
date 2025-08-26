import { useNavigate } from 'react-router-dom';

export default function DeliveryPage() {
    const navigate = useNavigate();

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Delivery Management</h1>
            <div className="space-y-2">
                <button
                    onClick={() => navigate('orders')}
                    className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
                >
                    View Orders
                </button>
                <br />
                <button
                    onClick={() => navigate('riders')}
                    className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
                >
                    Available Riders
                </button>
            </div>
        </div>
    );
}
