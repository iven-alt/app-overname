"use client";

// (no local state needed — all data comes from CompanyContext)
import Nav from "../components/Nav";
import { PILLAR_META } from "../lib/pillarMeta";
import { useCompany } from "../lib/companyStore";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ActionRow {
  id: number;
  pillar?: string;        // set on rows saved after pillar support was added
  initiative: string;
  action: string;
  customAction?: string;  // present when action === "__custom__"
  priority: string;
  owner: string;
}

const CUSTOM_ACTION = "__custom__";

/** Returns the text to display for an action row (handles custom actions). */
function resolveAction(row: ActionRow): string {
  return row.action === CUSTOM_ACTION ? (row.customAction?.trim() || "") : row.action;
}

interface ActionExtra {
  assignedTo: string;
  progress: string;
  startDate: string;
  endDate: string;
}

/** Convert a progress string like "75%" to a number 0–100. */
function pctValue(progress: string): number {
  const n = parseInt(progress, 10);
  return isNaN(n) ? 0 : n;
}

/** Owner-level stats */
interface OwnerStat {
  owner: string;
  total: number;
  done: number;           // actions at 100%
  avgProgress: number;    // average of all progress values
}

/** Pillar-level stats */
interface PillarStat {
  pillar: string;
  total: number;
  done: number;
  avgProgress: number;
}

// ── KPI card ──────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</span>
      <span className="text-3xl font-extrabold text-gray-900 leading-none tabular-nums">{value}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

// ── Owner progress row ────────────────────────────────────────────────────────

