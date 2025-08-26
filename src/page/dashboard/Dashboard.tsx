import {
    ShoppingCart,
    Percent,
    Users,
    ArrowRight,
    Truck
} from "lucide-react";
import DashboardTable  from "../../layout/dashboard/DashboardTableLayout.tsx"

export default function Dashboard() {
    return (
        <div className="p-4 flex flex-col gap-6">
            {/* First Grid Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* NEW ORDERS */}
                <div className="flex flex-col justify-between gap-4 p-4 bg-green-500 rounded-lg shadow hover:shadow-md transition">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-400 rounded-full">
                            <ShoppingCart size={64} />
                        </div>
                        <div>
                            <div className="text-5xl font-bold text-white">15</div>
                            <div className="text-sm font-semibold text-white">New Orders</div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button className="group flex items-center gap-2 text-sm font-semibold text-white hover:underline">
                            More Info
                            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1 group-hover:text-white" />
                        </button>
                    </div>
                </div>

                {/* SALES RATES */}
                <div className="flex flex-col justify-between gap-4 p-4 bg-amber-400 rounded-lg shadow hover:shadow-md transition">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 text-amber-500 rounded-full">
                            <Percent size={64} />
                        </div>
                        <div>
                            <div className="text-5xl font-bold text-white">30%</div>
                            <div className="text-sm font-semibold text-white">Sale Rate</div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button className="group flex items-center gap-2 text-sm font-semibold text-white hover:underline">
                            More Info
                            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1 group-hover:text-white" />
                        </button>
                    </div>
                </div>

                {/* NUMBER OF USERS */}
                <div className="flex flex-col justify-between gap-4 p-4 bg-green-800 rounded-lg shadow hover:shadow-md transition">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-full">
                            <Users size={64} />
                        </div>
                        <div>
                            <div className="text-5xl font-bold text-white">100</div>
                            <div className="text-sm font-semibold text-white">Number of Users</div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button className="group flex items-center gap-2 text-sm font-semibold text-white hover:underline">
                            More Info
                            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1 group-hover:text-white" />
                        </button>
                    </div>
                </div>

                {/* AVAILABLE DRIVER */}
                <div className="flex flex-col justify-between gap-4 p-4 bg-blue-900 rounded-lg shadow hover:shadow-md transition">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                            <Truck size={64} />
                        </div>
                        <div>
                            <div className="text-5xl font-bold text-white">10</div>
                            <div className="text-sm font-semibold text-white">Available Drivers</div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button className="group flex items-center gap-2 text-sm font-semibold text-white hover:underline">
                            More Info
                            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1 group-hover:text-white" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-300" />

            {/* Second Section (optional content) */}
            <div className="p-4">
              <DashboardTable/>
            </div>
        </div>
    );
}
