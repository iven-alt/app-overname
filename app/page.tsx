"use client";

import { useState } from "react";
import Nav from "./components/Nav";
import { PILLAR_META, PILLAR_LABELS } from "./lib/pillarMeta";
import { useCompany } from "./lib/companyStore";

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
    "Financiële en fiscale optimalisatie": [
      "Structureren van intercompany transacties voor belastingefficiëntie",
      "Integratie van financiële systemen en rapportering",
      "Gebruik van schaalvoordelen bij bank- en verzekeringsdiensten",
    ],
  },
  "Klantwaardecreatie": {
    "Data-analyse en klantinzicht": [
      "Centraal klantbeeld creëren via geïntegreerde CRM-systemen",
      "Analyseren van klantgedrag, churn-risico en aankoopvoorkeuren",
      "Segmentatie op basis van waarde, gedrag en behoeften",
      "Voorspellende modellen inzetten voor retentie en upsell",
    ],
    "Verbetering van de klantbeleving": [
      "Verbeteren van een verbeterd commercieel traject via het gezamenlijk aanbod",
      "Uitrollen van klantgerichte training voor medewerkers",
      "Gebruik van feedbackmomenten om processen aan te passen",
      "Consistente merk- en servicebeleving over alle kanalen heen",
    ],
    "Verhoging van klantloyaliteit": [
      "Lanceren van loyaliteitsprogramma's of klantclubs",
      "Proactieve opvolging van tevredenheid en klachten",
      "Inzetten op communityvorming en klantbetrokkenheid",
      "Transparante communicatie over waarde en evoluties",
    ],
    "Ecosysteemontwikkeling en partnerships": [
      "Samenwerkingen met complementaire dienstverleners",
      "Integratie van derde partijen in de klantjourney (bv. via API's)",
      "Gezamenlijke proposities of platformdiensten ontwikkelen",
    ],
    "Personalisatie en klantsegmentatie": [
      "Gepersonaliseerde aanbiedingen op basis van klantdata",
      "Dynamische content afgestemd op gebruikersprofiel",
      "Relevante aanbevelingen via e-mail, app of website",
    ],
    "Optimalisatie van touchpoints en servicekanalen": [
      "Optimaliseren van digitale contactpunten (website, app, chatbot)",
      "Omnichannelstrategie met naadloze ervaring",
      "Verkorten van responstijden en verhogen van bereikbaarheid",
      "Zelfbedieningsopties voor eenvoudige klantvragen",
    ],
  },
  "Innovatie en groei": {
    "Investeren in nieuwe technologieën": [
      "Inzetten op AI, IoT, blockchain of andere opkomende technologieën",
      "Pilootprojecten opzetten met innovatieve toepassingen",
      "Aankoop of integratie van technologische start-ups",
      "Oprichten van innovatiehubs of testlabs",
    ],
    "Ontwikkelen van nieuwe producten of diensten": [
      "Cocreatie met klanten of partners",
      "Integreren van functionaliteiten uit overgenomen bedrijf",
      "Klantgedreven innovatieprocessen opzetten",
      "Opzetten van agile ontwikkelteams",
    ],
    "Innovatieve businessmodellen": [
      "Shift van productverkoop naar abonnementsmodellen (SaaS, pay-per-use)",
      "Platformdenken: verbinden van verschillende spelers op één dienst",
      "Experimenteren met freemium of hybride verdienmodellen",
    ],
    "Digitale transformatie": [
      "Digitaliseren van kernprocessen en interactie met klanten",
      "Gebruik van data en analytics voor besluitvorming",
      "Digitale customer journeys ontwikkelen",
      "Automatiseren van marketing, sales en operations",
    ],
    "Bouwen aan ecosystemen en strategische allianties": [
      "Opzetten van strategische partnerships met complementaire spelers",
      "Delen van data, infrastructuur of klanten",
      "Samen lanceren van geïntegreerde oplossingen of markten betreden",
    ],
    "Versnellen van time to market": [
      "Kortere ontwikkelcycli via agile methodes",
      "Snellere integratie van innovaties in bestaande structuren",
      "Minimal viable products (MVP's) sneller lanceren en testen",
      "Gebruik van incubators of venture programma's",
    ],
  },
  "Human capital": {
    "Talentontwikkeling en opleiding": [
      "Uitrollen van interne opleidingsprogramma's of academies",
      "Opstellen van groeiplannen per functie of individu",
      "Competentie-assessments en gepersonaliseerde leerlijnen",
      "Investeren in digitale leerplatformen",
    ],
    "Verhogen van medewerkersbetrokkenheid": [
      "Regelmatige pulse surveys en feedbackmomenten",
      "Betrekken van medewerkers bij integratieprojecten",
      "Vier successen en mijlpalen zichtbaar",
      "Inzetten op interne communicatie en transparantie",
    ],
    "Automatisatie van repetitieve hr-taken": [
      "Digitaliseren van onboarding, tijdsregistratie en verlofaanvragen",
      "Invoeren van self-service hr-tools",
      "Automatiseren van repetitieve administratieve processen",
      "Integratie van hr-systemen (bv. payroll, evaluaties)",
    ],
    "Retentie en behoud van sleutelmedewerkers": [
      "Identificeren van kritieke profielen",
      "Invoeren van retentiebonussen of langetermijnincentives",
      "Aanbieden van loopbaanontwikkeling en perspectief",
      "Transparante communicatie over de toekomst",
    ],
    "Cultuurintegratie en alignment": [
      "Workshops rond gedeelde waarden en gedragingen",
      "Formuleren van een gezamenlijke cultuurvisie",
      "Cultuurbarometer en follow-up",
      "Aanstelling van cultuurambassadeurs of changeteams",
    ],
    "Leiderschapsontwikkeling en coaching": [
      "Coachingstrajecten voor nieuwe en bestaande leiders",
      "Peer learning en mentorprogramma's",
      "Ondersteuning in change leadership",
      "Objectieve evaluatie van leiderschapscompetenties",
    ],
  },
  "Duurzaamheid": {
    "Circulaire processen en afvalreductie": [
      "Invoeren van hergebruik, recyclage of refurbishingprocessen",
      "Verminderen van verpakkingsmateriaal",
      "Ontwerpen van producten voor langere levensduur",
      "Samenwerkingen met circulaire partners opzetten",
    ],
    "CO2-reductie en energie-efficiëntie": [
      "Investeren in energie-efficiënte installaties en gebouwen",
      "Overschakelen op hernieuwbare energie",
      "Optimaliseren van transport en logistiek",
      "Invoeren van energiemanagementsystemen",
    ],
    "ESG-strategieën en compliance": [
      "Ontwikkelen van een ESG-beleid afgestemd op sector en stakeholders",
      "Opvolging van sociale, ecologische en governance KPI's",
      "Integratie van ESG-criteria in besluitvorming en investeringen",
      "Voldoen aan CSRD, SFDR of andere wetgeving",
    ],
    "Duurzame supply chain": [
      "Beoordeling van leveranciers op duurzaamheid",
      "Verduurzamen van grondstoffen en transportmiddelen",
      "Inzetten op lokale of ethisch verantwoorde sourcing",
      "Samenwerkingen rond ketentransparantie en CO2-inzicht",
    ],
    "Rapportering en transparantie": [
      "Publicatie van duurzaamheidsverslagen",
      "Rapportering volgens internationale standaarden (GRI, ESRS)",
      "Transparante communicatie naar klanten, investeerders en medewerkers",
      "Gebruik van dashboards om impact zichtbaar te maken",
    ],
    "Bewustmaking en betrokkenheid van medewerkers": [
      "Organiseren van duurzaamheidsworkshops en challenges",
      "Inzetten op intern ambassadeurschap",
      "Link leggen tussen duurzame initiatieven en bedrijfswaarden",
      "Incentives voor groene ideeën of gedragsverandering",
    ],
  },
  "Financiële optimalisatie": {
    "Optimalisatie van kapitaalstructuur": [
      "Evaluatie van debt/equity-verhouding",
      "Herfinanciering tegen gunstigere voorwaarden",
      "Inzetten van overtollige cash voor strategische investeringen",
      "Optimaliseren van dividendbeleid en kapitaalreserves",
    ],
    "Beheer van werkkapitaal": [
      "Versnellen van debiteureninning",
      "Vertragen van betalingen aan leveranciers binnen redelijke grenzen",
      "Optimaliseren van voorraadrotatie en voorraadniveaus",
      "Invoeren van gecentraliseerd werkkapitaalbeheer",
    ],
    "Schuldenstructuur en financieringsstrategie": [
      "Consolidatie van bestaande leningen en kredietlijnen",
      "Optimaliseren van rente- en aflossingsstructuren",
      "Inzetten op alternatieve financieringsvormen (lease, factoring, enz.)",
      "Onderhandelen met banken voor betere convenanten",
    ],
    "Integratie van financiële systemen en rapportering": [
      "Harmoniseren van rapporteringsstandaarden en KPI's",
      "Integreren van boekhoudsystemen en analytische rapportering",
      "Implementeren van geconsolideerde dashboards en forecastingtools",
    ],
    "Cashflowbeheer en liquiditeitsplanning": [
      "Uitrollen van cash forecasting op groepsniveau",
      "Identificeren van cash drains en optimalisatie-opportuniteiten",
      "Centraliseren van cashposities (cash pooling)",
      "Invoeren van scenario-analyses voor financiële stressmodellen",
    ],
    "Fiscaliteit en juridische structuren": [
      "Herstructurering van juridische entiteiten",
      "Optimaliseren van fiscale consolidatie en verliezencompensatie",
      "In kaart brengen van internationale fiscale impact",
      "Structureren van intragroeptransacties voor efficiëntie",
    ],
  },
};

