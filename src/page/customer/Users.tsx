import { useMemo, useState } from "react";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  CalendarClock,
  TrendingUp,
  Crown,
  Award,
  ChevronDown,
} from "lucide-react";
import { Dropdown, DropdownItem } from "flowbite-react";

type MemberStatus = "Active" | "Expiring Soon" | "Inactive";

type Member = {
  name: string;
  start: string;
  expiry: string;
  points: number;
  status: MemberStatus;
};

const membersData: Member[] = [
  {
    name: "Nathaniel Cruz",
    start: "2024-01-10",
    expiry: "2025-01-09",
    points: 2300,
    status: "Active",
  },
  {
    name: "Alyssa Gomez",
    start: "2023-08-14",
    expiry: "2024-08-13",
    points: 1800,
    status: "Expiring Soon",
  },
  {
    name: "John Reyes",
    start: "2022-09-01",
    expiry: "2023-09-01",
    points: 500,
    status: "Inactive",
  },
];

function getTier(points: number) {
  if (points >= 3000) return "Platinum";
  if (points >= 1500) return "Gold";
  if (points >= 500) return "Silver";
  return "Bronze";
}

function getTierColors(tier: string) {
  switch (tier) {
    case "Platinum":
      return "bg-slate-900 text-slate-100 border border-slate-500";
    case "Gold":
      return "bg-amber-100 text-amber-800 border border-amber-300";
    case "Silver":
      return "bg-slate-100 text-slate-700 border border-slate-300";
    case "Bronze":
    default:
      return "bg-orange-100 text-orange-800 border border-orange-300";
  }
}

function getStatusBadge(status: MemberStatus) {
  if (status === "Active") return "bg-green-100 text-green-700";
  if (status === "Expiring Soon") return "bg-orange-100 text-orange-700";
  return "bg-gray-200 text-gray-700";
}

