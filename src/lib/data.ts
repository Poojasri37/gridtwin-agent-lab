// Synthetic demonstration data. No real infrastructure.
export type Status = "Healthy" | "Warning" | "Critical" | "Monitoring";
export type AssetType = "Transformer" | "Switchgear" | "Substation";

export interface Asset {
  id: string; name: string; type: AssetType; model: string; location: string;
  age: number; health: number; temperature: number; oilTemperature: number;
  vibration: number; humidity: number; load: number; voltage: number; current: number;
  rulDays: number; failureProbability: number; status: Status; lastInspection: string;
  predictedFault: string; recommendedAction: string; lat: number; lng: number;
}

// Deterministic PRNG so server & client render identical data.
function rng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}
const r = rng(42);
const round = (n: number, d = 1) => Math.round(n * 10 ** d) / 10 ** d;

export const substations = [
  { id: "SUB-A", name: "Substation Alpha", lat: 11.02, lng: 78.02 },
  { id: "SUB-B", name: "Substation Beta", lat: 11.11, lng: 78.18 },
  { id: "SUB-C", name: "Substation Gamma", lat: 10.93, lng: 78.21 },
  { id: "SUB-D", name: "Substation Delta", lat: 10.88, lng: 77.95 },
  { id: "SUB-E", name: "Substation Epsilon", lat: 11.16, lng: 77.97 },
  { id: "SUB-F", name: "Substation Zeta", lat: 10.99, lng: 78.33 },
];

export function statusFromRisk(fp: number, health: number): Status {
  if (fp > 20 || health < 60) return "Critical";
  if (fp > 10 || health < 82) return "Warning";
  return "Healthy";
}

const faults = [
  ["Cooling degradation", "Inspect cooling system"],
  ["Overheating", "Immediate inspection"],
  ["Insulation degradation", "Schedule insulation test"],
  ["Oil contamination", "Perform DGA oil sampling"],
  ["Bushing wear", "Inspect bushings"],
  ["Contact erosion", "Inspect breaker contacts"],
  ["SF6 pressure loss", "Check SF6 gas density"],
  ["Partial discharge", "Run PD diagnostics"],
];

const overrides: Record<string, Partial<Asset>> = {
  "T-104": { age: 17, health: 78, temperature: 87.4, oilTemperature: 81.2, vibration: 4.8, humidity: 62, load: 82.6, voltage: 230, current: 412, rulDays: 142, failureProbability: 18.7, predictedFault: "Cooling degradation", recommendedAction: "Inspect cooling system" },
  "T-108": { age: 24, health: 58, temperature: 96.2, oilTemperature: 90.4, vibration: 5.6, load: 93.1, rulDays: 74, failureProbability: 31.4, predictedFault: "Overheating", recommendedAction: "Immediate inspection" },
  "T-112": { age: 14, health: 81, temperature: 79.8, vibration: 3.9, load: 77.2, rulDays: 190, failureProbability: 14.2, predictedFault: "Insulation degradation", recommendedAction: "Schedule inspection" },
  "SG-203": { health: 66, failureProbability: 21.3, rulDays: 96, predictedFault: "Contact erosion", recommendedAction: "Overdue maintenance — inspect contacts" },
};

function makeAsset(id: string, type: AssetType, i: number): Asset {
  const sub = substations[i % substations.length];
  const isT = type === "Transformer";
  const fp = round(2 + r() * 12);
  const health = Math.round(96 - fp * 1.6 - r() * 6);
  const f = faults[Math.floor(r() * faults.length)];
  const base: Asset = {
    id, type, name: `${type} ${id}`, model: isT ? "Power Transformer 100 MVA" : "GIS Switchgear 33 kV",
    location: sub.name, age: Math.round(4 + r() * 22), health,
    temperature: round(isT ? 62 + r() * 18 : 38 + r() * 14), oilTemperature: round(isT ? 55 + r() * 18 : 0),
    vibration: round(isT ? 2 + r() * 2.2 : 1 + r() * 1.5), humidity: Math.round(45 + r() * 20),
    load: round(55 + r() * 28), voltage: isT ? 230 : 33, current: Math.round(isT ? 300 + r() * 120 : 600 + r() * 300),
    rulDays: Math.round(200 + (100 - fp * 5) * 4 + r() * 200), failureProbability: fp, status: "Healthy",
    lastInspection: `2026-0${1 + Math.floor(r() * 8)}-${String(1 + Math.floor(r() * 27)).padStart(2, "0")}`,
    predictedFault: f[0], recommendedAction: f[1],
    lat: round(sub.lat + (r() - 0.5) * 0.08, 4), lng: round(sub.lng + (r() - 0.5) * 0.08, 4),
  };
  const a = { ...base, ...overrides[id] };
  if (id === "T-104" || id === "T-105") a.location = "Substation Alpha";
  a.status = statusFromRisk(a.failureProbability, a.health);
  return a;
}

