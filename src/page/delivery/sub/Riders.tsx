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
  MapPin,
  Star,
  Activity,
  Briefcase,
  MoreVertical,
} from "lucide-react";
import { Dropdown, DropdownItem } from "flowbite-react";

type RiderStatus = "Available" | "On Delivery" | "Offline" | "Not Available";
type SortOption = "Name" | "Status" | "Deliveries" | "Rating";

type Rider = {
  id: string;
  name: string;
  contact: string;
  status: RiderStatus;
  ordersToday: number;
  lastAssigned: string;
  rating: number;
  completedDeliveries: number;
  workload: number; // 0 - 100 (%)
  lastActive: string;
  homeBase: string;
};

const initialRiders: Rider[] = [
  {
    id: "RDR-001",
    name: "Carlos Dela Cruz",
    contact: "0917-123-4567",
    status: "Available",
    ordersToday: 7,
    lastAssigned: "2025-07-03 10:45 AM",
    rating: 4.9,
    completedDeliveries: 152,
    workload: 60,
    lastActive: "Online • 5 mins ago",
    homeBase: "Tanauan City, Batangas",
  },
  {
    id: "RDR-002",
    name: "Jomar Castillo",
    contact: "0918-987-6543",
    status: "On Delivery",
    ordersToday: 4,
    lastAssigned: "2025-07-03 09:30 AM",
    rating: 4.7,
    completedDeliveries: 98,
    workload: 80,
    lastActive: "On delivery route",
    homeBase: "Talisay, Batangas",
  },
  {
    id: "RDR-003",
    name: "Leo Mariano",
    contact: "0916-555-1234",
    status: "Offline",
    ordersToday: 0,
    lastAssigned: "2025-07-02 06:15 PM",
    rating: 4.5,
    completedDeliveries: 74,
    workload: 0,
    lastActive: "Last seen • 10 hours ago",
    homeBase: "Sto. Tomas, Batangas",
  },
  {
    id: "RDR-004",
    name: "Samuel Reyes",
    contact: "0921-765-4321",
    status: "Not Available",
    ordersToday: 2,
    lastAssigned: "2025-07-03 08:50 AM",
    rating: 4.2,
    completedDeliveries: 45,
    workload: 40,
    lastActive: "On break",
    homeBase: "Malvar, Batangas",
  },
];

