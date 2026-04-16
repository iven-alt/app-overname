"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type {
  Row,
  ActionExtra,
  Header,
  Company,
  CompanyData,
  AppStorage,
} from "./types";

// ── Constants ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "vca-workspace";
const VERSION     = 1;

/** Legacy single-company keys (pre-multi-company era) */
const LEGACY_ROWS_KEY   = "value-creation-actions";
const LEGACY_EXTRAS_KEY = "first-100-days-extras";
const LEGACY_HEADER_KEY = "first-100-days-header";

// ── Helpers ────────────────────────────────────────────────────────────────────

function genId(): string {
  return `co-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

/** One empty starter row for a fresh company */
function starterRow(): Row {
  return { id: 1, pillar: "", customPillar: "", initiative: "", customInitiative: "", action: "", customAction: "", priority: "", owner: "" };
}

/** Default empty data for a new company */
function defaultData(): CompanyData {
  return {
    rows:   [starterRow()],
    extras: {},
    header: { companyName: "", projectStartDate: "" },
  };
}

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch { /* corrupted */ }
  return fallback;
}

function saveJSON(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { /* storage unavailable */ }
}

/**
 * Load the workspace from localStorage.
 * If the new multi-company format is not found, migrate from legacy
 * single-company keys automatically so no existing work is lost.
 */
function loadOrMigrate(): AppStorage {
  // ── 1. Try new format ──────────────────────────────────────────────────────
  const stored = loadJSON<AppStorage | null>(STORAGE_KEY, null);
  if (
    stored &&
    stored.version === VERSION &&
    Array.isArray(stored.companies) &&
    stored.companies.length > 0
  ) {
    return stored;
  }

  // ── 2. Migrate legacy single-company data ──────────────────────────────────
  const legacyRows   = loadJSON<Row[]>(LEGACY_ROWS_KEY, []);
  const legacyExtras = loadJSON<Record<number, ActionExtra>>(LEGACY_EXTRAS_KEY, {});
  const legacyHeader = loadJSON<Header>(LEGACY_HEADER_KEY, { companyName: "", projectStartDate: "" });

  const company: Company = {
    id:        genId(),
    name:      legacyHeader.companyName?.trim() || "Mijn bedrijf",
    createdAt: nowISO(),
  };

  // Normalise legacy rows: add fields that might be missing (back-compat)
  const rows: Row[] = legacyRows.length > 0
    ? legacyRows.map((r) => ({ ...starterRow(), ...r }))
    : defaultData().rows;

  const migrated: AppStorage = {
    version:           VERSION,
    companies:         [company],
    selectedCompanyId: company.id,
    data: {
      [company.id]: { rows, extras: legacyExtras, header: legacyHeader },
    },
  };

  // Persist immediately so we never migrate again
  saveJSON(STORAGE_KEY, migrated);
  return migrated;
}

// ── Context type ───────────────────────────────────────────────────────────────

interface CompanyContextValue {
  /** True once the client has hydrated and localStorage is loaded */
  mounted: boolean;

  companies:         Company[];
  selectedCompanyId: string | null;
  /** Always returns valid data (empty defaults if no company is selected) */
  companyData:       CompanyData;

  // ── Company management ────────────────────────────────────────────────────
  createCompany: (name: string) => void;
  selectCompany: (id: string)   => void;
  renameCompany: (id: string, name: string) => void;
  deleteCompany: (id: string)   => void;

  // ── Data setters (always scoped to the selected company) ──────────────────
  setRows:   (rows:   Row[])                      => void;
  setExtras: (extras: Record<number, ActionExtra>) => void;
  setHeader: (patch:  Partial<Header>)             => void;
}

// ── Context ────────────────────────────────────────────────────────────────────

const CompanyContext = createContext<CompanyContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────────

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [storage, setStorage] = useState<AppStorage>({
    version:           VERSION,
    companies:         [],
    selectedCompanyId: "",
    data:              {},
  });

  // Load (or migrate) on first client render
  useEffect(() => {
    setStorage(loadOrMigrate());
    setMounted(true);
  }, []);

  // Persist whenever storage changes (skip the initial SSR render)
  useEffect(() => {
    if (!mounted) return;
    saveJSON(STORAGE_KEY, storage);
  }, [storage, mounted]);

  // ── Derived values ────────────────────────────────────────────────────────

  const { companies, selectedCompanyId } = storage;

  const companyData: CompanyData =
    selectedCompanyId && storage.data[selectedCompanyId]
      ? storage.data[selectedCompanyId]
      : defaultData();

  // ── Company management (use functional setState to avoid stale closures) ──

  const createCompany = useCallback((name: string) => {
    const co: Company = {
      id:        genId(),
      name:      name.trim() || "Nieuw bedrijf",
      createdAt: nowISO(),
    };
    setStorage((prev) => ({
      ...prev,
      companies:         [...prev.companies, co],
      selectedCompanyId: co.id,
      data:              { ...prev.data, [co.id]: defaultData() },
    }));
  }, []);

  const selectCompany = useCallback((id: string) => {
    setStorage((prev) => ({ ...prev, selectedCompanyId: id }));
  }, []);

  const renameCompany = useCallback((id: string, name: string) => {
    setStorage((prev) => ({
      ...prev,
      companies: prev.companies.map((c) =>
        c.id === id ? { ...c, name: name.trim() || c.name } : c
      ),
    }));
  }, []);

  const deleteCompany = useCallback((id: string) => {
    setStorage((prev) => {
      if (prev.companies.length <= 1) return prev; // never delete the last company
      const companies         = prev.companies.filter((c) => c.id !== id);
      const selectedCompanyId =
        prev.selectedCompanyId === id ? companies[0].id : prev.selectedCompanyId;
      const data = { ...prev.data };
      delete data[id];
      return { ...prev, companies, selectedCompanyId, data };
    });
  }, []);

  // ── Data setters (functional setState → always operates on latest state) ──

  const setRows = useCallback((rows: Row[]) => {
    setStorage((prev) => {
      if (!prev.selectedCompanyId) return prev;
      return {
        ...prev,
        data: {
          ...prev.data,
          [prev.selectedCompanyId]: {
            ...defaultData(),
            ...prev.data[prev.selectedCompanyId],
            rows,
          },
        },
      };
    });
  }, []);

  const setExtras = useCallback((extras: Record<number, ActionExtra>) => {
    setStorage((prev) => {
      if (!prev.selectedCompanyId) return prev;
      return {
        ...prev,
        data: {
          ...prev.data,
          [prev.selectedCompanyId]: {
            ...defaultData(),
            ...prev.data[prev.selectedCompanyId],
            extras,
          },
        },
      };
    });
  }, []);

  const setHeader = useCallback((patch: Partial<Header>) => {
    setStorage((prev) => {
      if (!prev.selectedCompanyId) return prev;
      const current = prev.data[prev.selectedCompanyId]?.header
        ?? { companyName: "", projectStartDate: "" };
      return {
        ...prev,
        data: {
          ...prev.data,
          [prev.selectedCompanyId]: {
            ...defaultData(),
            ...prev.data[prev.selectedCompanyId],
            header: { ...current, ...patch },
          },
        },
      };
    });
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <CompanyContext.Provider
      value={{
        mounted,
        companies,
        selectedCompanyId,
        companyData,
        createCompany,
        selectCompany,
        renameCompany,
        deleteCompany,
        setRows,
        setExtras,
        setHeader,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

// ── Consumer hook ──────────────────────────────────────────────────────────────

export function useCompany(): CompanyContextValue {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be used inside <CompanyProvider>");
  return ctx;
}
