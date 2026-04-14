/**
 * Shared types used across all pages and the company context.
 * Single source of truth for the app's data model.
 */

/** A single value-creation action row (Value Creation Actions page) */
export interface Row {
  id: number;
  pillar: string;
  initiative: string;
  action: string;
  customAction: string;   // non-empty when action === CUSTOM_ACTION_VALUE
  priority: string;
  owner: string;
}

/** Execution metadata for a row (First 100 Days page) */
export interface ActionExtra {
  assignedTo: string;
  progress: string;
  startDate: string;
  endDate: string;
}

/** Project-level header metadata (First 100 Days page) */
export interface Header {
  companyName: string;
  projectStartDate: string;
}

/** Company (workspace) metadata */
export interface Company {
  id: string;
  name: string;
  createdAt: string;
}

/** All data scoped to a single company */
export interface CompanyData {
  rows: Row[];
  extras: Record<number, ActionExtra>;
  header: Header;
}

/** Full workspace persisted in localStorage */
export interface AppStorage {
  version: number;
  companies: Company[];
  selectedCompanyId: string;
  data: Record<string, CompanyData>;
}
