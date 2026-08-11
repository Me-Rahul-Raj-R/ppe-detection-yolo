// EdgeVision industrial telemetry types and utility helpers.
// All runtime data is fetched from the backend API — no hardcoded mock arrays.

export type PpeKey =
  | "helmet"
  | "no-helmet"
  | "vest"
  | "no-vest"
  | "person"
  | "gloves"
  | "no-gloves"
  | "boots"
  | "no-boots"
  | "goggles"
  | "no-goggles"
  | "ear-mufs"
  | "face-guard"
  | "safety-suit"
  | "safety_belt"
  | "lanyard"
  | "hook"
  | "anchor_point"
  | "tool";

export const PPE_LABELS: Record<PpeKey, string> = {
  helmet: "Helmet",
  "no-helmet": "Missing Helmet",
  vest: "Reflective Vest",
  "no-vest": "Missing Vest",
  person: "Person",
  gloves: "Gloves",
  "no-gloves": "Missing Gloves",
  boots: "Safety Boots",
  "no-boots": "Missing Boots",
  goggles: "Safety Goggles",
  "no-goggles": "Missing Goggles",
  "ear-mufs": "Ear Muffs",
  "face-guard": "Face Guard",
  "safety-suit": "Safety Suit",
  safety_belt: "Safety Harness / Belt",
  lanyard: "Safety Lanyard",
  hook: "Safety Hook",
  anchor_point: "Anchor Point",
  tool: "Tool",
};

export type CameraStatus = "online" | "degraded" | "offline";

export type Camera = {
  id: string;
  name: string;
  zoneId: string;
  resolution: string;
  targetFps: number;
  actualFps: number;
  latencyMs: number;
  status: CameraStatus;
  streamUrl: string;
};

export type Zone = {
  id: string;
  name: string;
  kind?: string;
  description?: string;
  required: Record<PpeKey, boolean>;
  frameThreshold: number; // violation frames out of last 10
  dwellSeconds: number;
  confidence: number;
};

export type ViolationEvent = {
  id: string;
  cameraId: string;
  zoneId: string;
  workerId: string;
  type: string;
  detected: string[];
  missing: string[];
  confidence: number;
  timestamp: string;
  status: string;
  acknowledged: boolean;
  modelVersion: string;
  imagePath?: string;
  clip?: string;
};

export type Worker = {
  id: string;
  name: string;
  crew: string;
  shift: string;
  primaryZone: string;
  compliance: number;
  incidents: number;
  hoursTracked: number;
};

// ── Utility helpers ─────────────────────────────────────────────────────────

export const formatTime = (iso: string) => {
  if (!iso) return "—";
  try {
    let cleanStr = String(iso).trim();
    if (cleanStr.includes(" IST")) {
      cleanStr = cleanStr.replace(" IST", " GMT+0530");
    }
    const date = new Date(cleanStr);
    if (isNaN(date.getTime())) {
      return iso;
    }
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }) + " IST";
  } catch {
    return iso;
  }
};

/** Look up a PPE label with fallback to raw key */
export const ppeLabel = (key: string): string =>
  PPE_LABELS[key as PpeKey] || key.replace(/_/g, " ");

/** Look up a human-readable Zone name dynamically from database zones array or raw ID */
export const zoneLabel = (key: string, availableZones?: Array<{ id?: string; name?: string }>): string => {
  if (!key) return "General Plant Floor";
  const k = String(key).trim();

  if (Array.isArray(availableZones) && availableZones.length > 0) {
    const match = availableZones.find(
      (z) => z && (z.id === k || z.name?.toLowerCase() === k.toLowerCase() || z.id?.toLowerCase() === k.toLowerCase())
    );
    if (match && match.name) {
      return match.name;
    }
  }

  return k
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};
