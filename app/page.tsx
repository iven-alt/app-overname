"use client";

import { useState, useEffect } from "react";
import Nav from "./components/Nav";

// ── Data ──────────────────────────────────────────────────────────────────────

/**
 * PILLARS  →  initiatives  →  actions
 * Add new pillars / initiatives / actions here; the UI cascades automatically.
 */
const PILLARS: Record<string, Record<string, string[]>> = {
  "Omzetgroei": {
    "Cross-sell en upsell": [
      "Introduceren van elkaars producten of diensten bij bestaande klanten",
      "Bundelen van oplossingen of service packs",
      "Gepersonaliseerde aanbiedingen op basis van klantdata",
      "Trainen van sales- en accountteams in het nieuwe, gecombineerde aanbod",
    ],
    "Marktverbreding / marktuitbreiding": [
      "Toegang tot nieuwe geografische markten via bestaand distributiekanaal",
      "Inzetten op nieuwe klantensegmenten (bv. kmo vs. enterprise)",
      "Lokaliseren van aanbod (taal, verpakking, regelgeving) voor nieuwe regio's",
      "Samenbrengen van saleskanalen om regionale dekking te versterken",
    ],
    "Product- of diensteninnovatie": [
      "Combineren van bestaande technologieën om nieuwe oplossingen te creëren",
      "Ontwikkelen van nieuwe features of modules die aansluiten bij de overname",
      "Versnelling van R&D door gedeelde kennis of infrastructuur",
    ],
    "Prijsoptimalisatie": [
      "Harmoniseren van prijsmodellen over beide bedrijven",
      "Invoeren van value-based pricing waar dat nog niet gebeurde",
      "Optimaliseren van kortingen, margebeheer of klantsegmentatie",
      "Beter differentiëren tussen premium en instapaanbod",
    ],
    "Kanaalstrategie en distributie": [
      "Bouwen aan een multikanaalstrategie (direct, indirect, online)",
      "Optimaliseren van partner- of resellerprogramma's",
      "Samenbrengen of hertekenen van distributiecontracten",
      "Inzetten op e-commerce of digitale leadgeneratie",
    ],
    "Salesorganisatie en -aanpak": [
      "Integreren en stroomlijnen van salesteams",
      "Introduceren van account-based selling voor key clients",
      "Inzetten van shared CRM en leadopvolgsystemen",
      "Uitrollen van gezamenlijke incentive-structuren",
      "Harmoniseren van het offerte en/of accountmanagementproces bij gemeenschappelijke klanten",
    ],
    "Marketing en merkstrategie": [
      "Gezamenlijke campagnes naar gemeenschappelijke doelgroep",
      "Herpositioneren van het merk om sterker in de markt te staan",
      "Optimaliseren van customer journey en conversiepunten",
      "Samenvoegen of stroomlijnen van marketingbudgetten voor meer impact",
    ],
  },
  "Operationele efficiëntie": {
    "Processen harmoniseren en stroomlijnen": [
      "Aligneren van kernprocessen (orderverwerking, facturatie, productieplanning...)",
      "Elimineren van dubbele of overlappende workflows",
      "Invoeren van best practices uit het sterkste bedrijf",
      "Automatiseren van repetitieve handelingen via RPA of workflowtools",
    ],
    "IT en systemen integreren": [
      "Migreren naar één gemeenschappelijk ERP- of CRM-systeem",
      "Consolideren van IT-infrastructuur en dataopslag",
      "Uniformeren van rapportering en dashboards",
      "Besparen op licentie- en onderhoudskosten",
    ],
    "Inkoop- en leveranciersoptimalisatie": [
      "Bundelen van inkoopvolumes voor betere voorwaarden",
      "Heronderhandelen van leverancierscontracten",
      "Harmoniseren van leverancierskeuzes",
      "Inzetten op centrale procurement",
    ],
    "Organisatie en structuur vereenvoudigen": [
      "Herbekijken van managementlagen",
      "Samensmelten van ondersteunende afdelingen",
      "Optimaliseren van teamstructuren",
      "Uitfaseren van overlappende rollen",
    ],
    "Shared Services creëren": [
      "Oprichten of uitbreiden van een shared service center",
      "Centraliseren van administratie of IT-support",
      "Realiseren van schaalvoordelen door capaciteitsbundeling",
    ],
    "Productie en logistiek optimaliseren": [
      "Herverdelen van productiecapaciteit",
      "Sluiten of heroriënteren van onderbenutte locaties",
      "Optimalisatie van voorraadbeheer en logistieke flows",
      "Standaardiseren van productielijnen of processen",
    ],
    "Kwaliteit en continu verbeteren": [
      "Uitrollen van LEAN of Six Sigma",
      "Gezamenlijke KPI's voor performantie",
      "Continue verbetercycli met gemengde teams",
      "Identificeren van quick wins en structurele verbeteringen",
    ],
  },
  "Kostenbesparing": {
    "Herstructurering van organisatie en processen": [
      "Samenvoegen of herschikken van afdelingen",
      "Verminderen van managementlagen",
      "Standaardiseren van procedures over beide organisaties",
      "Reallocatie van taken om duplicatie te vermijden",
    ],
    "Inkoopoptimalisatie": [
      "Bundelen van inkoopvolumes voor betere prijzen",
      "Rationaliseren van leveranciersbestand",
      "Heronderhandelen van raamcontracten",
      "Invoeren van centrale inkoopfuncties",
    ],
    "Energiebesparing en duurzaamheid": [
      "Investeren in energie-efficiënte systemen (LED, HVAC, enz.)",
      "Slim energiebeheer en monitoringtools",
      "Duurzamere transport- en logistieke oplossingen",
      "Afvalreductie en circulaire initiatieven",
    ],
    "Consolidatie van faciliteiten en infrastructuur": [
      "Sluiten of herbestemmen van onderbenutte vestigingen",
      "Samenbrengen van teams op één locatie",
      "Optimaliseren van magazijncapaciteit en kantoorruimte",
    ],
    "Digitalisering en automatisering": [
      "Invoeren van digitale workflows ter vervanging van manuele processen",
      "Investeren in RPA (Robotic Process Automation)",
      "Digitaliseren van documentbeheer en interne communicatie",
    ],
    "Financiële en fiscale optimalisatie":          [],
  },
};

