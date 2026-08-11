import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect, useMemo } from "react";
import { Plus, X, ShieldAlert, Loader2, Trash2, Edit2 } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { ConfirmModal } from "@/components/confirm-modal";
import { PPE_LABELS, zoneLabel, type PpeKey, type Zone } from "@/lib/mock-data";
import { useSessionFetch, invalidateSessionCache } from "@/hooks/use-session-fetch";
import { useToast } from "@/lib/toast-context";
import { useAppData } from "@/lib/data-context";

export const Route = createFileRoute("/zones")({
  head: () => ({
    meta: [
      { title: "Zone Configuration — EdgeVision Rule Engine" },
      {
        name: "description",
        content:
          "Configure required PPE per zone and tune temporal validation: frame threshold, minimum dwell time and confidence floor.",
      },
    ],
  }),
  component: ZonesPage,
});

const ppeKeys = Object.keys(PPE_LABELS) as PpeKey[];

// Only these positive PPE items should be configurable as zone rules by the user
const CONFIGURABLE_PPE: PpeKey[] = [
  "helmet",
  "vest",
  "gloves",
  "boots",
  "goggles",
  "ear-mufs",
  "face-guard",
  "safety_belt",
  "lanyard",
  "hook",
];

const defaultRequired: Record<PpeKey, boolean> = {
  helmet: true,
  "no-helmet": false,
  vest: true,
  "no-vest": false,
  person: false,
  gloves: false,
  "no-gloves": false,
  boots: false,
  "no-boots": false,
  goggles: false,
  "no-goggles": false,
  "ear-mufs": false,
  "face-guard": false,
  "safety-suit": false,
  safety_belt: false,
  lanyard: false,
  hook: false,
  anchor_point: false,
  tool: false,
};

/** Convert a zone from the API into our local Zone type */
function apiZoneToLocal(apiZone: any): Zone {
  const requiredPpe: string[] = apiZone.required_ppe || [];
  const required: Record<PpeKey, boolean> = { ...defaultRequired };
  for (const key of ppeKeys) {
    required[key] = requiredPpe.includes(key);
  }
  return {
    id: apiZone.id || apiZone.name,
    name: apiZone.name || apiZone.id,
    kind: apiZone.description || "General plant",
    required,
    frameThreshold: 8,
    dwellSeconds: 2,
    confidence: 0.60,
  };
}

