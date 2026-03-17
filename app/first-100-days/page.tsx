"use client";

import { useState, useEffect } from "react";
import Nav from "../components/Nav";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ActionRow {
  id: number;
  initiative: string;
  action: string;
  priority: string;
  owner: string;
}

interface ActionExtra {
  assignedTo: string;
  progress: string;
  startDate: string;
  endDate: string;
}

interface Header {
  companyName: string;
  projectStartDate: string;
}

const PROGRESS_OPTIONS = ["0%", "25%", "50%", "75%", "100%"] as const;

const PRIORITY_ORDER: Record<string, number> = {
  "Mandatory - 100 days":    0,
  "High - 100 Days":         1,
  "High - Due Dilligence":   1,
  "Medium - 100 Days":       2,
  "Medium - Due Dilligence": 2,
  "Low - 100 Days":          3,
  "Low - Due Dilligence":    3,
  "Continuous Improvement":  4,
};

const PRIORITY_BADGE: Record<string, { label: string; className: string }> = {
  "Mandatory - 100 days":    { label: "Mandatory", className: "bg-purple-100 text-purple-700" },
  "High - 100 Days":         { label: "High",       className: "bg-red-100 text-red-700" },
  "High - Due Dilligence":   { label: "High",       className: "bg-red-100 text-red-700" },
  "Medium - 100 Days":       { label: "Medium",     className: "bg-orange-100 text-orange-700" },
  "Medium - Due Dilligence": { label: "Medium",     className: "bg-orange-100 text-orange-700" },
  "Low - 100 Days":          { label: "Low",        className: "bg-gray-100 text-gray-500" },
  "Low - Due Dilligence":    { label: "Low",        className: "bg-gray-100 text-gray-500" },
  "Continuous Improvement":  { label: "CI",         className: "bg-blue-100 text-blue-700" },
};

const LS_ACTIONS = "value-creation-actions";
const LS_EXTRAS  = "first-100-days-extras";
const LS_HEADER  = "first-100-days-header";

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch { /* corrupted */ }
  return fallback;
}

function saveJSON(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { /* unavailable */ }
}

/** Days between two ISO date strings (dateB - dateA). */
function daysBetween(a: string, b: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay);
}

// ── Gantt bar component ───────────────────────────────────────────────────────

