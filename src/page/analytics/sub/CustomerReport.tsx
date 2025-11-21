import { Users, PhilippinePeso, ShoppingCart } from "lucide-react";
import SalesChartLayout from "../../../layout/analytics/SalesChartLayout";

export default function CustomerReport() {
    return (
        <div className="p-6 flex flex-col gap-10">

            {/* Page Title */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    Customer Report
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    Insights on customers, sales performance, and purchasing behavior.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                {/* TOTAL SALES */}
                <div className="group flex flex-col justify-between gap-4 p-6 bg-gradient-to-br from-emerald-600 to-green-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-white/20 backdrop-blur-sm text-white rounded-full shadow-md">
                            <PhilippinePeso size={52} />
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white drop-shadow-sm">
                                37,241
                            </div>
                            <div className="text-sm font-medium text-white/80">
                                Total Sales
                            </div>
                        </div>
                    </div>
                </div>

                {/* CUSTOMERS */}
                <div className="group flex flex-col justify-between gap-4 p-6 bg-gradient-to-br from-rose-500 to-rose-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-white/20 backdrop-blur-sm text-white rounded-full shadow-md">
                            <Users size={52} />
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white drop-shadow-sm">
                                5,523
                            </div>
                            <div className="text-sm font-medium text-white/80">
                                Total Customers
                            </div>
                        </div>
                    </div>
                </div>

                {/* ORDERS */}
                <div className="group flex flex-col justify-between gap-4 p-6 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-white/20 backdrop-blur-sm text-white rounded-full shadow-md">
                            <ShoppingCart size={52} />
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white drop-shadow-sm">
                                1,293
                            </div>
                            <div className="text-sm font-medium text-white/80">
                                Total Orders
                            </div>
                        </div>
                    </div>
                </div>

                {/* TOP CUSTOMERS */}
                <div className="flex flex-col gap-5 p-6 bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200">
                    <h1 className="text-xl font-semibold text-white">Top Customers</h1>

                    {/* Customer 1 */}
                    <div>
                        <div className="flex justify-between items-center text-white mb-1">
                            <span className="font-medium">Nathaniel</span>
                            <span className="text-sm">75%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-4">
                            <div
                                className="bg-white h-4 rounded-full transition-all duration-300"
                                style={{ width: "75%" }}
                            />
                        </div>
                    </div>

                    {/* Customer 2 */}
                    <div>
                        <div className="flex justify-between items-center text-white mb-1">
                            <span className="font-medium">Alyssa</span>
                            <span className="text-sm">50%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-4">
                            <div
                                className="bg-white h-4 rounded-full transition-all duration-300"
                                style={{ width: "50%" }}
                            />
                        </div>
                    </div>

                    {/* Customer 3 */}
                    <div>
                        <div className="flex justify-between items-center text-white mb-1">
                            <span className="font-medium">John</span>
                            <span className="text-sm">30%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-4">
                            <div
                                className="bg-white h-4 rounded-full transition-all duration-300"
                                style={{ width: "30%" }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-300"></div>

            {/* Sales Chart Section */}
            <div className="p-6 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Customer Sales Trend
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    Monthly sales activity of your customers.
                </p>

                <SalesChartLayout />
            </div>
        </div>
    );
}