function ZonesPage() {
  const { showToast } = useToast();
  const { refetchAll } = useAppData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [savingZoneId, setSavingZoneId] = useState<string | null>(null);
  const [submittingAddZone, setSubmittingAddZone] = useState(false);
  const { data: apiData, loading, refetch: fetchZones } = useSessionFetch<any>("/api/zones", { zones: [], db_zones: [] });

  const initialConfig = useMemo<Zone[]>(() => {
    const dbZones = apiData.db_zones || [];
    const ruleZones = apiData.zones || [];
    if (dbZones.length > 0) return dbZones.map(apiZoneToLocal);
    if (ruleZones.length > 0) return ruleZones.map(apiZoneToLocal);
    return [];
  }, [apiData]);

  const [zones, setZones] = useState<Zone[]>([]);

  useEffect(() => {
    if (initialConfig.length > 0) {
      setZones(initialConfig);
    }
  }, [initialConfig]);

  const config = zones.length > 0 ? zones : initialConfig;

  // New Zone Form State
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneKind, setNewZoneKind] = useState<string>("General plant");
  const [newRequired, setNewRequired] = useState<Record<PpeKey, boolean>>({ ...defaultRequired });
  const [newFrameThreshold, setNewFrameThreshold] = useState(8);
  const [newDwellSeconds, setNewDwellSeconds] = useState(2);
  const [newConfidence, setNewConfidence] = useState(0.60);

  const update = (id: string, patch: Partial<Zone>) => {
    setZones((prev) => {
      const base = prev.length > 0 ? prev : initialConfig;
      const updated = base.map((z) => (z.id === id ? { ...z, ...patch } : z));
      return updated;
    });
  };

  const handleAddZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim()) return;

    setSubmittingAddZone(true);
    const newZone: Zone = {
      id: `ZONE-0${config.length + 1}`,
      name: newZoneName.trim(),
      kind: newZoneKind,
      required: { ...newRequired },
      frameThreshold: newFrameThreshold,
      dwellSeconds: newDwellSeconds,
      confidence: newConfidence,
    };

    setZones((prev) => [...(prev.length > 0 ? prev : initialConfig), newZone]);

    const requiredPpe = CONFIGURABLE_PPE.filter((k) => newZone.required[k]);

    fetch("/api/zones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: newZone.id,
        name: newZone.name,
        description: newZone.kind,
        required_ppe: requiredPpe,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to create zone");
        invalidateSessionCache("/api/zones");
        return fetchZones(true);
      })
      .then(() => {
        refetchAll();
        setShowAddModal(false);
        setNewZoneName("");
        setNewRequired({ ...defaultRequired });
        showToast("New safety zone created successfully");
      })
      .catch((err) => {
        console.error("Failed to sync new zone to backend", err);
        showToast("Failed to create safety zone");
      })
      .finally(() => setSubmittingAddZone(false));
  };

  const handleSaveZone = (targetZone: Zone) => {
    setSavingZoneId(targetZone.id);
    const requiredPpe = CONFIGURABLE_PPE.filter((k) => targetZone.required[k]);
    fetch("/api/zones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: targetZone.id,
        name: targetZone.name,
        description: targetZone.kind,
        required_ppe: requiredPpe,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save zone");
        invalidateSessionCache("/api/zones");
        return fetchZones(true);
      })
      .then(() => {
        refetchAll();
        showToast("Zone safety rules saved successfully");
      })
      .catch((err) => {
        console.error("Failed to save zone settings", err);
        showToast("Failed to save zone settings");
      })
      .finally(() => setSavingZoneId(null));
  };

  const [deletingZoneId, setDeletingZoneId] = useState<string | null>(null);
  const [confirmDeleteZone, setConfirmDeleteZone] = useState<Zone | null>(null);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [submittingEditZone, setSubmittingEditZone] = useState(false);

  const executeDeleteZone = () => {
    if (!confirmDeleteZone) return;
    const targetId = confirmDeleteZone.id;
    setDeletingZoneId(targetId);
    fetch(`/api/zones/${encodeURIComponent(targetId)}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete zone");
        invalidateSessionCache("/api/zones");
        return fetchZones(true);
      })
      .then(() => {
        setZones((prev) => prev.filter((z) => z.id !== targetId));
        refetchAll();
        showToast(`Safety zone '${zoneLabel(targetId)}' deleted successfully`);
      })
      .catch((err) => {
        console.error("Failed to delete zone", err);
        showToast("Failed to delete safety zone");
      })
      .finally(() => {
        setDeletingZoneId(null);
        setConfirmDeleteZone(null);
      });
  };

  const handleSaveEditZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone || !editingZone.name.trim()) return;

    setSubmittingEditZone(true);
    const requiredPpe = CONFIGURABLE_PPE.filter((k) => editingZone.required[k]);

    fetch("/api/zones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingZone.id,
        name: editingZone.name.trim(),
        description: editingZone.kind || editingZone.description,
        required_ppe: requiredPpe,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update zone");
        invalidateSessionCache("/api/zones");
        return fetchZones(true);
      })
      .then(() => {
        refetchAll();
        setEditingZone(null);
        showToast(`Safety zone '${editingZone.name}' updated successfully`);
      })
      .catch((err) => {
        console.error("Failed to update zone", err);
        showToast("Failed to update safety zone");
      })
      .finally(() => setSubmittingEditZone(false));
  };

  return (
    <AppShell>
      <PageHeader
        title="Zone Configuration & Custom Rules"
        subtitle="Required PPE is evaluated per zone. Temporal validation suppresses single-frame noise before an alert is raised."
        actions={[
          <button
            key="add-zone"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded border border-primary bg-primary px-3 py-1.5 text-xs text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" />
            <span>Add Safety Zone</span>
          </button>,
        ]}
      />

      {loading ? (
        <div className="rounded panel-surface p-12 text-center text-muted-foreground animate-pulse">
          Loading zone configuration from database...
        </div>
      ) : config.length === 0 ? (
        <div className="rounded panel-surface p-12 text-center text-muted-foreground">
          <p className="text-sm">No zones configured yet.</p>
          <p className="text-xs mt-1">Click "Add Safety Zone" to create your first zone.</p>
        </div>
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          {config.map((z) => (
            <section key={z.id} className="relative overflow-hidden rounded panel-surface">
              <div className="hazard-stripe absolute inset-x-0 top-0 h-1 opacity-60" />
              <div className="px-4 pb-4 pt-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="display-title text-lg uppercase">{zoneLabel(z.name || z.id)}</h2>
                    <p className="telemetry text-[11px] text-muted-foreground">
                      {zoneLabel(z.id)} · {z.kind || z.description || "Active Zone"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="display-title rounded-sm bg-accent px-2 py-0.5 text-[10px] text-accent-foreground">
                      {CONFIGURABLE_PPE.filter((k) => z.required[k]).length} rules active
                    </span>
                    <button
                      onClick={() => setEditingZone({ ...z })}
                      title="Edit Zone Settings & Rules"
                      className="rounded border border-primary/30 bg-primary/10 p-1 text-primary hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteZone(z)}
                      disabled={deletingZoneId === z.id}
                      title="Delete Safety Zone"
                      className="rounded border border-destructive/30 bg-destructive/10 p-1 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {deletingZoneId === z.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {CONFIGURABLE_PPE.map((k) => (
                    <label
                      key={k}
                      className="flex cursor-pointer items-center justify-between gap-3 rounded border border-border bg-background/40 px-3 py-2"
                    >
                      <span className="text-sm">{PPE_LABELS[k]}</span>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={z.required[k]}
                        onChange={(e) =>
                          update(z.id, { required: { ...z.required, [k]: e.target.checked } })
                        }
                      />
                      <span
                        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                          z.required[k] ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 size-4 rounded-full bg-background transition-all ${
                            z.required[k] ? "left-4.5" : "left-0.5"
                          }`}
                        />
                      </span>
                    </label>
                  ))}
                </div>

                <div className="mt-4 space-y-4 rounded border border-border bg-background/40 p-3">
                  <h3 className="display-title text-[10px] text-muted-foreground">
                    Temporal validation parameters
                  </h3>
                  <Slider
                    label="Violation frames (of last 10)"
                    value={z.frameThreshold}
                    min={4}
                    max={10}
                    step={1}
                    suffix="/10"
                    onChange={(v) => update(z.id, { frameThreshold: v })}
                  />
                  <Slider
                    label="Minimum dwell in zone"
                    value={z.dwellSeconds}
                    min={1}
                    max={10}
                    step={1}
                    suffix=" s"
                    onChange={(v) => update(z.id, { dwellSeconds: v })}
                  />
                  <Slider
                    label="Confidence threshold"
                    value={Math.round(z.confidence * 100)}
                    min={40}
                    max={95}
                    step={1}
                    suffix="%"
                    onChange={(v) => update(z.id, { confidence: v / 100 })}
                  />
                </div>

                <div className="mt-4 flex items-center justify-end border-t border-border pt-3">
                  <button
                    type="button"
                    disabled={savingZoneId === z.id}
                    onClick={() => handleSaveZone(z)}
                    className="flex items-center gap-1.5 rounded bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {savingZoneId === z.id ? <Loader2 className="size-3.5 animate-spin" /> : null}
                    <span>{savingZoneId === z.id ? "Saving..." : "Save Zone Settings"}</span>
                  </button>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Custom Zone Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur">
          <div className="w-full max-w-lg rounded-lg border border-border panel-surface p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ShieldAlert className="size-5 text-primary" />
                <h2 className="display-title text-base">Add New Safety Zone</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleAddZone} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Zone Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chemical Storage Bay 4"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">Zone Environment Kind</label>
                <select
                  value={newZoneKind}
                  onChange={(e) => setNewZoneKind(e.target.value)}
                  className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="General plant">General plant</option>
                  <option value="Construction">Construction</option>
                  <option value="Work at height">Work at height</option>
                  <option value="Restricted machinery">Restricted machinery</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-2">Required Safety Items</label>
                <div className="grid grid-cols-2 gap-2">
                  {CONFIGURABLE_PPE.map((k) => (
                    <label key={k} className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRequired[k]}
                        onChange={(e) => setNewRequired({ ...newRequired, [k]: e.target.checked })}
                        className="rounded border-border text-primary focus:ring-0"
                      />
                      <span>{PPE_LABELS[k]}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-border">
                <Slider
                  label="Violation Frames Threshold"
                  value={newFrameThreshold}
                  min={4}
                  max={10}
                  step={1}
                  suffix="/10"
                  onChange={setNewFrameThreshold}
                />
                <Slider
                  label="Minimum Dwell Seconds"
                  value={newDwellSeconds}
                  min={1}
                  max={10}
                  step={1}
                  suffix=" s"
                  onChange={setNewDwellSeconds}
                />
                <Slider
                  label="Confidence Floor"
                  value={Math.round(newConfidence * 100)}
                  min={40}
                  max={95}
                  step={1}
                  suffix="%"
                  onChange={(v) => setNewConfidence(v / 100)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded border border-border px-4 py-2 text-xs text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAddZone}
                  className="flex items-center gap-1.5 rounded bg-primary px-4 py-2 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {submittingAddZone ? <Loader2 className="size-3.5 animate-spin" /> : null}
                  <span>{submittingAddZone ? "Saving..." : "Save Safety Zone"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Zone Themed Modal */}
      {editingZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-lg border border-border panel-surface shadow-2xl">
            <div className="hazard-stripe h-1.5 w-full bg-primary" />
            <div className="flex items-center justify-between border-b border-border/80 px-5 py-4 bg-background/50">
              <div className="flex items-center gap-2">
                <Edit2 className="size-4 text-primary" />
                <h3 className="display-title text-base font-bold">Edit Safety Zone: {editingZone.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingZone(null)}
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditZone} className="p-5 space-y-4">
              <div>
                <label className="telemetry text-xs text-muted-foreground block mb-1">Zone Name</label>
                <input
                  type="text"
                  required
                  value={editingZone.name}
                  onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
                  className="telemetry w-full rounded border border-input bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="telemetry text-xs text-muted-foreground block mb-1">Description / Category</label>
                <input
                  type="text"
                  value={editingZone.kind || editingZone.description || ""}
                  onChange={(e) => setEditingZone({ ...editingZone, kind: e.target.value, description: e.target.value })}
                  className="telemetry w-full rounded border border-input bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="telemetry text-xs text-muted-foreground block mb-2 font-semibold">Enforced PPE Safety Rules</label>
                <div className="grid gap-2 sm:grid-cols-2 max-h-48 overflow-y-auto pr-1">
                  {CONFIGURABLE_PPE.map((k) => (
                    <label
                      key={k}
                      className="flex cursor-pointer items-center justify-between gap-3 rounded border border-border bg-background/40 px-3 py-2 text-xs"
                    >
                      <span>{PPE_LABELS[k]}</span>
                      <input
                        type="checkbox"
                        checked={!!editingZone.required[k]}
                        onChange={(e) =>
                          setEditingZone({
                            ...editingZone,
                            required: { ...editingZone.required, [k]: e.target.checked },
                          })
                        }
                        className="rounded border-border bg-background text-primary focus:ring-primary size-4"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-border/80">
                <button
                  type="button"
                  onClick={() => setEditingZone(null)}
                  className="rounded border border-border px-4 py-2 text-xs text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEditZone}
                  className="flex items-center gap-1.5 rounded bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {submittingEditZone ? <Loader2 className="size-3.5 animate-spin" /> : null}
                  <span>{submittingEditZone ? "Saving..." : "Update Zone Rules"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Themed Confirm Modal for Deleting Zone */}
      <ConfirmModal
        isOpen={!!confirmDeleteZone}
        title={`Delete Zone: ${confirmDeleteZone ? zoneLabel(confirmDeleteZone.name || confirmDeleteZone.id) : ""}`}
        message={`Are you sure you want to delete safety zone '${confirmDeleteZone?.name || confirmDeleteZone?.id}'? This will purge its rules from MongoDB.`}
        confirmText="Delete Safety Zone"
        cancelText="Keep Zone"
        variant="danger"
        isLoading={deletingZoneId !== null}
        onConfirm={executeDeleteZone}
        onCancel={() => setConfirmDeleteZone(null)}
      />
    </AppShell>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground text-xs">{label}</span>
        <span className="telemetry text-xs text-primary">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-[var(--primary)]"
      />
    </label>
  );
}