export default function MembershipOverviewPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | MemberStatus>("All");
  const [sortLabel, setSortLabel] = useState("Status");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const members = membersData;

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchName = m.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus =
        statusFilter === "All" ? true : m.status === statusFilter;
      return matchName && matchStatus;
    });
  }, [searchTerm, statusFilter]);

  const leaderboard = useMemo(
    () =>
      [...members]
        .sort((a, b) => b.points - a.points)
        .slice(0, 3),
    []
  );

  return (
    <div className="p-6 flex flex-col gap-8">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 rounded-2xl p-6 shadow-lg text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Membership Overview</h1>
          <p className="text-emerald-100 text-sm mt-1">
            Monitor membership status, loyalty tiers, and points at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm">
          <span className="px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-300/40">
            Hybrid: Corporate + Rewards Experience
          </span>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: "Active Members", value: 1, color: "text-green-700 bg-green-100" },
          {
            label: "Expiring Soon",
            value: 1,
            color: "text-orange-700 bg-orange-100",
          },
          {
            label: "Inactive Members",
            value: 1,
            color: "text-gray-700 bg-gray-200",
          },
          {
            label: "New This Month",
            value: 25,
            color: "text-blue-700 bg-blue-100",
          },
          {
            label: "Total Members",
            value: members.length,
            color: "text-indigo-700 bg-indigo-100",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow hover:shadow-md transition"
          >
            <p className="text-xs sm:text-sm text-gray-600">{card.label}</p>
            <p className={`text-xl sm:text-2xl font-bold mt-1 ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* SEARCH + FILTER + SORT */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {(["All", "Active", "Expiring Soon", "Inactive"] as const).map(
            (status) => {
              const active = statusFilter === status;
              return (
                <button
                  key={status}
                  onClick={() =>
                    setStatusFilter(status === "All" ? "All" : status)
                  }
                  className={`px-3 py-1.5 rounded-full text-xs sm:text-sm border transition flex items-center gap-1 ${
                    active
                      ? "bg-emerald-600 text-white border-emerald-700 shadow"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-emerald-50"
                  }`}
                >
                  {status === "Active" && (
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                  )}
                  {status === "Expiring Soon" && (
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                  )}
                  {status === "Inactive" && (
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                  )}
                  {status}
                </button>
              );
            }
          )}
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Search members..."
              className="w-full border border-emerald-300 rounded-xl px-4 py-2 pl-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
          </div>

          <Dropdown
            dismissOnClick
            renderTrigger={() => (
              <button className="flex items-center gap-2 border border-emerald-500 bg-emerald-100 text-emerald-900 font-semibold text-xs sm:text-sm px-4 py-2 rounded-full shadow hover:shadow-md transition">
                Sort: {sortLabel}
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          >
            <DropdownItem onClick={() => setSortLabel("Status")}>
              Status
            </DropdownItem>
            <DropdownItem onClick={() => setSortLabel("Expiry Date")}>
              Expiry Date
            </DropdownItem>
            <DropdownItem onClick={() => setSortLabel("Total Points")}>
              Total Points
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* MEMBERS TABLE */}
        <div className="md:col-span-8 bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Members List
          </h2>

          <div className="overflow-x-auto rounded-xl">
            <table className="min-w-full text-sm text-gray-800">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 text-left font-medium">
                    Member
                    <span className="ml-1 text-xs text-gray-400">↕</span>
                  </th>
                  <th className="p-3 text-left font-medium">
                    Start
                    <span className="ml-1 text-xs text-gray-400">↕</span>
                  </th>
                  <th className="p-3 text-left font-medium">
                    Expiry
                    <span className="ml-1 text-xs text-gray-400">↕</span>
                  </th>
                  <th className="p-3 text-left font-medium">
                    Points
                    <span className="ml-1 text-xs text-gray-400">↕</span>
                  </th>
                  <th className="p-3 text-left font-medium">Tier</th>
                  <th className="p-3 text-left font-medium">Status</th>
                  <th className="p-3 text-left font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((m, i) => {
                    const tier = getTier(m.points);
                    return (
                      <tr
                        key={i}
                        className="border-b last:border-none hover:bg-emerald-50 transition cursor-pointer"
                      >
                        <td
                          className="p-3 flex items-center gap-3"
                          onClick={() => setSelectedMember(m)}
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center font-semibold shadow-sm">
                            {m.name.charAt(0)}
                          </div>
                          <span>{m.name}</span>
                        </td>
                        <td className="p-3">{m.start}</td>
                        <td className="p-3">
                          <span className="flex items-center gap-1">
                            {m.expiry}
                            {m.status === "Expiring Soon" && (
                              <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                                Expiring soon
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-indigo-700">
                          {m.points.toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full border ${getTierColors(
                              tier
                            )}`}
                          >
                            {tier}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                              m.status
                            )}`}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => setSelectedMember(m)}
                            className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"
                          >
                            View Profile
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center text-gray-500 p-6 bg-gray-50"
                    >
                      No members found. Try adjusting your filters or search
                      keyword.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT SIDE: TOP EARNER + INSIGHTS */}
        <div className="md:col-span-4 flex flex-col gap-6">
          {/* TOP EARNER / LEADERBOARD */}
          <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 rounded-2xl p-6 shadow-2xl text-white">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-6 h-6 text-yellow-300" />
              <h2 className="text-lg font-bold">Top Members</h2>
            </div>

            <div className="space-y-3">
              {leaderboard.map((m, index) => {
                const tier = getTier(m.points);
                const badges = ["🥇", "🥈", "🥉"];
                return (
                  <div
                    key={m.name}
                    className="flex items-center justify-between bg-white/10 rounded-xl px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{m.name}</p>
                        <p className="text-xs text-emerald-100">
                          {m.points.toLocaleString()} pts • {tier} Tier
                        </p>
                      </div>
                    </div>
                    <span className="text-lg">{badges[index] ?? "⭐"}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MEMBERSHIP INSIGHTS */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Membership Insights
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition flex gap-3">
                <Users className="w-6 h-6 text-indigo-600" />
                <div>
                  <p className="text-gray-600">New Members</p>
                  <p className="text-lg font-bold text-indigo-700">523</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-green-50 hover:bg-green-100 transition flex gap-3">
                <UserCheck className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-gray-600">Active Members</p>
                  <p className="text-lg font-bold text-green-700">1,238</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-red-50 hover:bg-red-100 transition flex gap-3">
                <UserX className="w-6 h-6 text-red-600" />
                <div>
                  <p className="text-gray-600">Inactive Members</p>
                  <p className="text-lg font-bold text-red-700">214</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-orange-50 hover:bg-orange-100 transition flex gap-3">
                <CalendarClock className="w-6 h-6 text-orange-500" />
                <div>
                  <p className="text-gray-600">Expiring This Month</p>
                  <p className="text-lg font-bold text-orange-600">28</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PROFILE MODAL (UI ONLY) */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute right-3 top-3 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              Close
            </button>

            {(() => {
              const m = selectedMember;
              const tier = getTier(m.points);
              const tierColors = getTierColors(tier);
              const progressPercent =
                tier === "Platinum"
                  ? 100
                  : tier === "Gold"
                  ? 75
                  : tier === "Silver"
                  ? 40
                  : 20;

              return (
                <>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Member Profile
                  </h3>

                  {/* Membership Card */}
                  <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 rounded-2xl p-4 text-white shadow-lg mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-emerald-100">
                          Loyalty Membership
                        </p>
                        <p className="text-lg font-bold">{m.name}</p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full border ${tierColors}`}
                      >
                        {tier} Tier
                      </span>
                    </div>
                    <div className="flex justify-between items-end text-xs mt-4">
                      <div>
                        <p className="text-emerald-100">Points</p>
                        <p className="text-base font-bold">
                          {m.points.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-100">Valid Until</p>
                        <p className="font-semibold text-sm">{m.expiry}</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Circle + Details */}
                  <div className="flex gap-4 items-center mb-4">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <div
                        className="w-20 h-20 rounded-full"
                        style={{
                          backgroundImage: `conic-gradient(#22c55e ${progressPercent}%, #e5e7eb ${progressPercent}%)`,
                        }}
                      />
                      <div className="absolute w-14 h-14 rounded-full bg-white flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-700">
                          {progressPercent}%
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      <p className="font-semibold text-gray-800 mb-1">
                        Progress to next tier
                      </p>
                      <p>
                        Keep earning points to upgrade your membership level and
                        unlock more perks.
                      </p>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-3 text-xs text-gray-700 mb-4">
                    <div>
                      <p className="text-gray-500">Status</p>
                      <p className="font-semibold">{m.status}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Start Date</p>
                      <p className="font-semibold">{m.start}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Expiry Date</p>
                      <p className="font-semibold">{m.expiry}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tier</p>
                      <p className="font-semibold">{tier}</p>
                    </div>
                  </div>

                  {/* Activity Preview (UI only) */}
                  <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-700">
                    <p className="font-semibold text-gray-800 mb-2">
                      Recent Activity (UI Only)
                    </p>
                    <ul className="space-y-1">
                      <li>• Earned +150 pts — Grocery purchase at Wrap & Carry.</li>
                      <li>• Earned +80 pts — Delivery order completed.</li>
                      <li>• Membership renewed automatically.</li>
                    </ul>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