export const transformers = Array.from({ length: 15 }, (_, i) => makeAsset(`T-${101 + i}`, "Transformer", i));
export const switchgears = Array.from({ length: 10 }, (_, i) => makeAsset(`SG-${201 + i}`, "Switchgear", i + 3));
export const assets: Asset[] = [...transformers, ...switchgears];
export const getAsset = (id: string) => assets.find((a) => a.id === id);

export const fleetKpis = { total: 128, healthy: 96, warning: 21, critical: 11, predicted: 7, due: 14, downtimeAvoided: 38.5 };
export const riskDistribution = [
  { name: "Critical", value: 11, color: "var(--critical)" },
  { name: "High", value: 21, color: "var(--warning)" },
  { name: "Medium", value: 38, color: "var(--info)" },
  { name: "Low", value: 58, color: "var(--success)" },
];

// Health score formula — transparent mock model
export function healthBreakdown(a: Pick<Asset, "temperature" | "vibration" | "load" | "age" | "type">) {
  const c = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
  const isT = a.type === "Transformer";
  const temperature = c(isT ? 100 - Math.max(0, a.temperature - 65) * 0.8 : 100 - Math.max(0, a.temperature - 35) * 1.2);
  const vibration = c(100 - Math.max(0, a.vibration - 2) * 10);
  const load = c(100 - Math.max(0, a.load - 60) * 0.7);
  const oil = c(96 - a.age * 0.4);
  const maintenance = c(92 - a.age * 0.9);
  const overall = c(temperature * 0.3 + vibration * 0.2 + load * 0.2 + oil * 0.15 + maintenance * 0.15);
  return { temperature, vibration, load, oil, maintenance, overall };
}

export type AlertSeverity = "Critical" | "Warning" | "Info";
export interface Alert { id: string; time: string; assetId: string; severity: AlertSeverity; description: string; recommendation: string; status: "Open" | "Acknowledged" | "Resolved"; }

const alertSeeds: [string, AlertSeverity, string, string][] = [
  ["T-108", "Critical", "Transformer T-108 temperature exceeded safe threshold (96.2°C).", "Reduce load by 15% and dispatch inspection crew."],
  ["T-104", "Warning", "Transformer T-104 vibration trending upward (4.8 mm/s).", "Inspect cooling fan assembly within 24 h."],
  ["SG-203", "Warning", "Switchgear SG-203 maintenance overdue by 21 days.", "Schedule contact inspection this week."],
  ["SUB-A", "Info", "Digital Twin synchronized successfully.", "No action required."],
  ["T-104", "Warning", "Oil temperature above seasonal baseline (+9%).", "Verify oil circulation pump."],
  ["T-112", "Warning", "Insulation power factor drifting.", "Schedule insulation resistance test."],
  ["SG-206", "Info", "Firmware update applied to protection relay.", "Verify relay settings."],
  ["T-108", "Critical", "Load exceeded 93% for 40 minutes.", "Transfer load to T-109 feeder."],
  ["T-110", "Info", "Routine DGA sample within limits.", "No action required."],
  ["SG-201", "Warning", "SF6 density trending low.", "Check for gas leaks at next window."],
  ["T-115", "Info", "Sensor calibration completed.", "No action required."],
  ["T-103", "Warning", "Humidity spike in control cabinet.", "Inspect cabinet heater and seals."],
  ["SUB-C", "Info", "SCADA link latency normalized.", "No action required."],
  ["T-108", "Critical", "Hot-spot estimate reached 112°C.", "Immediate inspection required."],
  ["SG-209", "Warning", "Breaker operation count nearing limit.", "Plan mechanism overhaul."],
  ["T-106", "Info", "Cooling fans switched to stage 2.", "Monitor temperature trend."],
  ["T-101", "Info", "Health score recalculated: 89%.", "No action required."],
  ["SG-204", "Warning", "Partial discharge activity detected (120 pC).", "Run PD diagnostics."],
  ["T-113", "Info", "Tap changer operation logged.", "No action required."],
  ["SUB-B", "Info", "Agent pipeline completed daily fleet scan.", "Review summary report."],
];
export const initialAlerts: Alert[] = alertSeeds.map(([assetId, severity, description, recommendation], i) => ({
  id: `AL-${3100 + i}`, assetId, severity, description, recommendation,
  time: `25 Sep ${String(23 - Math.floor(i / 2)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`,
  status: i > 14 ? "Resolved" : i > 10 ? "Acknowledged" : "Open",
}));

