import { useState } from "react";
import {
    Search, ChevronDown, Star,
    Users, UserCheck, UserX, CalendarClock
} from "lucide-react";
import { Dropdown, DropdownItem } from "flowbite-react";

export default function MembershipOverviewPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("Status");

    const members = [
        { name: "Nathaniel Cruz", start: "2024-01-10", expiry: "2025-01-09", points: 2300, status: "Active" },
        { name: "Alyssa Gomez", start: "2023-08-14", expiry: "2024-08-13", points: 1800, status: "Expiring Soon" },
        { name: "John Reyes", start: "2022-09-01", expiry: "2023-09-01", points: 500, status: "Inactive" },
    ];

    return (
        <div className="p-6 flex flex-col gap-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Membership Overview</h1>

                {/* Search */}
                <div className="relative w-full max-w-xs">
                    <input
                        type="text"
                        placeholder="Search members..."
                        className="w-full border border-emerald-300 rounded-full px-4 py-2 pl-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-6">
                {/* Data Table + Dropdown */}
                <div className="md:col-span-8 md:row-span-1 flex flex-col gap-0">
                    {/* Dropdown */}
                    <div className="flex justify-between items-center pb-2">
                        <Dropdown
                            dismissOnClick={true}
                            renderTrigger={() => (
                                <button className="flex items-center gap-2 border border-emerald-500 bg-emerald-100 text-indigo-900 font-semibold text-sm px-4 py-1 rounded-full shadow hover:shadow-md transition">
                                    {`Sort By: ${filter}`}
                                    <ChevronDown className="w-4 h-4 text-emerald-900" />
                                </button>
                            )}
                        >
                            <DropdownItem onClick={() => setFilter("Status")}>Status</DropdownItem>
                            <DropdownItem onClick={() => setFilter("Expiry Date")}>Expiry Date</DropdownItem>
                            <DropdownItem onClick={() => setFilter("Total Points")}>Total Points</DropdownItem>
                        </Dropdown>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto rounded-xl shadow-md">
                        <table className="min-w-full border border-gray-300 text-sm text-left text-gray-700">
                            <thead className="bg-emerald-600 text-white">
                            <tr>
                                <th className="p-3 border border-gray-300 font-medium">Name</th>
                                <th className="p-3 border border-gray-300 font-medium">Subscription Start</th>
                                <th className="p-3 border border-gray-300 font-medium">Expiry Date</th>
                                <th className="p-3 border border-gray-300 font-medium">Total Points</th>
                                <th className="p-3 border border-gray-300 font-medium">Status</th>
                            </tr>
                            </thead>
                            <tbody className="bg-gray-50">
                            {members.length > 0 ? (
                                members.map((m, i) => (
                                    <tr key={i} className="hover:bg-emerald-100 transition">
                                        <td className="p-3 border border-gray-300 font-medium">{m.name}</td>
                                        <td className="p-3 border border-gray-300">{m.start}</td>
                                        <td className="p-3 border border-gray-300">{m.expiry}</td>
                                        <td className="p-3 border border-gray-300">{m.points}</td>
                                        <td className="p-3 border border-gray-300">
                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                                m.status === "Active"
                                    ? "text-green-700 bg-green-100"
                                    : m.status === "Expiring Soon"
                                        ? "text-orange-700 bg-orange-100"
                                        : "text-gray-700 bg-gray-200"
                            }`}>
                                {m.status}
                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-gray-500 border border-gray-300">
                                        No members found.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                </div>

                {/* Top Points Earner - spans 2 rows, aligned to top */}
                <div className="md:col-span-4 md:row-span-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all h-full flex flex-col">
                    {/* Label/Header at Top */}
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-200 animate-pulse" />
                            Top Points Earner
                        </h2>
                    </div>

                    {/* Earner Details: icon and name aligned at top */}
                    <div className="flex items-start gap-4">
                        {/* Icon/Badge */}
                        <div className="bg-white/20 p-3 rounded-full shadow-md">
                            <Star className="w-8 h-8 text-white" />
                        </div>

                        {/* Name and Points aligned to top */}
                        <div className="flex flex-col">
                            <div className="flex items-start gap-2">
                                <span className="text-lg font-semibold text-white">Nathaniel Cruz</span>
                                <span className="inline-block px-2 py-0.5 text-xs font-bold text-emerald-800 bg-yellow-300 rounded-full shadow-sm">
          🏆 #1
        </span>
                            </div>
                            <div className="text-sm text-emerald-100 mt-1">2,300 Points</div>
                        </div>
                    </div>
                </div>




                {/* Membership Analytics */}
                <div className="md:col-span-8 md:row-span-1 bg-white p-6 rounded-2xl shadow hover:shadow-xl transition-all">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-600" />
                        Membership Analytics
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        {/* New Members */}
                        <div className="flex items-center gap-3 bg-indigo-50 rounded-lg p-4 hover:bg-indigo-100 transition">
                            <div className="bg-indigo-100 p-2 rounded-full">
                                <Users className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <div className="text-gray-600">New Members</div>
                                <div className="text-lg font-semibold text-indigo-800">523</div>
                            </div>
                        </div>

                        {/* Active Members */}
                        <div className="flex items-center gap-3 bg-green-50 rounded-lg p-4 hover:bg-green-100 transition">
                            <div className="bg-green-100 p-2 rounded-full">
                                <UserCheck className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <div className="text-gray-600">Active Members</div>
                                <div className="text-lg font-semibold text-green-700">1,238</div>
                            </div>
                        </div>

                        {/* Inactive Members */}
                        <div className="flex items-center gap-3 bg-red-50 rounded-lg p-4 hover:bg-red-100 transition">
                            <div className="bg-red-100 p-2 rounded-full">
                                <UserX className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <div className="text-gray-600">Inactive Members</div>
                                <div className="text-lg font-semibold text-red-700">214</div>
                            </div>
                        </div>

                        {/* Expiring This Month */}
                        <div className="flex items-center gap-3 bg-orange-50 rounded-lg p-4 hover:bg-orange-100 transition">
                            <div className="bg-orange-100 p-2 rounded-full">
                                <CalendarClock className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <div className="text-gray-600">Expiring This Month</div>
                                <div className="text-lg font-semibold text-orange-600">28</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