function GanttBar({
  projectStart,
  startDate,
  endDate,
  totalDays,
  progress,
}: {
  projectStart: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  progress: string;
}) {
  if (!projectStart || !startDate || !endDate) {
    return <span className="text-xs text-gray-300">—</span>;
  }

  const offsetDays = Math.max(0, daysBetween(projectStart, startDate));
  const durationDays = Math.max(1, daysBetween(startDate, endDate));

  const leftPct  = (offsetDays / totalDays) * 100;
  const widthPct = Math.min((durationDays / totalDays) * 100, 100 - leftPct);

  const isDone = progress === "100%";

  return (
    <div className="relative w-full h-6 bg-gray-100 rounded overflow-hidden">
      <div
        className={`absolute top-0 h-full rounded transition-all ${isDone ? "bg-green-400" : "bg-blue-400"}`}
        style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 1)}%` }}
      />
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-white mix-blend-multiply select-none">
        {durationDays}d
      </span>
    </div>
  );
}

// ── Timeline ruler ────────────────────────────────────────────────────────────

function TimelineRuler({ totalDays }: { totalDays: number }) {
  // Show ~4 tick marks
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(f * totalDays));
  return (
    <div className="relative w-full h-5">
      {ticks.map((day) => (
        <span
          key={day}
          className="absolute text-[10px] text-gray-400 -translate-x-1/2"
          style={{ left: `${(day / totalDays) * 100}%` }}
        >
          {day === 0 ? "D0" : `D${day}`}
        </span>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const COLS = "grid-cols-[1.5fr_2.5fr_1.2fr_1.2fr_1.2fr_1.2fr_3fr]";

export default function First100DaysPage() {
  const [mounted, setMounted] = useState(false);
  const [actions, setActions] = useState<ActionRow[]>([]);
  const [extras,  setExtras]  = useState<Record<number, ActionExtra>>({});
  const [header,  setHeader]  = useState<Header>({ companyName: "", projectStartDate: "" });
  const [filter,  setFilter]  = useState("All");

  useEffect(() => {
    setActions(loadJSON<ActionRow[]>(LS_ACTIONS, []));
    setExtras(loadJSON<Record<number, ActionExtra>>(LS_EXTRAS, {}));
    setHeader(loadJSON<Header>(LS_HEADER, { companyName: "", projectStartDate: "" }));
    setMounted(true);
  }, []);

  useEffect(() => { if (mounted) saveJSON(LS_HEADER, header); }, [header, mounted]);
  useEffect(() => { if (mounted) saveJSON(LS_EXTRAS, extras); }, [extras, mounted]);

  function updateHeader(patch: Partial<Header>) {
    setHeader((prev) => ({ ...prev, ...patch }));
  }

  function updateExtra(id: number, patch: Partial<ActionExtra>) {
    setExtras((prev) => ({
      ...prev,
      [id]: { ...{ assignedTo: "", progress: "", startDate: "", endDate: "" }, ...prev[id], ...patch },
    }));
  }

  const filledActions = actions
    .filter((r) => r.owner && r.action)
    .filter((r) => {
      if (filter === "All") return true;
      const badge = PRIORITY_BADGE[r.priority];
      if (filter === "CI") return badge?.label === "CI";
      return badge?.label === filter;
    });

  // Compute Gantt scale: max end-day across all actions, minimum 100
  const totalDays = Math.max(
    100,
    ...filledActions
      .filter((r) => {
        const ex = extras[r.id];
        return header.projectStartDate && ex?.startDate && ex?.endDate;
      })
      .map((r) => {
        const ex = extras[r.id];
        return daysBetween(header.projectStartDate, ex.endDate);
      })
      .filter((d) => d > 0)
  );

  const groups = filledActions.reduce<Record<string, ActionRow[]>>((acc, row) => {
    (acc[row.owner] ??= []).push(row);
    return acc;
  }, {});
  // Sort each group by priority
  for (const owner of Object.keys(groups)) {
    groups[owner].sort(
      (a, b) => (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99)
    );
  }
  const ownerKeys = Object.keys(groups).sort();

  const totalActions = filledActions.length;
  const doneActions  = filledActions.filter((r) => extras[r.id]?.progress === "100%").length;

  // Overall progress counts across all actions (ignores active filter)
  const allFilledActions = actions.filter((r) => r.owner && r.action);
  const allTotal = allFilledActions.length;
  const allDone  = allFilledActions.filter((r) => extras[r.id]?.progress === "100%").length;
  const progressPct = allTotal > 0 ? Math.round((allDone / allTotal) * 100) : 0;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Dashboard header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-8">

          {/* Left: title + progress */}
          <div className="flex-1 min-w-0">
            {/* Breadcrumb */}
            <p className="text-xs text-gray-400 mb-1">
              {header.companyName
                ? <><span className="font-medium text-blue-600">{header.companyName}</span> · Integration Execution Plan</>
                : "Integration Execution Plan"}
            </p>
            {/* Title + subtitle */}
            <h1 className="text-xl font-bold text-gray-900 leading-tight">First 100 Days</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Execution plan for the first 100 days of the integration
            </p>
            {/* Progress block */}
            <div className="mt-2.5 flex items-center gap-4 bg-blue-50 rounded-xl px-3 py-2">
              {/* Big percentage */}
              <span className="text-2xl font-extrabold text-blue-600 tabular-nums leading-none">
                {progressPct}%
              </span>
              {/* Bar + count */}
              <div className="flex-1 min-w-0">
                <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                {allTotal > 0 && (
                  <p className="mt-1 text-xs text-blue-500 font-medium tabular-nums">
                    {allDone} / {allTotal} voltooid
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px self-stretch bg-gray-200" />

          {/* Right: project meta inputs */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                Bedrijf
              </label>
              <input
                type="text"
                value={header.companyName}
                onChange={(e) => updateHeader({ companyName: e.target.value })}
                placeholder="Bedrijfsnaam…"
                className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white hover:border-blue-400 transition-colors w-36"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                Startdatum
              </label>
              <input
                type="date"
                value={header.projectStartDate}
                onChange={(e) => updateHeader({ projectStartDate: e.target.value })}
                className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white hover:border-blue-400 transition-colors"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px self-stretch bg-gray-200" />

          {/* Nav */}
          <div className="flex-shrink-0">
            <Nav />
          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Filter */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 font-medium">Filter op prioriteit:</span>
          {["All", "High", "Medium", "Low", "CI"].map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border
                ${filter === opt
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-500 border-gray-300 hover:border-blue-400 hover:text-blue-600"}`}
            >
              {opt === "All" ? "Alle" : opt}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {ownerKeys.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-6 py-16 text-center">
            <p className="text-gray-400 text-sm">
              Nog geen acties gedefinieerd.{" "}
              <a href="/" className="text-blue-600 hover:underline">Ga naar Value Creation Actions</a>{" "}
              om acties toe te voegen.
            </p>
          </div>
        )}

        {/* Groups */}
        {ownerKeys.map((owner) => (
          <div key={owner} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Group header */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                {owner[0]}
              </span>
              <h2 className="text-sm font-semibold text-gray-800">{owner}</h2>
              <span className="ml-auto text-xs text-gray-400">
                {groups[owner].length} {groups[owner].length === 1 ? "actie" : "acties"}
              </span>
            </div>

            {/* Column headers */}
            <div className={`grid ${COLS} gap-3 px-6 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-400`}>
              <span>Initiatief</span>
              <span>Actie</span>
              <span>Toegewezen aan</span>
              <span>Voortgang</span>
              <span>Startdatum</span>
              <span>Einddatum</span>
              {/* Ruler in header */}
              <TimelineRuler totalDays={totalDays} />
            </div>

            {/* Action rows */}
            <div className="divide-y divide-gray-100">
              {groups[owner].map((row) => {
                const ex = extras[row.id] ?? { assignedTo: "", progress: "", startDate: "", endDate: "" };
                return (
                  <div key={row.id} className={`grid ${COLS} gap-3 items-center px-6 py-3 hover:bg-blue-50/30 transition-colors`}>
                    <span className="text-xs text-gray-500 truncate" title={row.initiative}>
                      {row.initiative}
                    </span>
                    <div className="flex flex-col gap-1">
                      {PRIORITY_BADGE[row.priority] && (
                        <span className={`self-start rounded px-1.5 py-0.5 text-[10px] font-semibold ${PRIORITY_BADGE[row.priority].className}`}>
                          {PRIORITY_BADGE[row.priority].label}
                        </span>
                      )}
                      <span className="text-sm text-gray-800 leading-snug" title={row.action}>
                        {row.action}
                      </span>
                    </div>

                    {/* Assigned to */}
                    <input
                      type="text"
                      value={ex.assignedTo}
                      onChange={(e) => updateExtra(row.id, { assignedTo: e.target.value })}
                      placeholder="Naam…"
                      className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-colors"
                    />

                    {/* Progress */}
                    <select
                      value={ex.progress}
                      onChange={(e) => updateExtra(row.id, { progress: e.target.value })}
                      className={`w-full rounded-lg border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
                        ${ex.progress === "100%" ? "bg-green-50 border-green-300 text-green-700" : "bg-white border-gray-300 text-gray-800 hover:border-blue-400"}
                        ${!ex.progress ? "text-gray-400" : ""}`}
                    >
                      <option value="" disabled hidden>%…</option>
                      {PROGRESS_OPTIONS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>

                    {/* Start date */}
                    <input
                      type="date"
                      value={ex.startDate}
                      onChange={(e) => updateExtra(row.id, { startDate: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-colors"
                    />

                    {/* End date */}
                    <input
                      type="date"
                      value={ex.endDate}
                      onChange={(e) => updateExtra(row.id, { endDate: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-colors"
                    />

                    {/* Timeline bar */}
                    <GanttBar
                      projectStart={header.projectStartDate}
                      startDate={ex.startDate}
                      endDate={ex.endDate}
                      totalDays={totalDays}
                      progress={ex.progress}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
