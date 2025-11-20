import { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  Phone,
  CalendarClock,
  Eye,
  Pencil,
  Trash,
  Plus,
  CircleDot,
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

  const filteredRiders = useMemo(() => {
    return riders.filter(
      (rider) =>
        rider.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (statusFilter === "All" || rider.status === statusFilter)
    );
  }, [searchTerm, statusFilter]);

  const getStatusStyles = (status: string) => {
    if (status === "Available") return "bg-green-100 text-green-700";
    if (status === "On Delivery") return "bg-orange-100 text-orange-700";
    if (status === "Offline") return "bg-gray-100 text-gray-700";
    return "bg-red-100 text-red-700";
  };

  const getStatusDot = (status: string) => {
    if (status === "Available") return "text-green-500";
    if (status === "On Delivery") return "text-orange-500";
    if (status === "Offline") return "text-gray-400";
    return "text-red-500";
  };

  return (
    <div className="p-6 flex flex-col gap-8">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Riders Management</h1>
        <p className="text-emerald-100 text-sm mt-1">
          Monitor active riders, availability, and assignments.
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Available", value: 1, color: "bg-green-100 text-green-700" },
          { label: "On Delivery", value: 1, color: "bg-orange-100 text-orange-700" },
          { label: "Offline", value: 1, color: "bg-gray-100 text-gray-700" },
          { label: "Total Riders", value: riders.length, color: "bg-blue-100 text-blue-700" },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow hover:shadow-md transition"
          >
            <p className="text-sm font-medium text-gray-600">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Status Dropdown */}
        <Dropdown
          dismissOnClick
          renderTrigger={() => (
            <button className="flex items-center gap-2 border border-emerald-500 bg-emerald-100 text-emerald-900 font-semibold text-sm px-4 py-1 rounded-full shadow hover:shadow-md transition">
              Status: {statusFilter}
              <ChevronDown className="w-4 h-4" />
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
            className="w-full border border-emerald-300 rounded-xl px-4 py-2 pl-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
        <table className="min-w-full text-sm bg-white">
          <thead className="bg-slate-100 text-gray-700 sticky top-0">
            <tr>
              <th className="p-3 text-left font-semibold border-b">Rider</th>
              <th className="p-3 text-left font-semibold border-b">Contact</th>
              <th className="p-3 text-left font-semibold border-b">Status</th>
              <th className="p-3 text-left font-semibold border-b">Orders Today</th>
              <th className="p-3 text-left font-semibold border-b">Last Assigned</th>
              <th className="p-3 text-left font-semibold border-b text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredRiders.length > 0 ? (
              filteredRiders.map((rider, index) => (
                <tr
                  key={index}
                  className="hover:bg-emerald-50 transition border-b last:border-none"
                >
                  {/* RIDER + AVATAR */}
                  <td className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">
                      {rider.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{rider.name}</p>
                      <span className="text-gray-400 text-xs">{rider.id}</span>
                    </div>
                  </td>

                  {/* CONTACT */}
                  <td className="p-3 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-500" />
                    {rider.contact}
                  </td>

                  {/* STATUS */}
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyles(
                        rider.status
                      )}`}
                    >
                      <CircleDot className={`w-3 h-3 ${getStatusDot(rider.status)}`} />
                      {rider.status}
                    </span>
                  </td>

                  <td className="p-3">{rider.ordersToday}</td>

                  {/* LAST ASSIGNED */}
                  <td className="p-3 flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-gray-500" />
                    {rider.lastAssigned}
                  </td>

                  {/* ACTIONS */}
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition">
                        <Plus className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition">
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center p-4 text-gray-500 bg-gray-50 border-t"
                >
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
