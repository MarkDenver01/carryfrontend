import { Users, PhilippinePeso, ShoppingCart } from "lucide-react";
import SalesChartLayout from "../../../layout/analytics/SalesChartLayout";

export default function CustomerReport() {
    return (
        <div className="p-4 flex flex-col gap-6">
            {/* Page Title */}
            <h1 className="text-2xl font-bold text-gray-800">Customer Report</h1>

            {/* First Grid Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                {/* TOTAL SALES */}
                <div className="flex flex-col justify-between gap-4 py-6 px-4 bg-emerald-600 rounded-xl shadow-lg hover:shadow-xl transition">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-green-100 text-green-600 rounded-full">
                            <PhilippinePeso size={64} />
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white">37,241</div>
                            <div className="text-sm font-semibold text-white">Total Sales</div>
                        </div>
                    </div>
                </div>

                {/* CUSTOMERS */}
                <div className="flex flex-col justify-between gap-4 py-6 px-4 bg-rose-600 rounded-xl shadow-lg hover:shadow-xl transition">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-red-100 text-red-600 rounded-full">
                            <Users size={64} />
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white">5,523</div>
                            <div className="text-sm font-semibold text-white">Customers</div>
                        </div>
                    </div>
                </div>

                {/* ORDERS */}
                <div className="flex flex-col justify-between gap-4 py-6 px-4 bg-amber-600 rounded-xl shadow-lg hover:shadow-xl transition">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-orange-100 text-orange-600 rounded-full">
                            <ShoppingCart size={64} />
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white">1,293</div>
                            <div className="text-sm font-semibold text-white">Total Orders</div>
                        </div>
                    </div>
                </div>

                {/* TOP CUSTOMERS */}
                <div className="flex flex-col gap-4 py-6 px-4 bg-blue-900 rounded-xl shadow-lg hover:shadow-xl transition">
                    <h1 className="text-xl font-semibold text-white">Top Customers</h1>

                    {/* Customer 1 */}
                    <div>
                        <div className="flex justify-between items-center text-white mb-1">
                            <span className="font-medium">Nathaniel</span>
                            <span className="text-sm">75%</span>
                        </div>
                        <div className="w-full bg-blue-300 rounded-full h-4">
                            <div className="bg-white h-4 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                    </div>

                    {/* Customer 2 */}
                    <div>
                        <div className="flex justify-between items-center text-white mb-1">
                            <span className="font-medium">Alyssa</span>
                            <span className="text-sm">50%</span>
                        </div>
                        <div className="w-full bg-blue-300 rounded-full h-4">
                            <div className="bg-white h-4 rounded-full" style={{ width: '50%' }}></div>
                        </div>
                    </div>

                    {/* Customer 3 */}
                    <div>
                        <div className="flex justify-between items-center text-white mb-1">
                            <span className="font-medium">John</span>
                            <span className="text-sm">30%</span>
                        </div>
                        <div className="w-full bg-blue-300 rounded-full h-4">
                            <div className="bg-white h-4 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-300" />

            {/* Sales Chart Section */}
            <div className="p-4 bg-white rounded-xl shadow-md">
                <SalesChartLayout />
            </div>
        </div>
    );
}
