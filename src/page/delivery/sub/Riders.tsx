import { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  Phone,
  CalendarClock,
  Eye,
  Pencil,
  Trash,
  CircleDot,
  MapPin,
  Star,
  Activity,
  Briefcase,
  MoreVertical,
} from "lucide-react";
import { Dropdown, DropdownItem } from "flowbite-react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import RiderFormModal from "../../../components/driver/RiderFormModal";

type RiderStatus = "Available" | "On Delivery" | "Offline" | "Not Available";
type SortOption = "Name" | "Status" | "Deliveries" | "Rating";

export type Rider = {
  id: string;
  name: string;
  contact: string;
  status: RiderStatus;
  ordersToday: number;
  lastAssigned: string;
  rating: number;
  completedDeliveries: number;
  workload: number;
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
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const [riders, setRiders] = useState<Rider[]>(initialRiders);

  // 🔥 Modal for EDIT only
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Rider | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const getStatusStyles = (status: RiderStatus) => {
    if (status === "Available") return "bg-emerald-100 text-emerald-700";
    if (status === "On Delivery") return "bg-amber-100 text-amber-700";
    if (status === "Offline") return "bg-slate-100 text-slate-700";
    return "bg-rose-100 text-rose-700";
  };

  const getStatusDot = (status: RiderStatus) => {
    if (status === "Available") return "text-emerald-500";
    if (status === "On Delivery") return "text-amber-500";
    if (status === "Offline") return "text-slate-400";
    return "text-rose-500";
  };

  const openProfile = (rider: Rider) => {
    setSelectedRider(rider);
    setIsProfileOpen(true);
  };

  const closeProfile = () => setIsProfileOpen(false);

  // 🔥 OPEN EDIT MODAL
  const openEditModal = (rider: Rider) => {
    setEditTarget(rider);
    setIsFormOpen(true);
  };

  // 🔥 DELETE RIDER
  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Delete Rider?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        setRiders((prev) => prev.filter((r) => r.id !== id));
        Swal.fire("Deleted!", "The rider has been removed.", "success");
      }
    });
  };

  // 🔥 EDIT ONLY — ADD REMOVED
  const handleFormSubmit = (data: any) => {
    if (editTarget) {
      setRiders((prev) =>
        prev.map((r) =>
          r.id === editTarget.id
            ? {
                ...r,
                name: data.name,
                contact: data.contact,
                homeBase: data.homeBase,
                status: data.status,
                ordersToday: data.ordersToday ?? 0,
              }
            : r
        )
      );

      Swal.fire("Updated!", "Rider details updated successfully.", "success");
    }

    setIsFormOpen(false);
  };

  const filteredRiders = useMemo(() => {
    let data = riders.filter(
      (rider) =>
        rider.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) &&
        (statusFilter === "All" || rider.status === statusFilter)
    );

    data = [...data].sort((a, b) => {
      if (sortBy === "Name") return a.name.localeCompare(b.name);
      if (sortBy === "Status") return a.status.localeCompare(b.status);
      if (sortBy === "Deliveries")
        return b.completedDeliveries - a.completedDeliveries;
      if (sortBy === "Rating") return b.rating - a.rating;
      return 0;
    });

    return data;
  }, [riders, searchTerm, statusFilter, sortBy]);

  const totalRiders = riders.length;
  const availableCount = riders.filter((r) => r.status === "Available").length;
  const onDeliveryCount = riders.filter(
    (r) => r.status === "On Delivery"
  ).length;
  const offlineCount = riders.filter((r) => r.status === "Offline").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative p-6 md:p-8 flex flex-col gap-8 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* 🔥 ENTIRE UI BELOW IS UNMODIFIED — ONLY ADD REMOVED */}

      {/* ===== GLOBAL HUD BACKDROP ===== */}
      <div className="pointer-events-none absolute inset-0 -z-30">
        <div className="w-full h-full opacity-40 mix-blend-soft-light bg-[linear-gradient(to_right,rgba(148,163,184,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.15)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="absolute inset-0 opacity-[0.08] mix-blend-soft-light bg-[repeating-linear-gradient(to_bottom,rgba(15,23,42,0.85)_0px,rgba(15,23,42,0.85)_1px,transparent_1px,transparent_3px)]" />

        <motion.div
          className="absolute -top-20 -left-16 h-64 w-64 bg-emerald-500/28 blur-3xl"
          animate={{
            x: [0, 20, 10, -5, 0],
            y: [0, 10, 20, 5, 0],
            borderRadius: ["45%", "60%", "55%", "65%", "45%"],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute right-0 bottom-[-5rem] h-72 w-72 bg-sky-400/24 blur-3xl"
          animate={{
            x: [0, -15, -25, -10, 0],
            y: [0, -10, -20, -5, 0],
            borderRadius: ["50%", "65%", "55%", "70%", "50%"],
          }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* ===== SPOTLIGHT ===== */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background: `radial-gradient(550px at ${cursorPos.x}px ${cursorPos.y}px, rgba(34,197,94,0.26), transparent 70%)
        `,
        }}
      />

      {/* ===== PAGE HEADER ===== */}
      <div className="relative flex flex-col gap-3">
        <motion.h1
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-600 bg-clip-text text-transparent"
        >
          Riders Management
        </motion.h1>

        <p className="text-gray-500 text-sm max-w-xl">
          Live{" "}
          <span className="font-medium text-emerald-700">
            rider performance & availability
          </span>{" "}
          dashboard to track assignments, workload, and status.
        </p>

        <div className="mt-3 h-[3px] w-24 bg-gradient-to-r from-emerald-400 via-emerald-500 to-transparent rounded-full" />
      </div>

      {/* ===== MAIN HUD CONTAINER ===== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[26px] border border-emerald-500/30 bg-white/90 shadow-[0_22px_70px_rgba(15,23,42,0.40)] overflow-hidden"
      >
        {/* brackets */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-3 left-3 h-5 w-5 border-t-2 border-l-2 border-emerald-400/80" />
          <div className="absolute top-3 right-3 h-5 w-5 border-t-2 border-r-2 border-emerald-400/80" />
          <div className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-emerald-400/80" />
          <div className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-emerald-400/80" />
        </div>

        <div className="relative flex flex-col gap-8 p-5 md:p-6 lg:p-7">
          {/* scanning line */}
          <motion.div
            className="pointer-events-none absolute top-10 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent opacity-70"
            animate={{ x: ["-20%", "20%", "-20%"] }}
            transition={{ duration: 5, repeat: Infinity }}
          />

          {/* ===== TABS + SUMMARY ===== */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-3 overflow-x-auto pb-1">
              {["All", "Available", "On Delivery", "Offline", "Not Available"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() =>
                      setStatusFilter(tab as "All" | RiderStatus)
                    }
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border transition whitespace-nowrap
                      ${
                        statusFilter === tab
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-400/50"
                          : "bg-white/90 border-gray-300 text-gray-700 hover:bg-emerald-50"
                      }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <RiderSummaryCard
                icon={<Activity className="w-7 h-7" />}
                label="Available Riders"
                value={availableCount.toString()}
                accent="Ready to accept new orders"
                color="emerald"
              />
              <RiderSummaryCard
                icon={<Briefcase className="w-7 h-7" />}
                label="On Delivery"
                value={onDeliveryCount.toString()}
                accent="Currently delivering orders"
                color="amber"
              />
              <RiderSummaryCard
                icon={<CalendarClock className="w-7 h-7" />}
                label="Offline Riders"
                value={offlineCount.toString()}
                accent="Currently off-duty"
                color="slate"
              />
              <RiderSummaryCard
                icon={<MoreVertical className="w-7 h-7" />}
                label="Total Riders"
                value={totalRiders.toString()}
                accent="Overall capacity"
                color="indigo"
              />
            </section>
          </div>

          {/* ===== FILTERS ===== */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Dropdown
                dismissOnClick
                renderTrigger={() => (
                  <button className="flex items-center gap-2 border border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold text-xs sm:text-sm px-4 py-2 rounded-full shadow hover:bg-emerald-100 transition">
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

              <Dropdown
                dismissOnClick
                renderTrigger={() => (
                  <button className="flex items-center gap-2 border border-gray-300 bg-white text-gray-800 font-medium text-xs sm:text-sm px-4 py-2 rounded-full shadow-sm hover:bg-gray-50 transition">
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

            <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="Search rider..."
                className="w-full border border-emerald-300/80 rounded-xl px-4 py-2 pl-11 shadow-sm bg-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-emerald-500 w-5 h-5" />
            </div>
          </div>

          {/* ===== TABLE ===== */}
          <div className="overflow-x-auto rounded-xl shadow-[0_18px_55px_rgba(15,23,42,0.18)] border border-gray-200 bg-slate-50/70">
            <table className="min-w-full text-sm bg-white table-fixed">
              <thead className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-slate-100 sticky top-0 shadow">
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
                    <th
                      key={h}
                      className="p-4 text-left font-semibold border-b text-xs md:text-sm"
                    >
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
                      className="hover:bg-emerald-50/70 transition border-b last:border-none"
                    >
                      {/* Rider */}
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 flex items-center justify-center font-semibold text-lg">
                            {rider.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {rider.name}
                            </p>
                            <span className="text-gray-400 text-xs">
                              {rider.id}
                            </span>
                            <p className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                              <MapPin className="w-3 h-3 text-emerald-500" />
                              {rider.homeBase}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2 text-gray-700 text-xs md:text-sm">
                          <Phone className="w-4 h-4 text-emerald-500" />
                          {rider.contact}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4 align-middle">
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
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="w-4 h-4 fill-yellow-400" />
                          <span className="font-semibold text-gray-800">
                            {rider.rating.toFixed(1)}
                          </span>
                        </div>
                      </td>

                      {/* Completed */}
                      <td className="p-4 align-middle text-gray-800 font-medium">
                        {rider.completedDeliveries}
                      </td>

                      {/* Orders Today */}
                      <td className="p-4 align-middle">
                        <p className="font-medium text-gray-700 text-sm">
                          {rider.ordersToday}
                        </p>
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
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2 text-gray-700 text-xs md:text-sm">
                          <CalendarClock className="w-4 h-4 text-gray-500" />
                          {rider.lastAssigned}
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="p-4 align-middle">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="w-9 h-9 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition shadow-sm flex items-center justify-center"
                            onClick={() => openProfile(rider)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            className="w-9 h-9 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition shadow-sm flex items-center justify-center"
                            onClick={() => openEditModal(rider)}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            className="w-9 h-9 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition shadow-sm flex items-center justify-center"
                            onClick={() => handleDelete(rider.id)}
                          >
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
                      className="text-center p-5 text-gray-500 bg-gray-50 text-sm"
                    >
                      No riders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* ===== RIDER PROFILE DRAWER ===== */}
      {isProfileOpen && selectedRider && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="flex-1 bg-slate-950/70 backdrop-blur-sm"
            onClick={closeProfile}
          />

          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-50 shadow-[0_25px_80px_rgba(15,23,42,0.9)] p-6 border-l border-emerald-500/40 overflow-y-auto"
          >
            <div className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.45),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.45),transparent_55%)]" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-50">
                    Rider Profile
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {selectedRider.id}
                  </p>
                </div>
                <button
                  className="text-slate-400 hover:text-slate-200 text-sm px-2 py-1 rounded-full bg-slate-800/80 border border-slate-600/70"
                  onClick={closeProfile}
                >
                  ✕
                </button>
              </div>

              {/* HEADER */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-300 to-teal-300 text-emerald-950 flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-500/40">
                  {selectedRider.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-50">
                    {selectedRider.name}
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
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
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <CalendarClock className="w-3 h-3" />
                      {selectedRider.lastActive}
                    </span>
                  </div>
                </div>
              </div>

              {/* STATS */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="border border-slate-700/80 rounded-lg p-3 bg-slate-900/70">
                  <p className="text-[11px] text-slate-400">Rating</p>
                  <div className="flex items-center gap-1 mt-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-yellow-400" />
                    <span className="font-semibold text-slate-50">
                      {selectedRider.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="border border-slate-700/80 rounded-lg p-3 bg-slate-900/70">
                  <p className="text-[11px] text-slate-400">Deliveries</p>
                  <p className="font-semibold text-slate-50 mt-1">
                    {selectedRider.completedDeliveries}
                  </p>
                </div>

                <div className="border border-slate-700/80 rounded-lg p-3 bg-slate-900/70">
                  <p className="text-[11px] text-slate-400">
                    Today&apos;s Load
                  </p>
                  <p className="font-semibold text-slate-50 mt-1">
                    {selectedRider.ordersToday} orders
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[11px] text-slate-400 mb-1">Workload</p>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-emerald-400"
                    style={{ width: `${selectedRider.workload}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {selectedRider.workload}% estimated load for today
                </p>
              </div>

              {/* CONTACT */}
              <div className="border border-slate-700/80 rounded-lg p-3 bg-slate-900/70 mb-4">
                <p className="text-[11px] text-slate-400 mb-1">Contact</p>
                <p className="flex items-center gap-2 text-sm text-slate-100">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  {selectedRider.contact}
                </p>
                <p className="flex items-center gap-2 text-[11px] text-slate-400 mt-2">
                  <CalendarClock className="w-3 h-3 text-slate-400" />
                  Last assigned: {selectedRider.lastAssigned}
                </p>
              </div>

              <div className="border border-slate-700/80 rounded-lg p-3 bg-slate-900/80 mb-2">
                <p className="text-[11px] text-slate-400 mb-1">
                  Notes / Next Actions
                </p>
                <p className="text-xs text-slate-200">
                  Connect this to your API later for detailed profile features.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ===== EDIT MODAL ===== */}
      <RiderFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editTarget || undefined}
      />
    </motion.div>
  );
}

/* ============================================================
   SUB COMPONENTS
============================================================ */

function RiderSummaryCard({
  icon,
  label,
  value,
  accent,
  color = "emerald",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
  color: "emerald" | "amber" | "slate" | "indigo";
}) {
  const colors: Record<typeof color, string> = {
    emerald: "from-emerald-500 to-emerald-700",
    amber: "from-amber-500 to-amber-700",
    slate: "from-slate-600 to-slate-800",
    indigo: "from-indigo-500 to-indigo-700",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -6,
        scale: 1.03,
        boxShadow: "0 22px 60px rgba(15,23,42,0.35)",
      }}
      transition={{ duration: 0.35 }}
      className={`relative p-5 rounded-2xl border border-white/40 text-white bg-gradient-to-br ${colors[color]} shadow-xl overflow-hidden`}
    >
      <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.5),transparent_55%)]" />
      <div className="relative flex items-center gap-3">
        <div className="p-3 bg-white/15 rounded-xl flex items-center justify-center">
          {icon}
        </div>

        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.16em] text-white/80">
            {label}
          </p>
          <p className="text-2xl md:text-3xl font-bold leading-tight">
            {value}
          </p>
          <p className="text-[0.7rem] text-white/80 mt-1">{accent}</p>
        </div>
      </div>
    </motion.div>
  );
}