const PILLAR_NAMES  = Object.keys(PILLARS);

// PILLAR_META and PILLAR_LABELS are imported from ./lib/pillarMeta

// Sentinel values used when the user chooses to type their own pillar / initiative / action
const CUSTOM_PILLAR_VALUE     = "__custom_pillar__";
const CUSTOM_PILLAR_LABEL     = "Eigen pillar invullen...";
const CUSTOM_INITIATIVE_VALUE = "__custom_initiative__";
const CUSTOM_INITIATIVE_LABEL = "Eigen initiatief invullen...";
const CUSTOM_ACTION_VALUE     = "__custom__";
const CUSTOM_ACTION_LABEL     = "Eigen actie invullen...";

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
  customPillar: string;      // typed text when pillar === CUSTOM_PILLAR_VALUE
  initiative: string;
  customInitiative: string;  // typed text when initiative === CUSTOM_INITIATIVE_VALUE
  action: string;
  customAction: string;      // typed text when action === CUSTOM_ACTION_VALUE
  priority: string;
  owner: string;
}

/** Generates an empty row with an ID one higher than the current max. */
function emptyRow(currentRows: Row[] = []): Row {
  const id = currentRows.length === 0 ? 1 : Math.max(...currentRows.map((r) => r.id)) + 1;
  return { id, pillar: "", customPillar: "", initiative: "", customInitiative: "", action: "", customAction: "", priority: "", owner: "" };
}

