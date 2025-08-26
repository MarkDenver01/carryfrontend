import { useState } from "react";
import {
    Search,
    ChevronDown,
    Bike,
    Phone,
    CalendarClock,
} from "lucide-react";
import { Dropdown, DropdownItem } from "flowbite-react";

export default function Riders() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const riders = [
        {
            id: "RDR-001",
            name: "Carlos Dela Cruz",
            contact: "0917-123-4567",
            status: "Available",
            ordersToday: 7,
            lastAssigned: "2025-07-03 10:45 AM",
        },
        {
            id: "RDR-002",
            name: "Jomar Castillo",
            contact: "0918-987-6543",
            status: "On Delivery",
            ordersToday: 4,
            lastAssigned: "2025-07-03 09:30 AM",
        },
        {
            id: "RDR-003",
            name: "Leo Mariano",
            contact: "0916-555-1234",
            status: "Offline",
            ordersToday: 0,
            lastAssigned: "2025-07-02 06:15 PM",
        },
        {
            id: "RDR-004",
            name: "Samuel Reyes",
            contact: "0921-765-4321",
            status: "Not Available",
            ordersToday: 2,
            lastAssigned: "2025-07-03 08:50 AM",
        },
    ];

    const filteredRiders = riders.filter(
        (rider) =>
            rider.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (statusFilter === "All" || rider.status === statusFilter)
    );

    return (
        <div className="p-6 flex flex-col gap-6">
            {/* Title */}
            <div className="flex justify-between items-center flex-col md:flex-row gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Available Riders</h1>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Status Dropdown */}
                <Dropdown
                    dismissOnClick={true}
                    renderTrigger={() => (
                        <button className="flex items-center gap-2 border border-indigo-500 bg-indigo-100 text-indigo-900 font-semibold text-sm px-4 py-1 rounded-full shadow hover:shadow-md transition">
                            {`Status: ${statusFilter}`}
                            <ChevronDown className="w-4 h-4 text-indigo-900" />
                        </button>
                    )}
                >
                    {["All", "Available", "On Delivery", "Offline", "Not Available"].map((s) => (
                        <DropdownItem key={s} onClick={() => setStatusFilter(s)}>
                            {s}
                        </DropdownItem>
                    ))}
                </Dropdown>

                {/* Search */}
                <div className="relative w-full max-w-xs">
                    <input
                        type="text"
                        placeholder="Search rider..."
                        className="w-full border border-emerald-300 rounded-full px-4 py-2 pl-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
                </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto rounded-xl shadow-md">
                <table className="min-w-full border border-gray-300 text-sm text-left text-gray-700">
                    <thead className="bg-emerald-600 text-white">
                    <tr>
                        <th className="p-3 border border-gray-300 font-medium">Rider ID</th>
                        <th className="p-3 border border-gray-300 font-medium">Name</th>
                        <th className="p-3 border border-gray-300 font-medium">Status</th>
                        <th className="p-3 border border-gray-300 font-medium">Orders Today</th>
                        <th className="p-3 border border-gray-300 font-medium">Last Assigned</th>
                        <th className="p-3 border border-gray-300 font-medium">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-gray-50">
                    {filteredRiders.length > 0 ? (
                        filteredRiders.map((rider, index) => (
                            <tr key={index} className="hover:bg-indigo-50 transition">
                                <td className="p-3 border border-gray-300 font-medium">{rider.id}</td>
                                <td className="p-3 border border-gray-300 flex items-center gap-2">
                                    <Bike className="w-4 h-4 text-indigo-500" />
                                    {rider.name}
                                </td>
                                <td className="p-3 border border-gray-300 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-green-500" />
                                    {rider.contact}
                                </td>
                                <td className="p-3 border border-gray-300">
                    <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                            rider.status === "Available"
                                ? "bg-green-100 text-green-700"
                                : rider.status === "On Delivery"
                                    ? "bg-orange-100 text-orange-700"
                                    : rider.status === "Offline"
                                        ? "bg-gray-200 text-gray-700"
                                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {rider.status}
                    </span>
                                </td>
                                <td className="p-3 border border-gray-300">{rider.ordersToday}</td>
                                <td className="p-3 border border-gray-300 flex items-center gap-2">
                                    <CalendarClock className="w-4 h-4 text-gray-500" />
                                    <span>{rider.lastAssigned}</span>
                                </td>
                                <td className="p-3 border border-gray-300 space-x-2">
                                    <button className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium">
                                        View
                                    </button>
                                    <button className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium">
                                        Add
                                    </button>
                                    <button className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 font-medium">
                                        Edit
                                    </button>
                                    <button className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7} className="p-4 text-center text-gray-500 border border-gray-300">
                                No riders found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