export default function Riders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | RiderStatus>("All");
  const [sortBy, setSortBy] = useState<SortOption>("Name");
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [riders] = useState<Rider[]>(initialRiders);

  const getStatusStyles = (status: RiderStatus) => {
    if (status === "Available") return "bg-green-100 text-green-700";
    if (status === "On Delivery") return "bg-orange-100 text-orange-700";
    if (status === "Offline") return "bg-gray-100 text-gray-700";
    return "bg-red-100 text-red-700";
  };

  const getStatusDot = (status: RiderStatus) => {
    if (status === "Available") return "text-green-500";
    if (status === "On Delivery") return "text-orange-500";
    if (status === "Offline") return "text-gray-400";
    return "text-red-500";
  };

  const openProfile = (rider: Rider) => {
    setSelectedRider(rider);
    setIsProfileOpen(true);
  };

  const closeProfile = () => setIsProfileOpen(false);

  const filteredRiders = useMemo(() => {
    let data = riders.filter(
      (rider) =>
        rider.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (statusFilter === "All" || rider.status === statusFilter)
    );

    data = [...data].sort((a, b) => {
      if (sortBy === "Name") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "Status") {
        return a.status.localeCompare(b.status);
      }
      if (sortBy === "Deliveries") {
        return b.completedDeliveries - a.completedDeliveries;
      }
      if (sortBy === "Rating") {
        return b.rating - a.rating;
      }
      return 0;
    });

    return data;
  }, [riders, searchTerm, statusFilter, sortBy]);

  const totalRiders = riders.length;
  const availableCount = riders.filter((r) => r.status === "Available").length;
  const onDeliveryCount = riders.filter((r) => r.status === "On Delivery").length;
  const offlineCount = riders.filter((r) => r.status === "Offline").length;

  return (
    <div className="p-6 flex flex-col gap-8">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl shadow-xl p-6 text-white">
        <h1 className="text-3xl font-bold tracking-tight">Riders Management</h1>
        <p className="text-emerald-100 text-sm mt-1 opacity-90">
          Monitor active riders, availability, performance, and assignments.
        </p>
      </div>

      {/* STATUS TABS */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {["All", "Available", "On Delivery", "Offline", "Not Available"].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab as "All" | RiderStatus)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition whitespace-nowrap
              ${
                statusFilter === tab
                  ? "bg-emerald-600 text-white border-emerald-600 shadow"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: "Available Riders",
            value: availableCount,
            icon: Activity,
            color: "text-green-700",
            bg: "bg-green-50",
          },
          {
            label: "On Delivery",
            value: onDeliveryCount,
            icon: Briefcase,
            color: "text-orange-700",
            bg: "bg-orange-50",
          },
          {
            label: "Offline",
            value: offlineCount,
            icon: CalendarClock,
            color: "text-gray-700",
            bg: "bg-gray-50",
          },
          {
            label: "Total Riders",
            value: totalRiders,
            icon: MoreVertical,
            color: "text-blue-700",
            bg: "bg-blue-50",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg}`}
              >
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">
                  {card.label}
                </p>
                <p className="text-2xl font-bold mt-1 text-gray-900">
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FILTERS ROW */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">

        {/* Left filters group */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">

          {/* Status Dropdown (optional, kasi may tabs na) */}
          <Dropdown
            dismissOnClick
            renderTrigger={() => (
              <button className="flex items-center gap-2 border border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold text-sm px-4 py-2 rounded-full shadow hover:bg-emerald-100 transition">
                Status: {statusFilter}
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          >
            {["All", "Available", "On Delivery", "Offline", "Not Available"].map(
              (s) => (
                <DropdownItem key={s} onClick={() => setStatusFilter(s as any)}>
                  {s}
                </DropdownItem>
              )
            )}
          </Dropdown>

          {/* Sort dropdown */}
          <Dropdown
            dismissOnClick
            label=""
            renderTrigger={() => (
              <button className="flex items-center gap-2 border border-gray-300 bg-white text-gray-800 font-medium text-sm px-4 py-2 rounded-full shadow-sm hover:bg-gray-50 transition">
                Sort by: {sortBy}
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          >
            {["Name", "Status", "Deliveries", "Rating"].map((opt) => (
              <DropdownItem
                key={opt}
                onClick={() => setSortBy(opt as SortOption)}
              >
                {opt}
              </DropdownItem>
            ))}
          </Dropdown>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Search rider..."
            className="w-full border border-gray-300 rounded-xl px-4 py-2 pl-11 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl shadow-xl border border-gray-200">
        <table className="min-w-full text-sm bg-white">
          <thead className="bg-gray-100 text-gray-700 sticky top-0 shadow">
            <tr>
              {[
                "Rider",
                "Contact",
                "Status",
                "Rating",
                "Completed",
                "Orders Today",
                "Last Assigned",
                "Actions",
              ].map((h) => (
                <th key={h} className="p-4 text-left font-semibold border-b">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredRiders.length > 0 ? (
              filteredRiders.map((rider, index) => (
                <tr
                  key={index}
                  className="hover:bg-emerald-50 transition border-b last:border-none"
                >

                  {/* Rider */}
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 flex items-center justify-center font-semibold text-lg">
                      {rider.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {rider.name}
                      </p>
                      <span className="text-gray-400 text-xs">{rider.id}</span>
                      <p className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                        <MapPin className="w-3 h-3 text-emerald-500" />
                        {rider.homeBase}
                      </p>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="p-4 flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4 text-emerald-500" />
                    {rider.contact}
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyles(
                        rider.status
                      )}`}
                    >
                      <CircleDot
                        className={`w-3 h-3 ${getStatusDot(rider.status)}`}
                      />
                      {rider.status}
                    </span>
                    <p className="text-[11px] text-gray-500 mt-1">
                      {rider.lastActive}
                    </p>
                  </td>

                  {/* Rating */}
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-yellow-400" />
                      <span className="font-semibold text-gray-800">
                        {rider.rating.toFixed(1)}
                      </span>
                    </div>
                  </td>

                  {/* Completed Deliveries */}
                  <td className="p-4 text-gray-800 font-medium">
                    {rider.completedDeliveries}
                  </td>

                  {/* Orders Today */}
                  <td className="p-4 font-medium text-gray-700">
                    {rider.ordersToday}
                    <div className="mt-1 w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-emerald-500"
                        style={{ width: `${rider.workload}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Workload: {rider.workload}%
                    </p>
                  </td>

                  {/* Last Assigned */}
                  <td className="p-4 flex items-center gap-2 text-gray-700">
                    <CalendarClock className="w-4 h-4 text-gray-500" />
                    {rider.lastAssigned}
                  </td>

                  {/* ACTION BUTTONS */}
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">

                      {/* View Profile */}
                      <button
                        className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition shadow-sm"
                        onClick={() => openProfile(rider)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Assign (stub for now) */}
                      <button className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition shadow-sm">
                        <Plus className="w-4 h-4" />
                      </button>

                      {/* Edit */}
                      <button className="p-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition shadow-sm">
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition shadow-sm">
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="text-center p-5 text-gray-500 bg-gray-50"
                >
                  No riders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* RIDER PROFILE DRAWER */}
      {isProfileOpen && selectedRider && (
        <div className="fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div
            className="flex-1 bg-black/40"
            onClick={closeProfile}
          />
          {/* Drawer */}
          <div className="w-full max-w-md bg-white shadow-2xl p-6 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Rider Profile
                </h2>
                <p className="text-xs text-gray-500">{selectedRider.id}</p>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={closeProfile}
              >
                ✕
              </button>
            </div>

            {/* Profile Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-200 to-teal-200 text-emerald-800 flex items-center justify-center font-bold text-xl">
                {selectedRider.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {selectedRider.name}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-500" />
                  {selectedRider.homeBase}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold ${getStatusStyles(
                      selectedRider.status
                    )}`}
                  >
                    <CircleDot
                      className={`w-3 h-3 ${getStatusDot(selectedRider.status)}`}
                    />
                    {selectedRider.status}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                    <CalendarClock className="w-3 h-3" />
                    {selectedRider.lastActive}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="border rounded-lg p-3 bg-gray-50">
                <p className="text-[11px] text-gray-500">Rating</p>
                <div className="flex items-center gap-1 mt-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-yellow-400" />
                  <span className="font-semibold text-gray-800">
                    {selectedRider.rating.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="border rounded-lg p-3 bg-gray-50">
                <p className="text-[11px] text-gray-500">Deliveries</p>
                <p className="font-semibold text-gray-800 mt-1">
                  {selectedRider.completedDeliveries}
                </p>
              </div>
              <div className="border rounded-lg p-3 bg-gray-50">
                <p className="text-[11px] text-gray-500">Today&apos;s Load</p>
                <p className="font-semibold text-gray-800 mt-1">
                  {selectedRider.ordersToday} orders
                </p>
              </div>
            </div>

            {/* Workload bar */}
            <div className="mb-4">
              <p className="text-[11px] text-gray-500 mb-1">Workload</p>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-emerald-500"
                  style={{ width: `${selectedRider.workload}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                {selectedRider.workload}% estimated load for today
              </p>
            </div>

            {/* Contact info */}
            <div className="border rounded-lg p-3 bg-white mb-4">
              <p className="text-[11px] text-gray-500 mb-1">Contact</p>
              <p className="flex items-center gap-2 text-sm text-gray-700">
                <Phone className="w-4 h-4 text-emerald-500" />
                {selectedRider.contact}
              </p>
              <p className="flex items-center gap-2 text-[11px] text-gray-500 mt-2">
                <CalendarClock className="w-3 h-3 text-gray-500" />
                Last assigned: {selectedRider.lastAssigned}
              </p>
            </div>

            {/* Future extension area */}
            <div className="border rounded-lg p-3 bg-slate-50 mb-2">
              <p className="text-[11px] text-gray-500 mb-1">
                Notes / Next Actions (placeholder)
              </p>
              <p className="text-xs text-gray-600">
                You can connect this profile drawer to your Riders API later to
                show license details, documents, infractions, or schedule.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
