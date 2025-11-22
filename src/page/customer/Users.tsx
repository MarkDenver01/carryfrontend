import React, { useMemo, useState } from "react";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  CalendarClock,
  TrendingUp,
  Crown,
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

// -------------------------
// Helpers
// -------------------------
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

// -------------------------
// Main Component
// -------------------------
export default function MembershipOverviewPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"All" | MemberStatus>("All");
  const [sortLabel, setSortLabel] = useState("Status");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const members = membersData;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  // -------------------------
  // Filter + Sorting
  // -------------------------
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

  // -------------------------
  // Stats
  // -------------------------
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

  const newThisMonth = 25;
  const totalMembers = members.length;

  // -------------------------
  // Render
  // -------------------------
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      className="relative p-6 md:p-8 flex flex-col gap-8 overflow-hidden"
    >
      {/* HUD Background */}
      <div className="pointer-events-none absolute inset-0 -z-30">
        <div className="w-full h-full opacity-40 mix-blend-soft-light 
        bg-[linear-gradient(to_right,rgba(148,163,184,0.15)_1px,transparent_1px),
        linear-gradient(to_bottom,rgba(148,163,184,0.15)_1px,transparent_1px)]
        bg-[size:40px_40px]" />

        <div className="absolute inset-0 opacity-[0.08] 
        bg-[repeating-linear-gradient(to_bottom,rgba(15,23,42,0.85)_0px,
        rgba(15,23,42,0.85)_1px,transparent_1px,transparent_3px)]" />

        <motion.div
          className="absolute -top-20 -left-16 h-64 w-64 
          bg-emerald-500/28 blur-3xl"
          animate={{
            x: [0, 20, 10, -5, 0],
            y: [0, 10, 20, 5, 0],
            borderRadius: ["45%", "60%", "55%", "65%", "45%"],
          }}
          transition={{ duration: 22, repeat: Infinity }}
        />

        <motion.div
          className="absolute right-0 bottom-[-5rem] h-72 w-72 
          bg-sky-400/24 blur-3xl"
          animate={{
            x: [0, -15, -25, -10, 0],
            y: [0, -10, -20, -5, 0],
            borderRadius: ["50%", "65%", "55%", "70%", "50%"],
          }}
          transition={{ duration: 24, repeat: Infinity }}
        />
      </div>

      {/* Spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background: `radial-gradient(550px 
          at ${cursorPos.x}px ${cursorPos.y}px, 
          rgba(34,197,94,0.26), transparent 70%)`,
        }}
      />

      {/* PAGE HEADER */}
      <div className="relative flex flex-col gap-3">
        <motion.h1
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-extrabold tracking-tight 
          bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-600 
          bg-clip-text text-transparent"
        >
          Membership Overview
        </motion.h1>

        <p className="text-gray-500 text-sm max-w-xl">
          Monitor membership performance, tiers, and loyalty activity at a glance.
        </p>

        {/* BADGES REMOVED — NOTHING HERE */}

        <div className="mt-3 h-[3px] w-24 
        bg-gradient-to-r from-emerald-400 via-emerald-500 to-transparent 
        rounded-full" />
      </div>

      {/* MAIN HUD CONTAINER */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative rounded-[26px] border border-emerald-500/30 
        bg-white/90 shadow-[0_22px_70px_rgba(15,23,42,0.40)] overflow-hidden"
      >
        {/* HUD Corners */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-3 left-3 
          h-5 w-5 border-t-2 border-l-2 border-emerald-400/80" />
          <div className="absolute top-3 right-3 
          h-5 w-5 border-t-2 border-r-2 border-emerald-400/80" />
          <div className="absolute bottom-3 left-3 
          h-5 w-5 border-b-2 border-l-2 border-emerald-400/80" />
          <div className="absolute bottom-3 right-3 
          h-5 w-5 border-b-2 border-r-2 border-emerald-400/80" />
        </div>

        <div className="relative flex flex-col gap-8 p-5 md:p-6 lg:p-7">
          {/* Scanner */}
          <motion.div
            className="pointer-events-none absolute top-10 left-0 
            w-full h-[2px] bg-gradient-to-r from-transparent 
            via-emerald-400/80 to-transparent opacity-70"
            animate={{ x: ["-20%", "20%", "-20%"] }}
            transition={{ duration: 5, repeat: Infinity }}
          />

          {/* FILTERS + SUMMARY CARDS */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row lg:justify-between 
            lg:items-center gap-4">
              
              {/* FILTERS */}
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
                        className={`px-3 py-1.5 rounded-full text-xs sm:text-sm 
                        border transition flex items-center gap-1 ${
                          active
                            ? "bg-emerald-600 text-white border-emerald-700 shadow-lg shadow-emerald-500/40"
                            : "bg-white/80 text-gray-600 border-gray-300 hover:bg-emerald-50"
                        }`}
                      >
                        {status}
                      </button>
                    );
                  }
                )}
              </div>

              {/* SEARCH + SORT */}
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative w-full max-w-xs">
                  <input
                    type="text"
                    placeholder="Search members..."
                    className="w-full border border-emerald-300/80 rounded-xl px-4 py-2 
                    pl-10 shadow-sm bg-white/90 focus:ring-2 focus:ring-emerald-500 
                    text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 text-emerald-500" />
                </div>

                <Dropdown
                  dismissOnClick
                  renderTrigger={() => (
                    <button className="flex items-center gap-2 
                      border border-emerald-500 bg-emerald-50 text-emerald-900 
                      px-4 py-2 rounded-full text-sm shadow-sm hover:bg-emerald-100">
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

            {/* SUMMARY CARDS */}
            <section className="grid grid-cols-1 sm:grid-cols-2 
            lg:grid-cols-4 gap-4">
              <MembershipSummaryCard
                icon={<UserCheck size={38} />}
                label="Active Members"
                value={activeCount.toString()}
                accent="Currently engaged"
                color="emerald"
              />
              <MembershipSummaryCard
                icon={<CalendarClock size={38} />}
                label="Expiring Soon"
                value={expiringCount.toString()}
                accent="Due within 30 days"
                color="amber"
              />
              <MembershipSummaryCard
                icon={<UserX size={38} />}
                label="Inactive Members"
                value={inactiveCount.toString()}
                accent="Require follow-up"
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

          {/* DIVIDER */}
          <div className="relative h-px w-full 
          bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

          {/* MAIN GRID */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* MEMBERS TABLE */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="xl:col-span-8 rounded-2xl border border-gray-200 
              bg-white shadow-[0_18px_55px_rgba(15,23,42,0.18)] p-4"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-emerald-50 
                  rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Members List</h2>
                    <p className="text-xs text-gray-500">
                      {filteredMembers.length} result(s)
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl 
              border border-gray-100 bg-slate-50/60">
                <table className="min-w-full text-sm text-gray-800">
                  <thead className="bg-slate-900 text-slate-100">
                    <tr>
                      <th className="p-3 text-left text-sm">Member</th>
                      <th className="p-3 text-left text-sm">Start</th>
                      <th className="p-3 text-left text-sm">Expiry</th>
                      <th className="p-3 text-left text-sm">Points</th>
                      <th className="p-3 text-left text-sm">Tier</th>
                      <th className="p-3 text-left text-sm">Status</th>
                      <th className="p-3 text-left text-sm">Action</th>
                    </tr>
                  </thead>

                  <tbody className="bg-white">
                    {filteredMembers.length ? (
                      filteredMembers.map((m, i) => {
                        const tier = getTier(m.points);
                        return (
                          <tr
                            key={i}
                            className="border-b border-gray-100 
                            hover:bg-emerald-50 transition"
                          >
                            <td
                              className="p-3 flex items-center gap-3"
                              onClick={() => setSelectedMember(m)}
                            >
                              <div className="w-9 h-9 rounded-full 
                              bg-gradient-to-br from-emerald-500 to-teal-500 
                              flex items-center justify-center text-white 
                              font-bold">
                                {m.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium">{m.name}</p>
                                <p className="text-[0.7rem] text-gray-500">
                                  #{i + 1}
                                </p>
                              </div>
                            </td>

                            <td className="p-3 text-sm">{m.start}</td>

                            <td className="p-3 text-sm">
                              <div className="flex items-center gap-2">
                                {m.expiry}
                                {m.status === "Expiring Soon" && (
                                  <span className="px-2 py-0.5 text-[0.65rem] 
                                  rounded-full bg-amber-100 text-amber-700">
                                    Soon
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="p-3 font-semibold text-indigo-600">
                              {m.points.toLocaleString()}
                            </td>

                            <td className="p-3 text-sm">
                              <span
                                className={`px-3 py-1 text-xs rounded-full border ${getTierColors(
                                  tier
                                )}`}
                              >
                                {tier}
                              </span>
                            </td>

                            <td className="p-3 text-sm">
                              <span
                                className={`px-3 py-1 text-xs rounded-full ${getStatusBadge(
                                  m.status
                                )}`}
                              >
                                {m.status}
                              </span>
                            </td>

                            <td className="p-3">
                              <button
                                className="px-3 py-1 rounded-full 
                                bg-slate-900 text-white text-xs"
                                onClick={() => setSelectedMember(m)}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-6 text-center text-gray-500"
                        >
                          No members found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* RIGHT PANEL */}
            <div className="xl:col-span-4 flex flex-col gap-6">

              {/* Top Members */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-emerald-600 via-teal-500 
                to-emerald-700 p-5 rounded-2xl text-white shadow-lg"
              >
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Crown className="text-yellow-300" />
                  Top Members
                </h2>

                <div className="mt-4 space-y-3">
                  {leaderboard.map((m, idx) => {
                    const tier = getTier(m.points);
                    const medal = ["🥇", "🥈", "🥉"][idx];

                    return (
                      <div
                        key={m.name}
                        className="p-3 bg-white/10 rounded-xl 
                        backdrop-blur-sm flex justify-between"
                      >
                        <div>
                          <p className="font-semibold">{m.name}</p>
                          <p className="text-xs text-emerald-100">
                            {m.points.toLocaleString()} pts • {tier}
                          </p>
                        </div>

                        <span className="text-xl">{medal}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Insights */}
              <AnalyticsCard
                title="Membership Insights"
                subtitle="Engagement & lifecycle performance"
                icon={<TrendingUp className="text-emerald-600" />}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InsightTile
                    icon={<Users />}
                    label="New Members"
                    value={523}
                    description="Last 30 days"
                    tone="indigo"
                  />
                  <InsightTile
                    icon={<UserCheck />}
                    label="Active Ratio"
                    value={
                      totalMembers
                        ? `${Math.round(
                            (activeCount / totalMembers) * 100
                          )}%`
                        : "0%"
                    }
                    description="Currently active"
                    tone="emerald"
                  />
                  <InsightTile
                    icon={<UserX />}
                    label="Churn Risk"
                    value={expiringCount + inactiveCount}
                    description="Needs follow-up"
                    tone="rose"
                  />
                  <InsightTile
                    icon={<CalendarClock />}
                    label="Expiring Soon"
                    value={28}
                    description="This month"
                    tone="amber"
                  />
                </div>
              </AnalyticsCard>
            </div>
          </section>
        </div>
      </motion.div>

      {/* PROFILE MODAL */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm 
        flex items-center justify-center z-50 p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 text-white max-w-md w-full p-6 
            rounded-2xl border border-emerald-500/40 
            shadow-[0_25px_80px_rgba(0,0,0,0.6)]"
          >
            <button
              onClick={() => setSelectedMember(null)}
              className="text-xs bg-slate-800 px-2 py-1 rounded-full 
              absolute right-4 top-4"
            >
              Close
            </button>

            {(() => {
              const m = selectedMember;
              const tier = getTier(m.points);
              const progress =
                tier === "Platinum"
                  ? 100
                  : tier === "Gold"
                  ? 75
                  : tier === "Silver"
                  ? 40
                  : 20;

              return (
                <>
                  <h2 className="text-xl font-bold mb-4">{m.name}</h2>

                  <div className="bg-gradient-to-br from-emerald-600 to-teal-500 
                  p-4 rounded-xl mb-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-emerald-100">Points</p>
                        <p className="text-2xl font-bold">
                          {m.points.toLocaleString()}
                        </p>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs border ${getTierColors(
                          tier
                        )}`}
                      >
                        {tier}
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-emerald-100">
                      Valid until {m.expiry}
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="flex gap-4 items-center mb-4">
                    <div className="relative w-20 h-20">
                      <div
                        className="w-full h-full rounded-full"
                        style={{
                          background: `conic-gradient(#22c55e 
                            ${progress}%, #1f2937 ${progress}%)`,
                        }}
                      />
                      <div className="absolute inset-3 bg-slate-900 
                      rounded-full flex items-center justify-center">
                        <span className="text-xs text-emerald-400">
                          {progress}%
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300">
                      Progress to next tier
                    </p>
                  </div>

                  {/* Info */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-800 p-3 rounded-lg">
                      <p className="text-slate-400">Status</p>
                      <p className="font-semibold">{m.status}</p>
                    </div>

                    <div className="bg-slate-800 p-3 rounded-lg">
                      <p className="text-slate-400">Start</p>
                      <p className="font-semibold">{m.start}</p>
                    </div>

                    <div className="bg-slate-800 p-3 rounded-lg">
                      <p className="text-slate-400">Expiry</p>
                      <p className="font-semibold">{m.expiry}</p>
                    </div>

                    <div className="bg-slate-800 p-3 rounded-lg">
                      <p className="text-slate-400">Tier</p>
                      <p className="font-semibold">{tier}</p>
                    </div>
                  </div>
                </>
              );
            })()}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

// -------------------------
// Summary Card Component
// -------------------------
function MembershipSummaryCard({
  icon,
  label,
  value,
  accent,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
  color: "emerald" | "amber" | "rose" | "indigo";
}) {
  const colors = {
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
        boxShadow: "0 22px 60px rgba(0,0,0,0.25)",
      }}
      className={`relative p-5 rounded-2xl border border-white/40 
      text-white bg-gradient-to-br ${colors[color]} shadow-xl`}
    >
      <div className="flex items-center gap-3">
        <div className="p-3 bg-white/20 rounded-xl">{icon}</div>
        <div>
          <p className="text-xs uppercase tracking-widest opacity-80">
            {label}
          </p>
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-[0.65rem] opacity-80">{accent}</p>
        </div>
      </div>
    </motion.div>
  );
}

// -------------------------
// Analytics Card Component
// -------------------------
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
      className="p-6 bg-white rounded-2xl shadow-[0_18px_55px_rgba(0,0,0,0.15)] 
      border border-gray-200"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="h-9 w-9 bg-gray-50 rounded-full flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <p className="text-sm text-gray-500 mb-4">{subtitle}</p>

      {children}
    </motion.div>
  );
}

// -------------------------
// Insight Tile
// -------------------------
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
  const tones = {
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-200",
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-200",
    rose: "text-rose-600 bg-rose-50 border-rose-200",
    amber: "text-amber-600 bg-amber-50 border-amber-200",
  };

  return (
    <div
      className={`p-3 rounded-xl border text-xs flex flex-col gap-1 ${tones[tone]}`}
    >
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 bg-white/60 rounded-full flex items-center justify-center">
          {icon}
        </div>
        <p className="font-semibold text-[0.8rem]">{label}</p>
      </div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[0.7rem] opacity-80">{description}</p>
    </div>
  );
}