export const WO_STATUSES = ["Detected", "Diagnosis", "Approved", "Scheduled", "In Progress", "Completed", "Verified"] as const;
export type WOStatus = (typeof WO_STATUSES)[number];
export interface WorkOrder { id: string; assetId: string; issue: string; priority: "Critical" | "High" | "Medium" | "Low"; recommendation: string; assigned: string; scheduled: string; status: WOStatus; }
const woSeeds: [string, string, WorkOrder["priority"], string][] = [
  ["T-104", "Abnormal thermal pattern", "High", "Inspect cooling system"],
  ["T-108", "Sustained overheating", "Critical", "Immediate inspection & load transfer"],
  ["T-112", "Insulation degradation", "Medium", "Schedule insulation test"],
  ["SG-203", "Overdue maintenance", "High", "Inspect breaker contacts"],
  ["SG-201", "SF6 density low", "Medium", "Check gas density & seals"],
  ["T-103", "Cabinet humidity", "Low", "Replace cabinet heater"],
  ["SG-204", "Partial discharge", "High", "Run PD diagnostics"],
  ["T-106", "Fan stage anomaly", "Medium", "Service cooling fans"],
  ["T-110", "Routine DGA", "Low", "Oil sampling"],
  ["SG-209", "Breaker wear", "Medium", "Mechanism overhaul"],
  ["T-115", "Bushing wear", "Medium", "Inspect bushings"],
  ["T-101", "Annual inspection", "Low", "Visual & thermographic inspection"],
  ["SG-206", "Relay verification", "Low", "Verify protection settings"],
  ["T-109", "Load imbalance", "Medium", "Rebalance feeders"],
  ["T-113", "Tap changer wear", "Medium", "Service OLTC"],
];
const teams = ["Maintenance Team A", "Maintenance Team B", "Arun (Tech Lead)", "Priya (HV Specialist)", "Karthik (Relay Eng.)"];
export const initialWorkOrders: WorkOrder[] = woSeeds.map(([assetId, issue, priority, recommendation], i) => ({
  id: `WO-2026-${1042 + i}`, assetId, issue, priority, recommendation,
  assigned: i % 3 === 2 ? "Unassigned" : teams[i % teams.length],
  scheduled: `${25 + (i % 5)} Sep 2026 ${String((2 + i * 3) % 24).padStart(2, "0")}:00`,
  status: WO_STATUSES[i % 7],
}));

export const maintenanceRecords = Array.from({ length: 20 }, (_, i) => ({
  id: `MR-${800 + i}`, assetId: assets[(i * 3) % assets.length].id,
  date: `2026-0${1 + (i % 8)}-${String(3 + i).padStart(2, "0")}`,
  type: ["Inspection", "Oil sampling", "Repair", "Thermography", "Overhaul"][i % 5],
  cost: 18000 + ((i * 7919) % 90000), technician: teams[i % teams.length],
}));

export const schedule = [
  { assetId: "T-104", task: "Cooling System Inspection", day: 1, start: 2, end: 4, tech: "Arun", priority: "High", status: "Scheduled" },
  { assetId: "T-108", task: "Emergency Thermal Inspection", day: 0, start: 22, end: 24, tech: "Priya", priority: "Critical", status: "In Progress" },
  { assetId: "SG-203", task: "Breaker Contact Service", day: 2, start: 1, end: 5, tech: "Karthik", priority: "High", status: "Scheduled" },
  { assetId: "T-112", task: "Insulation Resistance Test", day: 3, start: 3, end: 6, tech: "Arun", priority: "Medium", status: "Planned" },
  { assetId: "SG-204", task: "PD Diagnostics", day: 4, start: 0, end: 3, tech: "Priya", priority: "High", status: "Planned" },
  { assetId: "T-106", task: "Fan Servicing", day: 5, start: 2, end: 4, tech: "Meena", priority: "Medium", status: "Planned" },
  { assetId: "SG-201", task: "SF6 Leak Check", day: 6, start: 1, end: 3, tech: "Karthik", priority: "Medium", status: "Planned" },
];
export const technicians = [
  { name: "Arun", skill: "Transformers", available: 82 },
  { name: "Priya", skill: "HV Diagnostics", available: 64 },
  { name: "Karthik", skill: "Switchgear / Relays", available: 71 },
  { name: "Meena", skill: "Cooling Systems", available: 90 },
];

export const agentDefs = [
  { id: "cm", name: "Condition Monitoring Agent", short: "Monitor" },
  { id: "fd", name: "Fault Diagnosis Agent", short: "Diagnosis" },
  { id: "pg", name: "Prognosis Agent", short: "Prognosis" },
  { id: "sc", name: "Scheduling Agent", short: "Scheduling" },
  { id: "vf", name: "Verification Agent", short: "Verification" },
  { id: "dc", name: "Decision Agent", short: "Decision" },
] as const;
export type AgentId = (typeof agentDefs)[number]["id"];

// Analytics series (deterministic)
const ar = rng(7);
export function analyticsSeries(points: number) {
  return Array.from({ length: points }, (_, i) => ({
    label: `${i + 1}`,
    failureProb: round(12 - i * (6 / points) + ar() * 2),
    cost: Math.round(84 - i * (32 / points) + ar() * 6),
    downtime: round(Math.max(1, 9 - i * (6 / points) + ar() * 2)),
    accuracy: round(86 + i * (8 / points) + ar() * 2),
    response: round(Math.max(2, 14 - i * (8 / points) + ar() * 2)),
    reliability: round(94 + i * (4 / points) + ar()),
  }));
}
export const rulDistribution = [
  { bucket: "<90d", count: 6 }, { bucket: "90–180", count: 14 }, { bucket: "180–365", count: 31 },
  { bucket: "1–2y", count: 42 }, { bucket: "2–5y", count: 27 }, { bucket: ">5y", count: 8 },
];