// ── Select component ──────────────────────────────────────────────────────────

function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  extraOption,
  optionLabels,
  accentColor,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder: string;
  disabled?: boolean;
  extraOption?: { value: string; label: string };
  /** Optional display-label overrides: { [optionValue]: displayText } */
  optionLabels?: Record<string, string>;
  /** When set and a value is selected, tints the border with this color */
  accentColor?: string;
}) {
  const accentStyle: React.CSSProperties | undefined =
    accentColor && value
      ? { borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}30` }
      : undefined;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      style={accentStyle}
      className={`w-full rounded-lg border px-3 py-2 text-sm leading-tight transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
        ${disabled ? "cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200" : "bg-white border-gray-300 text-gray-800 hover:border-blue-400"}
        ${!value ? "text-gray-400" : "text-gray-800"}`}
    >
      <option value="" disabled hidden>{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{optionLabels?.[opt] ?? opt}</option>
      ))}
      {extraOption && (
        <option value={extraOption.value}>{extraOption.label}</option>
      )}
    </select>
  );
}

// ── CustomInput component ─────────────────────────────────────────────────────
// Replaces a dropdown when "Eigen … invullen…" is active.
// The "terug" button is embedded inside the input on the right side.

function CustomInput({
  value,
  onChange,
  onBack,
  placeholder,
  autoFocus = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onBack: () => void;
  placeholder: string;
  /** Pass true only for the field the user directly interacted with */
  autoFocus?: boolean;
}) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-16 text-sm leading-tight text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-colors"
      />
      {/* Right-side controls: back button */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
        <button
          type="button"
          onClick={onBack}
          title="Terug naar dropdown"
          className="rounded px-1.5 py-0.5 text-[11px] text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors leading-none"
        >
          terug
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ValueCreationPage() {
  // ── Company context replaces all local localStorage logic ─────────────────
  const { mounted, companyData, setRows } = useCompany();
  const rows = companyData.rows as Row[];

  function updateRow(id: number, patch: Partial<Row>) {
    setRows(
      rows.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, ...patch };
        // Cascade resets down the hierarchy
        if ("pillar" in patch) {
          if (patch.pillar === CUSTOM_PILLAR_VALUE) {
            // Custom pillar: auto-activate custom inputs for initiative and action
            // so the user can type straight away without extra clicks.
            // Preserve any previously typed custom text (recover on re-select).
            updated.initiative = CUSTOM_INITIATIVE_VALUE;
            updated.action     = CUSTOM_ACTION_VALUE;
          } else {
            // Standard pillar (or cleared): reset initiative and action fully
            updated.initiative     = "";
            updated.customInitiative = "";
            updated.action         = "";
            updated.customAction   = "";
          }
        }
        if ("initiative" in patch) {
          if (patch.initiative === CUSTOM_INITIATIVE_VALUE) {
            // Custom initiative: auto-activate action custom input too
            updated.action = CUSTOM_ACTION_VALUE;
            // Preserve customAction text (recovered on re-select)
          } else {
            // Standard initiative (or cleared): reset action fully
            updated.action       = "";
            updated.customAction = "";
          }
        }
        // customPillar / customInitiative / customAction are intentionally NOT reset
        // when only a lower level changes, so typed text is recovered on re-select.
        return updated;
      })
    );
    // Any edit clears the saved (green) state for that row
    setSavedRows((prev) => { const next = new Set(prev); next.delete(id); return next; });
  }

  function addRow() { setRows([...rows, emptyRow(rows)]); }
  function removeRow(id: number) {
    if (rows.length > 1) setRows(rows.filter((r) => r.id !== id));
  }

  /** Mark every fully-filled row as saved — all its fields turn green */
  function handleSave() {
    const saved = new Set<number>();
    rows.forEach((r) => {
      const pillarFilled     = r.pillar     === CUSTOM_PILLAR_VALUE     ? !!(r.customPillar     ?? "").trim() : !!r.pillar;
      const initiativeFilled = r.initiative === CUSTOM_INITIATIVE_VALUE ? !!(r.customInitiative ?? "").trim() : !!r.initiative;
      const actionFilled     = r.action     === CUSTOM_ACTION_VALUE     ? !!(r.customAction     ?? "").trim() : !!r.action;
      if (pillarFilled && initiativeFilled && actionFilled && r.priority && r.owner) saved.add(r.id);
    });
    setSavedRows(saved);
  }

  /** IDs of rows whose all fields should show the saved (green) styling */
  const [savedRows, setSavedRows] = useState<Set<number>>(new Set());

  // Stable display rows: one placeholder row during SSR / before mount
  const [ssrPlaceholder] = useState<Row[]>([emptyRow()]);
  const displayRows = mounted ? rows : ssrPlaceholder;
  const filledCount = mounted
    ? rows.filter((r) => {
        const pillarFilled =
          r.pillar     === CUSTOM_PILLAR_VALUE     ? !!(r.customPillar     ?? "").trim() : !!r.pillar;
        const initiativeFilled =
          r.initiative === CUSTOM_INITIATIVE_VALUE ? !!(r.customInitiative ?? "").trim() : !!r.initiative;
        const actionFilled =
          r.action     === CUSTOM_ACTION_VALUE     ? !!(r.customAction     ?? "").trim() : !!r.action;
        return pillarFilled && initiativeFilled && actionFilled && r.priority && r.owner;
      }).length
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
                  className={`grid grid-cols-[1.5fr_2fr_2.5fr_1.2fr_1fr_auto] gap-3 items-start px-6 py-4 transition-colors group border-l-2 ${
                    savedRows.has(row.id)
                      ? "bg-green-50/60 border-l-green-300 hover:bg-green-50/80"
                      : "hover:bg-blue-50/30 border-l-transparent"
                  }`}
                >
                  {/* Row number + Pillar */}
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-xs font-medium flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors mt-px">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      {row.pillar === CUSTOM_PILLAR_VALUE ? (
                        <CustomInput
                          value={row.customPillar ?? ""}
                          onChange={(v) => updateRow(row.id, { customPillar: v })}
                          onBack={() => updateRow(row.id, { pillar: "", customPillar: "" })}
                          placeholder="Omschrijf je eigen pillar…"
                          autoFocus
                        />
                      ) : (
                        <Select
                          value={row.pillar}
                          onChange={(v) => updateRow(row.id, { pillar: v })}
                          options={PILLAR_NAMES}
                          placeholder="Pillar…"
                          optionLabels={PILLAR_LABELS}
                          accentColor={PILLAR_META[row.pillar]?.color}
                          extraOption={{ value: CUSTOM_PILLAR_VALUE, label: CUSTOM_PILLAR_LABEL }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Initiative */}
                  {row.initiative === CUSTOM_INITIATIVE_VALUE ? (
                    <CustomInput
                      value={row.customInitiative ?? ""}
                      onChange={(v) => updateRow(row.id, { customInitiative: v })}
                      onBack={() => updateRow(row.id, { initiative: "", customInitiative: "" })}
                      placeholder="Omschrijf je eigen initiatief…"
                      autoFocus={row.pillar !== CUSTOM_PILLAR_VALUE}
                    />
                  ) : (
                    <Select
                      value={row.initiative}
                      onChange={(v) => updateRow(row.id, { initiative: v })}
                      options={initiativeOptions}
                      placeholder={row.pillar ? "Initiatief…" : "Kies pillar eerst"}
                      disabled={!row.pillar}
                      extraOption={row.pillar ? { value: CUSTOM_INITIATIVE_VALUE, label: CUSTOM_INITIATIVE_LABEL } : undefined}
                    />
                  )}

                  {/* Action */}
                  {row.action === CUSTOM_ACTION_VALUE ? (
                    <CustomInput
                      value={row.customAction}
                      onChange={(v) => updateRow(row.id, { customAction: v })}
                      onBack={() => updateRow(row.id, { action: "", customAction: "" })}
                      placeholder="Omschrijf je eigen actie…"
                      autoFocus={row.pillar !== CUSTOM_PILLAR_VALUE && row.initiative !== CUSTOM_INITIATIVE_VALUE}
                    />
                  ) : (
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
                      disabled={!row.initiative}
                      extraOption={row.initiative ? { value: CUSTOM_ACTION_VALUE, label: CUSTOM_ACTION_LABEL } : undefined}
                    />
                  )}

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
              onClick={handleSave}
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
