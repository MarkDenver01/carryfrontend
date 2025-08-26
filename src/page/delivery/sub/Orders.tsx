// src/pages/OrdersPage.tsx
import { useState } from "react";
import {
    Search,
    Eye,
    UserPlus,
    Phone,
    Truck,
    CheckCircle,
    XCircle,
    Filter
} from "lucide-react";
import { Dropdown, DropdownItem } from "flowbite-react";

const sampleOrders = [
    {
        id: "202407556401",
        name: "Monica Santos",
        address: "Barangay 6, Tanauan City Batangas",
        products: ["BearBrand Swak x2", "Cornedbeef x3", "Ligo Sardines x10"],
        total: 500,
        status: "Pending"
    },
    {
        id: "202407556402",
        name: "Joshua Cruz",
        address: "Purok 4, Talisay Batangas",
        products: ["Nissin Cup x5", "Delimondo x2", "Royal Soda x1"],
        total: 630,
        status: "Delivered"
    }
    // Add more sample data as needed
];

export default function Orders() {
    const [filter, setFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="p-6 flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Orders</h1>

                {/* Filter + Search */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Dropdown
                        dismissOnClick
                        renderTrigger={() => (
                            <button className="flex items-center gap-2 border border-emerald-500 bg-emerald-100 text-emerald-900 font-semibold text-sm px-4 py-1 rounded-full shadow hover:shadow-md transition">
                                <Filter className="w-4 h-4" />
                                {filter}
                            </button>
                        )}
                    >
                        <DropdownItem onClick={() => setFilter("All")}>All</DropdownItem>
                        <DropdownItem onClick={() => setFilter("Pending")}>Pending</DropdownItem>
                        <DropdownItem onClick={() => setFilter("Delivered")}>Delivered</DropdownItem>
                        <DropdownItem onClick={() => setFilter("Cancelled")}>Cancelled</DropdownItem>
                    </Dropdown>

                    <div className="relative w-full max-w-xs">
                        <input
                            type="text"
                            placeholder="Search orders..."
                            className="w-full border border-emerald-300 rounded-full px-4 py-2 pl-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Legends */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-blue-100 rounded-lg p-4 shadow text-center font-semibold text-blue-800">
                    27 Total Orders Today
                </div>
                <div className="bg-amber-100 rounded-lg p-4 shadow text-center font-semibold text-yellow-800">
                    3 Pending Orders
                </div>
                <div className="bg-green-100 rounded-lg p-4 shadow text-center font-semibold text-green-800">
                    7 Orders Delivered
                </div>
                <div className="bg-red-100 rounded-lg p-4 shadow text-center font-semibold text-red-800">
                    9 Cancelled Orders
                </div>
            </div>

            {/* Orders List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sampleOrders.map((order, index) => (
                    <div
                        key={index}
                        className="bg-white border border-gray-300 rounded-2xl p-4 shadow flex flex-col md:flex-row justify-between gap-4"
                    >
                        {/* Order Info */}
                        <div className="flex-1">
                            <p className="font-semibold text-sm text-gray-700 mb-1">
                                ORD - {order.id}
                            </p>
                            <p className="text-gray-800 font-semibold">{order.name}</p>
                            <p className="text-sm text-gray-600 mb-2">{order.address}</p>
                            <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                                {order.products.map((product, i) => (
                                    <li key={i}>{product}</li>
                                ))}
                            </ul>
                            <p className="mt-2 font-bold text-gray-800">Total = ₱{order.total}</p>
                        </div>

                        {/* Right Section */}
                        <div className="flex flex-col justify-between items-end gap-2">
                            {/* Status */}
                            <span
                                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                    order.status === "Pending"
                                        ? "bg-blue-100 text-blue-700"
                                        : order.status === "Delivered"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-600"
                                }`}
                            >
                {order.status}
              </span>

                            {/* Buttons */}
                            <div className="flex flex-col gap-2 mt-2">
                                <button className="bg-green-700 text-white px-3 py-1 rounded-full text-xs hover:bg-green-800 flex items-center gap-1">
                                    <Eye className="w-4 h-4" /> View
                                </button>
                                <button className="bg-green-700 text-white px-3 py-1 rounded-full text-xs hover:bg-green-800 flex items-center gap-1">
                                    <UserPlus className="w-4 h-4" /> Assign Rider
                                </button>
                                <button className="bg-green-700 text-white px-3 py-1 rounded-full text-xs hover:bg-green-800 flex items-center gap-1">
                                    <Truck className="w-4 h-4" /> Track Rider
                                </button>
                                <button className="bg-green-700 text-white px-3 py-1 rounded-full text-xs hover:bg-green-800 flex items-center gap-1">
                                    <Phone className="w-4 h-4" /> Contact Customer
                                </button>
                                <button className="bg-green-700 text-white px-3 py-1 rounded-full text-xs hover:bg-green-800 flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" /> Delivered
                                </button>
                                <button className="bg-red-700 text-white px-3 py-1 rounded-full text-xs hover:bg-red-800 flex items-center gap-1">
                                    <XCircle className="w-4 h-4" /> Decline Order
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
