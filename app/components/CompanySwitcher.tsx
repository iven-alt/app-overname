"use client";

import { useState, useRef, useEffect } from "react";
import { useCompany } from "../lib/companyStore";

export default function CompanySwitcher() {
  const { companies, selectedCompanyId, createCompany, selectCompany, renameCompany, deleteCompany } =
    useCompany();

  const [open,          setOpen]          = useState(false);
  const [showNewInput,  setShowNewInput]  = useState(false);
  const [newName,       setNewName]       = useState("");
  const [renamingId,    setRenamingId]    = useState<string | null>(null);
  const [renameValue,   setRenameValue]   = useState("");

  const panelRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        closeAll();
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  function closeAll() {
    setOpen(false);
    setShowNewInput(false);
    setNewName("");
    setRenamingId(null);
    setRenameValue("");
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    createCompany(newName.trim());
    closeAll();
  }

  function handleRenameConfirm(e: React.FormEvent, id: string) {
    e.preventDefault();
    if (renameValue.trim()) renameCompany(id, renameValue.trim());
    setRenamingId(null);
    setRenameValue("");
  }

  function handleDelete(id: string, name: string) {
    if (companies.length <= 1) return;
    if (window.confirm(`Bedrijf "${name}" verwijderen? Dit kan niet ongedaan worden gemaakt.`)) {
      deleteCompany(id);
    }
  }

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  return (
    <div ref={panelRef} className="relative">

      {/* ── Trigger button ── */}
      <button
        onClick={() => { setOpen((v) => !v); setShowNewInput(false); setRenamingId(null); }}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:border-blue-400 hover:text-blue-600 transition-colors"
      >
        <span className="max-w-[150px] truncate">{selectedCompany?.name ?? "—"}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-3.5 w-3.5 flex-shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
          strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-68 min-w-[260px] rounded-xl border border-gray-200 bg-white shadow-xl z-50 overflow-hidden">

          {/* Company list */}
          <ul className="py-1 max-h-64 overflow-y-auto">
            {companies.map((co) => (
              <li key={co.id} className={`flex items-center gap-2 px-3 py-2 group ${co.id === selectedCompanyId ? "bg-blue-50" : "hover:bg-gray-50"}`}>
                {renamingId === co.id ? (
                  /* ── Inline rename form ── */
                  <form className="flex flex-1 items-center gap-1" onSubmit={(e) => handleRenameConfirm(e, co.id)}>
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Escape") { setRenamingId(null); setRenameValue(""); } }}
                      className="flex-1 rounded border border-blue-300 px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    {/* Confirm */}
                    <button type="submit" className="flex-shrink-0 p-1 rounded text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors" title="Bevestigen">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </button>
                    {/* Cancel */}
                    <button type="button" onClick={() => { setRenamingId(null); setRenameValue(""); }} className="flex-shrink-0 p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" title="Annuleren">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </form>
                ) : (
                  <>
                    {/* ── Company name (click to select) ── */}
                    <button
                      className="flex flex-1 items-center gap-2 text-left text-sm font-medium truncate min-w-0"
                      onClick={() => { selectCompany(co.id); closeAll(); }}
                    >
                      {/* Active indicator dot */}
                      <span
                        className="flex-shrink-0 w-2 h-2 rounded-full transition-colors"
                        style={{ backgroundColor: co.id === selectedCompanyId ? "#3B82F6" : "transparent", border: co.id === selectedCompanyId ? "none" : "1.5px solid #D1D5DB" }}
                      />
                      <span className={`truncate ${co.id === selectedCompanyId ? "text-blue-700" : "text-gray-700"}`}>
                        {co.name}
                      </span>
                    </button>

                    {/* ── Action buttons (appear on row hover) ── */}
                    <div className="flex-shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Rename */}
                      <button
                        onClick={() => { setRenamingId(co.id); setRenameValue(co.name); }}
                        className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Hernoemen"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(co.id, co.name)}
                        disabled={companies.length <= 1}
                        className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-0 disabled:pointer-events-none"
                        title="Verwijderen"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* ── New company section ── */}
          <div className="p-2">
            {showNewInput ? (
              <form className="flex items-center gap-1.5" onSubmit={handleCreate}>
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Escape") { setShowNewInput(false); setNewName(""); } }}
                  placeholder="Bedrijfsnaam…"
                  className="flex-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                />
                <button
                  type="submit"
                  className="flex-shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  OK
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowNewInput(true)}
                className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Nieuw bedrijf
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