const PILLAR_NAMES  = Object.keys(PILLARS);

const PRIORITIES = [
  "Mandatory - 100 days",
  "High - Due Dilligence",
  "High - 100 Days",
  "Medium - 100 Days",
  "Medium - Due Dilligence",
  "Low - 100 Days",
  "Low - Due Dilligence",
  "Continuous Improvement",
] as const;

const FUNCTIONAL_OWNERS = [
  "Sales",
  "Marketing",
  "Product",
  "Operations",
  "Finance",
  "HR",
  "IT",
  "Legal",
] as const;

// ── Types ─────────────────────────────────────────────────────────────────────

interface Row {
  id: number;
  pillar: string;
  initiative: string;
  action: string;
  priority: string;
  owner: string;
}

let nextId = 1;

function emptyRow(): Row {
  return { id: nextId++, pillar: "", initiative: "", action: "", priority: "", owner: "" };
}

// ── Select component ──────────────────────────────────────────────────────────

function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full rounded-lg border px-3 py-2 text-sm leading-tight transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
        ${disabled ? "cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200" : "bg-white border-gray-300 text-gray-800 hover:border-blue-400"}
        ${!value ? "text-gray-400" : "text-gray-800"}`}
    >
      <option value="" disabled hidden>{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ValueCreationPage() {
  const [rows, setRows] = useState<Row[]>([emptyRow()]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("value-creation-actions");
      if (stored) {
        const parsed = JSON.parse(stored) as Row[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          nextId = Math.max(...parsed.map((r) => r.id)) + 1;
          // Back-compat: old rows have no pillar field
          setRows(parsed.map((r) => ({ ...{ pillar: "" }, ...r })));
        }
      }
    } catch { /* corrupted — keep default */ }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem("value-creation-actions", JSON.stringify(rows)); }
    catch { /* unavailable */ }
  }, [rows, mounted]);

  function updateRow(id: number, patch: Partial<Row>) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, ...patch };
        // Cascade resets down the hierarchy
        if ("pillar" in patch) { updated.initiative = ""; updated.action = ""; }
        if ("initiative" in patch) { updated.action = ""; }
        return updated;
      })
    );
  }

  function addRow() { setRows((prev) => [...prev, emptyRow()]); }
  function removeRow(id: number) {
    setRows((prev) => prev.length > 1 ? prev.filter((r) => r.id !== id) : prev);
  }

  const displayRows = mounted ? rows : [emptyRow()];
  const filledCount = mounted
    ? rows.filter((r) => r.pillar && r.initiative && r.action && r.priority && r.owner).length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Value Creation Actions
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Definieer en prioriteer waardecreatie-initiatieven
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
              {filledCount} / {displayRows.length} volledig
            </span>
            <Nav />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

          {/* Table header */}
          <div className="grid grid-cols-[1.5fr_2fr_2.5fr_1.2fr_1fr_auto] gap-3 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <span>Pillar</span>
            <span>Initiatief</span>
            <span>Actie</span>
            <span>Prioriteit</span>
            <span>Eigenaar</span>
            <span />
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-100">
            {displayRows.map((row, idx) => {
              const initiativeOptions = row.pillar
                ? Object.keys(PILLARS[row.pillar] ?? {})
                : [];
              const actionOptions = row.pillar && row.initiative
                ? (PILLARS[row.pillar]?.[row.initiative] ?? [])
                : [];

              return (
                <div
                  key={row.id}
                  className="grid grid-cols-[1.5fr_2fr_2.5fr_1.2fr_1fr_auto] gap-3 items-center px-6 py-4 hover:bg-blue-50/30 transition-colors group"
                >
                  {/* Row number + Pillar */}
                  <div className="flex items-center gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-xs font-medium flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      {idx + 1}
                    </span>
                    <Select
                      value={row.pillar}
                      onChange={(v) => updateRow(row.id, { pillar: v })}
                      options={PILLAR_NAMES}
                      placeholder="Pillar…"
                    />
                  </div>

                  {/* Initiative */}
                  <Select
                    value={row.initiative}
                    onChange={(v) => updateRow(row.id, { initiative: v })}
                    options={initiativeOptions}
                    placeholder={row.pillar ? "Initiatief…" : "Kies pillar eerst"}
                    disabled={!row.pillar}
                  />

                  {/* Action */}
                  <Select
                    value={row.action}
                    onChange={(v) => updateRow(row.id, { action: v })}
                    options={actionOptions}
                    placeholder={
                      !row.initiative
                        ? "Kies initiatief eerst"
                        : actionOptions.length === 0
                        ? "Nog geen acties"
                        : "Actie…"
                    }
                    disabled={!row.initiative || actionOptions.length === 0}
                  />

                  {/* Priority */}
                  <Select
                    value={row.priority}
                    onChange={(v) => updateRow(row.id, { priority: v })}
                    options={PRIORITIES}
                    placeholder="Prioriteit…"
                  />

                  {/* Owner */}
                  <Select
                    value={row.owner}
                    onChange={(v) => updateRow(row.id, { owner: v })}
                    options={FUNCTIONAL_OWNERS}
                    placeholder="Eigenaar…"
                  />

                  {/* Delete */}
                  <button
                    onClick={() => removeRow(row.id)}
                    disabled={displayRows.length === 1}
                    className="flex-shrink-0 p-1.5 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-0 disabled:pointer-events-none"
                    title="Verwijder rij"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={addRow}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Rij toevoegen
            </button>

            <button
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50"
              disabled={filledCount === 0}
            >
              Opslaan
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
