import React, { useMemo, useState } from "react";
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
import { motion } from "framer-motion";

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
  if (status === "Active") return "bg-emerald-100 text-emerald-700";
  if (status === "Expiring Soon") return "bg-amber-100 text-amber-700";
  return "bg-slate-200 text-slate-700";
}

export default function MembershipOverviewPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | MemberStatus>("All");
  const [sortLabel, setSortLabel] = useState("Status");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const members = membersData;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const filteredMembers = useMemo(() => {
    let list = members.filter((m) => {
      const matchName = m.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim());
      const matchStatus =
        statusFilter === "All" ? true : m.status === statusFilter;
      return matchName && matchStatus;
    });

    if (sortLabel === "Status") {
      const order: MemberStatus[] = ["Active", "Expiring Soon", "Inactive"];
      list = [...list].sort(
        (a, b) => order.indexOf(a.status) - order.indexOf(b.status)
      );
    } else if (sortLabel === "Expiry Date") {
      list = [...list].sort(
        (a, b) =>
          new Date(a.expiry).getTime() - new Date(b.expiry).getTime()
      );
    } else if (sortLabel === "Total Points") {
      list = [...list].sort((a, b) => b.points - a.points);
    }

    return list;
  }, [members, searchTerm, statusFilter, sortLabel]);

  const leaderboard = useMemo(
    () => [...members].sort((a, b) => b.points - a.points).slice(0, 3),
    [members]
  );

  const activeCount = useMemo(
    () => members.filter((m) => m.status === "Active").length,
    [members]
  );
  const expiringCount = useMemo(
    () => members.filter((m) => m.status === "Expiring Soon").length,
    [members]
  );
  const inactiveCount = useMemo(
    () => members.filter((m) => m.status === "Inactive").length,
    [members]
  );

  const newThisMonth = 25; // demo static
  const totalMembers = members.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative p-6 md:p-8 flex flex-col gap-8 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* ---------- GLOBAL HUD BACKDROP ---------- */}
      <div className="pointer-events-none absolute inset-0 -z-30">
        {/* Grid background */}
        <div className="w-full h-full opacity-40 mix-blend-soft-light bg-[linear-gradient(to_right,rgba(148,163,184,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.15)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Scanlines */}
        <div className="absolute inset-0 opacity-[0.08] mix-blend-soft-light bg-[repeating-linear-gradient(to_bottom,rgba(15,23,42,0.85)_0px,rgba(15,23,42,0.85)_1px,transparent_1px,transparent_3px)]" />

        {/* Ambient blobs */}
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

      {/* Cursor spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background: `radial-gradient(550px at ${cursorPos.x}px ${cursorPos.y}px, rgba(34,197,94,0.26), transparent 70%)`,
        }}
        animate={{ opacity: [0.7, 1, 0.85] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* ---------- PAGE HEADER ---------- */}
      <div className="relative flex flex-col gap-3">
        <motion.h1
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-600 bg-clip-text text-transparent"
        >
          Membership Overview
        </motion.h1>

        <p className="text-gray-500 text-sm max-w-xl">
          Loyalty Dashboard for{" "}
          <span className="font-medium text-emerald-700">
            corporate & rewards members
          </span>
          . Monitor membership health, tiers, and points activity at a glance.
        </p>

       

        <div className="mt-3 h-[3px] w-24 bg-gradient-to-r from-emerald-400 via-emerald-500 to-transparent rounded-full" />
      </div>

      {/* ---------- MAIN HUD CONTAINER ---------- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative rounded-[26px] border border-emerald-500/30 bg-white/90 shadow-[0_22px_70px_rgba(15,23,42,0.40)] overflow-hidden"
      >
        {/* HUD corner brackets */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-3 left-3 h-5 w-5 border-t-2 border-l-2 border-emerald-400/80" />
          <div className="absolute top-3 right-3 h-5 w-5 border-t-2 border-r-2 border-emerald-400/80" />
          <div className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-emerald-400/80" />
          <div className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-emerald-400/80" />
        </div>

        <div className="relative flex flex-col gap-8 p-5 md:p-6 lg:p-7">
          {/* Scanner line */}
          <motion.div
            className="pointer-events-none absolute top-10 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent opacity-70"
            animate={{ x: ["-20%", "20%", "-20%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* ---------- TOP CONTROLS + SUMMARY ---------- */}
          <div className="flex flex-col gap-6">
            {/* Search + Filters line */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
                            ? "bg-emerald-600 text-white border-emerald-700 shadow-lg shadow-emerald-500/40"
                            : "bg-white/80 text-gray-600 border-gray-300 hover:bg-emerald-50"
                        }`}
                      >
                        {status === "Active" && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                        )}
                        {status === "Expiring Soon" && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
                        )}
                        {status === "Inactive" && (
                          <span className="w-2 h-2 rounded-full bg-slate-400" />
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
                    className="w-full border border-emerald-300/80 rounded-xl px-4 py-2 pl-10 shadow-sm bg-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 text-emerald-500 w-5 h-5" />
                </div>

                <Dropdown
                  dismissOnClick
                  renderTrigger={() => (
                    <button className="flex items-center gap-2 border border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold text-xs sm:text-sm px-4 py-2 rounded-full shadow-sm hover:shadow-md hover:bg-emerald-100 transition">
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

            {/* Summary Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MembershipSummaryCard
                icon={<UserCheck size={38} />}
                label="Active Members"
                value={activeCount.toString()}
                accent="Currently engaged in loyalty program"
                color="emerald"
              />
              <MembershipSummaryCard
                icon={<CalendarClock size={38} />}
                label="Expiring Soon"
                value={expiringCount.toString()}
                accent="Memberships expiring within 30 days"
                color="amber"
              />
              <MembershipSummaryCard
                icon={<UserX size={38} />}
                label="Inactive Members"
                value={inactiveCount.toString()}
                accent="Require reactivation or follow-up"
                color="rose"
              />
              <MembershipSummaryCard
                icon={<Users size={38} />}
                label="Total Members"
                value={totalMembers.toString()}
                accent={`New this month: ${newThisMonth}`}
                color="indigo"
              />
            </section>
          </div>

          {/* Divider */}
          <div className="relative h-px w-full bg-gradient-to-r from-transparent via-gray-300/90 to-transparent" />

          {/* ---------- MAIN GRID: TABLE + RIGHT PANEL ---------- */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* MEMBERS TABLE */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="xl:col-span-8 rounded-2xl border border-gray-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.18)] p-4 md:p-5 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4 gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-bold text-gray-800">
                      Members List
                    </h2>
                    <p className="text-xs text-gray-500">
                      {filteredMembers.length} member(s) matching filters.
                    </p>
                  </div>
                </div>

                <span className="text-[0.7rem] uppercase tracking-wide text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Loyalty Grid
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-100 bg-slate-50/60">
                <table className="min-w-full text-sm text-gray-800">
                  <thead className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-slate-100">
                    <tr>
                      <th className="p-3 text-left font-medium text-xs md:text-sm">
                        Member
                      </th>
                      <th className="p-3 text-left font-medium text-xs md:text-sm">
                        Start
                      </th>
                      <th className="p-3 text-left font-medium text-xs md:text-sm">
                        Expiry
                      </th>
                      <th className="p-3 text-left font-medium text-xs md:text-sm">
                        Points
                      </th>
                      <th className="p-3 text-left font-medium text-xs md:text-sm">
                        Tier
                      </th>
                      <th className="p-3 text-left font-medium text-xs md:text-sm">
                        Status
                      </th>
                      <th className="p-3 text-left font-medium text-xs md:text-sm">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white/80">
                    {filteredMembers.length > 0 ? (
                      filteredMembers.map((m, i) => {
                        const tier = getTier(m.points);
                        return (
                          <tr
                            key={i}
                            className="border-b last:border-0 border-gray-100 hover:bg-emerald-50/70 hover:shadow-[0_10px_30px_rgba(16,185,129,0.18)] transition cursor-pointer"
                          >
                            <td
                              className="p-3 flex items-center gap-3"
                              onClick={() => setSelectedMember(m)}
                            >
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center font-semibold shadow-sm text-xs">
                                {m.name.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-sm">
                                  {m.name}
                                </span>
                                <span className="text-[0.7rem] text-gray-500">
                                  #{i + 1} • Loyalty ID
                                </span>
                              </div>
                            </td>
                            <td className="p-3 text-xs md:text-sm text-gray-700">
                              {m.start}
                            </td>
                            <td className="p-3 text-xs md:text-sm">
                              <span className="flex items-center gap-1">
                                <span className="text-gray-700">{m.expiry}</span>
                                {m.status === "Expiring Soon" && (
                                  <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                                    Expiring soon
                                  </span>
                                )}
                              </span>
                            </td>
                            <td className="p-3 font-semibold text-indigo-700 text-xs md:text-sm">
                              {m.points.toLocaleString()} pts
                            </td>
                            <td className="p-3 text-xs md:text-sm">
                              <span
                                className={`px-3 py-1 text-[0.7rem] font-semibold rounded-full border ${getTierColors(
                                  tier
                                )}`}
                              >
                                {tier}
                              </span>
                            </td>
                            <td className="p-3 text-xs md:text-sm">
                              <span
                                className={`px-3 py-1 text-[0.7rem] font-semibold rounded-full ${getStatusBadge(
                                  m.status
                                )}`}
                              >
                                {m.status}
                              </span>
                            </td>
                            <td className="p-3 text-xs md:text-sm">
                              <button
                                onClick={() => setSelectedMember(m)}
                                className="px-3 py-1.5 rounded-full bg-slate-900 text-emerald-100 hover:bg-emerald-700 hover:text-white text-[0.7rem] font-semibold shadow-sm"
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
                          className="text-center text-gray-500 p-6 bg-gray-50 text-sm"
                        >
                          No members found. Try adjusting filters or the search
                          keyword.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* RIGHT SIDE: TOP MEMBERS + INSIGHTS */}
            <div className="xl:col-span-4 flex flex-col gap-5">
              {/* Top Members (Leaderboard) */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-gradient-to-br from-emerald-600 via-teal-500 to-emerald-700 rounded-2xl p-5 shadow-[0_18px_55px_rgba(16,185,129,0.5)] text-white relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.45),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.45),transparent_55%)]" />

                <div className="relative flex items-center gap-3 mb-4">
                  <div className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Top Members</h2>
                    <p className="text-xs text-emerald-100">
                      Highest point earners in the loyalty program.
                    </p>
                  </div>
                </div>

                <div className="relative space-y-3">
                  {leaderboard.map((m, index) => {
                    const tier = getTier(m.points);
                    const badges = ["🥇", "🥈", "🥉"];
                    return (
                      <div
                        key={m.name}
                        className="flex items-center justify-between bg-white/12 rounded-xl px-3 py-2.5 backdrop-blur-sm border border-white/15"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center">
                            <Award className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{m.name}</p>
                            <p className="text-[0.7rem] text-emerald-100">
                              {m.points.toLocaleString()} pts • {tier} Tier
                            </p>
                          </div>
                        </div>
                        <span className="text-xl">{badges[index] ?? "⭐"}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Membership Insights */}
              <AnalyticsCard
                title="Membership Insights"
                subtitle="Snapshot of the current membership lifecycle."
                icon={
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                }
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <InsightTile
                    icon={<Users className="w-5 h-5" />}
                    label="New Members"
                    value={523}
                    description="Joined in the last 30 days."
                    tone="indigo"
                  />
                  <InsightTile
                    icon={<UserCheck className="w-5 h-5" />}
                    label="Active Ratio"
                    value={
                      totalMembers === 0
                        ? "0%"
                        : `${Math.round(
                            (activeCount / totalMembers) * 100
                          )}%`
                    }
                    description="Share of currently active members."
                    tone="emerald"
                  />
                  <InsightTile
                    icon={<UserX className="w-5 h-5" />}
                    label="Churn Risk"
                    value={expiringCount + inactiveCount}
                    description="Members needing follow-up."
                    tone="rose"
                  />
                  <InsightTile
                    icon={<CalendarClock className="w-5 h-5" />}
                    label="Expiring This Month"
                    value={28}
                    description="Expiring within the current cycle."
                    tone="amber"
                  />
                </div>
              </AnalyticsCard>
            </div>
          </section>
        </div>
      </motion.div>

      {/* ---------- PROFILE MODAL (GLASS HUD) ---------- */}
      {selectedMember && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4 py-6 bg-slate-950/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.86, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="relative bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-emerald-500/40 text-slate-50 rounded-2xl shadow-[0_25px_80px_rgba(15,23,42,0.9)] max-w-md w-full p-6 overflow-hidden"
          >
            {/* Glow accents */}
            <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.35),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.35),transparent_55%)]" />

            <button
              onClick={() => setSelectedMember(null)}
              className="absolute right-3 top-3 text-[0.65rem] px-2 py-1 rounded-full bg-slate-800/80 text-slate-200 hover:bg-slate-700 border border-slate-600/70 z-10"
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
                <div className="relative z-0">
                  <h3 className="text-lg font-bold text-slate-50 mb-4 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Users className="w-4 h-4 text-emerald-400" />
                    </div>
                    Member Profile
                  </h3>

                  {/* Membership Card */}
                  <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 rounded-2xl p-4 text-white shadow-lg mb-4 border border-white/20">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-[0.65rem] uppercase tracking-[0.16em] text-emerald-100">
                          Loyalty Membership
                        </p>
                        <p className="text-lg font-bold flex items-center gap-2">
                          {m.name}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-[0.7rem] font-semibold rounded-full border bg-white/10 ${tierColors}`}
                      >
                        {tier} Tier
                      </span>
                    </div>
                    <div className="flex justify-between items-end text-xs mt-4">
                      <div>
                        <p className="text-emerald-100">Points Balance</p>
                        <p className="text-base font-bold">
                          {m.points.toLocaleString()} pts
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
                          backgroundImage: `conic-gradient(#22c55e ${progressPercent}%, #1f2937 ${progressPercent}%)`,
                        }}
                      />
                      <div className="absolute w-14 h-14 rounded-full bg-slate-950 flex items-center justify-center">
                        <span className="text-xs font-semibold text-emerald-400">
                          {progressPercent}%
                        </span>
                      </div>
                    </div>
                    <div className="text-[0.75rem] text-slate-300">
                      <p className="font-semibold text-slate-100 mb-1">
                        Progress to next tier
                      </p>
                      <p className="leading-relaxed">
                        Keep earning points to upgrade membership and unlock{" "}
                        <span className="text-emerald-300">
                          higher discounts, early access
                        </span>
                        , and exclusive perks.
                      </p>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-3 text-[0.75rem] text-slate-100 mb-4">
                    <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/80">
                      <p className="text-slate-400 text-[0.68rem]">Status</p>
                      <p className="font-semibold flex items-center gap-1 mt-1">
                        {m.status}
                      </p>
                    </div>
                    <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/80">
                      <p className="text-slate-400 text-[0.68rem]">
                        Start Date
                      </p>
                      <p className="font-semibold mt-1">{m.start}</p>
                    </div>
                    <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/80">
                      <p className="text-slate-400 text-[0.68rem]">
                        Expiry Date
                      </p>
                      <p className="font-semibold mt-1">{m.expiry}</p>
                    </div>
                    <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/80">
                      <p className="text-slate-400 text-[0.68rem]">Tier</p>
                      <p className="font-semibold mt-1">{tier}</p>
                    </div>
                  </div>

                  {/* Activity Preview (Static UI) */}
                  <div className="bg-slate-900/80 rounded-xl p-3 text-[0.75rem] text-slate-200 border border-slate-700/80">
                    <p className="font-semibold text-slate-50 mb-2 flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                      </span>
                      Recent Activity (UI only)
                    </p>
                    <ul className="space-y-1 text-slate-300">
                      <li>• Earned +150 pts — Grocery purchase at Wrap & Carry.</li>
                      <li>• Earned +80 pts — Delivery order completed.</li>
                      <li>• Membership renewed automatically.</li>
                    </ul>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

/* ============================================================
   SUB COMPONENTS
============================================================ */

function MembershipSummaryCard({
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
  color: "emerald" | "amber" | "rose" | "indigo";
}) {
  const colors: Record<typeof color, string> = {
    emerald: "from-emerald-500 to-emerald-700",
    amber: "from-amber-500 to-amber-700",
    rose: "from-rose-500 to-rose-700",
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

function AnalyticsCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl border border-gray-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.25)] p-5 md:p-6 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.55),transparent_55%)]" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-9 w-9 rounded-full bg-gray-50 flex items-center justify-center">
            {icon}
          </div>
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>

        <p className="text-sm text-gray-500 mb-4">{subtitle}</p>

        {children}
      </div>
    </motion.div>
  );
}

function InsightTile({
  icon,
  label,
  value,
  description,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description: string;
  tone: "emerald" | "indigo" | "rose" | "amber";
}) {
  const tones: Record<typeof tone, string> = {
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
    rose: "text-rose-600 bg-rose-50 border-rose-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
  };

  return (
    <div
      className={`p-3 rounded-xl border text-xs flex flex-col gap-1 ${tones[tone]}`}
    >
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-white/60 flex items-center justify-center">
          {icon}
        </div>
        <p className="font-semibold text-[0.8rem]">{label}</p>
      </div>
      <p className="text-base font-bold mt-1">{value}</p>
      <p className="text-[0.7rem] opacity-80">{description}</p>
    </div>
  );
}