function OwnerRow({ stat }: { stat: OwnerStat }) {
  const pct = stat.avgProgress;
  const color =
    pct === 100 ? "bg-green-500" :
    pct >= 60   ? "bg-blue-500"  :
    pct >= 30   ? "bg-blue-400"  :
                  "bg-blue-300";

  return (
    <div className="flex items-center gap-4 py-3">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
        {stat.owner[0]}
      </div>

      {/* Name + bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-sm font-semibold text-gray-800">{stat.owner}</span>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-bold text-gray-700 tabular-nums w-10 text-right">{pct}%</span>
            <span className="text-xs text-gray-400 tabular-nums whitespace-nowrap">
              {stat.done} / {stat.total} voltooid
            </span>
          </div>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${color}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Pillar progress row ───────────────────────────────────────────────────────

function PillarRow({ stat }: { stat: PillarStat }) {
  const meta = PILLAR_META[stat.pillar];
  const pct  = stat.avgProgress;
  const color = meta?.color ?? "#6B7280";

  return (
    <div className="flex items-center gap-4 py-3">
      {/* Icon badge */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-base leading-none"
        style={{ backgroundColor: `${color}18` }}
      >
        {meta?.icon ?? "●"}
      </div>

      {/* Name + bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-sm font-semibold text-gray-800 truncate">{stat.pillar}</span>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <span className="text-sm font-bold text-gray-700 tabular-nums w-10 text-right">{pct}%</span>
            <span className="text-xs text-gray-400 tabular-nums whitespace-nowrap">
              {stat.done} / {stat.total} voltooid
            </span>
          </div>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  // ── Company context replaces all local localStorage logic ─────────────────
  const { mounted, companyData } = useCompany();
  const actions = companyData.rows   as ActionRow[];
  const extras  = companyData.extras as Record<number, ActionExtra>;

  // Only consider fully defined actions (have owner + resolved action text)
  const filledActions = actions.filter((r) => r.owner && !!resolveAction(r));

  // Overall KPIs
  const totalActions = filledActions.length;
  const doneActions  = filledActions.filter((r) => pctValue(extras[r.id]?.progress) === 100).length;
  const overallPct   = totalActions > 0
    ? Math.round(filledActions.reduce((sum, r) => sum + pctValue(extras[r.id]?.progress), 0) / totalActions)
    : 0;

  // Per-owner stats
  const ownerMap = filledActions.reduce<Record<string, OwnerStat>>((acc, row) => {
    if (!acc[row.owner]) {
      acc[row.owner] = { owner: row.owner, total: 0, done: 0, avgProgress: 0 };
    }
    const progress = pctValue(extras[row.id]?.progress);
    acc[row.owner].total += 1;
    if (progress === 100) acc[row.owner].done += 1;
    acc[row.owner].avgProgress += progress;
    return acc;
  }, {});

  const ownerStats: OwnerStat[] = Object.values(ownerMap)
    .map((s) => ({ ...s, avgProgress: Math.round(s.avgProgress / s.total) }))
    .sort((a, b) => b.avgProgress - a.avgProgress); // most progress first

  // Per-pillar stats — only include pillars that have at least one action
  const pillarOrder = Object.keys(PILLAR_META); // fixed canonical order
  const pillarMap = filledActions
    .filter((r) => !!r.pillar)
    .reduce<Record<string, PillarStat>>((acc, row) => {
      const p = row.pillar!;
      if (!acc[p]) acc[p] = { pillar: p, total: 0, done: 0, avgProgress: 0 };
      const progress = pctValue(extras[row.id]?.progress);
      acc[p].total += 1;
      if (progress === 100) acc[p].done += 1;
      acc[p].avgProgress += progress;
      return acc;
    }, {});

  const pillarStats: PillarStat[] = Object.values(pillarMap)
    .map((s) => ({ ...s, avgProgress: Math.round(s.avgProgress / s.total) }))
    .sort((a, b) => pillarOrder.indexOf(a.pillar) - pillarOrder.indexOf(b.pillar));

  // Attention needed: actions missing progress, owner, or end date
  interface FlaggedAction {
    id: number;
    action: string;
    owner: string;
    issues: string[];
  }
  const flagged: FlaggedAction[] = filledActions
    .map((row) => {
      const ex = extras[row.id];
      const issues: string[] = [];
      if (!ex?.progress || pctValue(ex.progress) === 0) issues.push("No progress");
      if (!ex?.assignedTo?.trim()) issues.push("No owner assigned");
      if (!ex?.endDate) issues.push("No end date");
      return { id: row.id, action: resolveAction(row), owner: row.owner, issues };
    })
    .filter((r) => r.issues.length > 0)
    .sort((a, b) => b.issues.length - a.issues.length); // most issues first

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="h-8 w-56 bg-gray-100 rounded animate-pulse" />
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Integration Dashboard</h1>
            <p className="mt-0.5 text-sm text-gray-500">Progress overview per functional area</p>
          </div>
          <Nav />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            label="Overall progress"
            value={`${overallPct}%`}
            sub="gemiddeld over alle acties"
          />
          <KpiCard
            label="Completed actions"
            value={String(doneActions)}
            sub={`van de ${totalActions} acties`}
          />
          <KpiCard
            label="Total actions"
            value={String(totalActions)}
            sub="gedefinieerd in Sheet 1"
          />
        </div>

        {/* Per-pillar progress */}
        {pillarStats.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">Progress per Pillar</h2>
              <p className="text-xs text-gray-400 mt-0.5">Sorted by pillar category</p>
            </div>
            <div className="px-6 divide-y divide-gray-100">
              {pillarStats.map((stat) => (
                <PillarRow key={stat.pillar} stat={stat} />
              ))}
            </div>
          </div>
        )}

        {/* Per-owner progress */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Progress per Functional Owner</h2>
            <p className="text-xs text-gray-400 mt-0.5">Sorted by progress — highest first</p>
          </div>

          {ownerStats.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm text-gray-400">
                Nog geen acties gedefinieerd.{" "}
                <a href="/" className="text-blue-600 hover:underline">Voeg acties toe</a> op Sheet 1.
              </p>
            </div>
          ) : (
            <div className="px-6 divide-y divide-gray-100">
              {ownerStats.map((stat) => (
                <OwnerRow key={stat.owner} stat={stat} />
              ))}
            </div>
          )}
        </div>

        {/* Attention needed */}
        {flagged.length > 0 && (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 overflow-hidden">
            <div className="px-6 py-4 border-b border-orange-200 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <h2 className="text-sm font-semibold text-orange-800">Attention Needed</h2>
              <span className="ml-auto text-xs font-medium text-orange-600 bg-orange-100 rounded-full px-2 py-0.5">
                {flagged.length} {flagged.length === 1 ? "action" : "actions"}
              </span>
            </div>

            <div className="divide-y divide-orange-100">
              {flagged.map((item) => (
                <div key={item.id} className="px-6 py-3 flex items-start gap-4">
                  {/* Owner avatar */}
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center mt-0.5">
                    {item.owner[0]}
                  </div>
                  {/* Action + owner */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium truncate" title={item.action}>
                      {item.action}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.owner}</p>
                  </div>
                  {/* Issue badges */}
                  <div className="flex-shrink-0 flex flex-wrap gap-1 justify-end">
                    {item.issues.map((issue) => (
                      <span
                        key={issue}
                        className="inline-block rounded-full bg-orange-100 border border-orange-200 px-2 py-0.5 text-[10px] font-semibold text-orange-700"
                      >
                        {issue}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
