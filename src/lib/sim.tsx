import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  getAsset, healthBreakdown, initialAlerts, initialWorkOrders, WO_STATUSES, statusFromRisk,
  type Alert, type AgentId, type Status, type WorkOrder,
} from "./data";

// Mock real-time engine — Simulation Engine, demonstration data only.
export interface SensorPoint {
  t: number; label: string; temperature: number; oilTemperature: number; vibration: number; humidity: number;
  load: number; voltage: number; current: number; partialDischarge: number; oilPressure: number;
}
export interface Activity { id: number; time: string; agent: string; text: string; level: "info" | "warn" | "crit" | "ok"; }
export interface AgentState { status: "Active" | "Processing" | "Idle"; task: string; confidence: number; lastAction: string; }

export const SCENARIO_STEPS = [
  { key: "healthy", title: "T-104 operating normally", agent: null, detail: "All sensors within baseline. Health 91%." },
  { key: "rise", title: "Temperature starts increasing", agent: null, detail: "Winding temperature climbing 1.8°C/min." },
  { key: "anomaly", title: "Sensor anomaly detected", agent: null, detail: "Temperature crossed 85°C threshold, vibration above 5 mm/s." },
  { key: "cm", title: "Condition Monitoring Agent activates", agent: "cm", detail: "Correlating thermal + vibration streams." },
  { key: "fd", title: "Diagnosis Agent investigates", agent: "fd", detail: "Cooling-system degradation identified (conf. 94.2%)." },
  { key: "pg", title: "Prognosis Agent estimates risk", agent: "pg", detail: "Failure probability 8.2% → 18.7%. RUL 142 days." },
  { key: "sc", title: "Scheduling Agent selects window", agent: "sc", detail: "Tomorrow 02:00–04:00 · lowest grid load." },
  { key: "wo", title: "Work order generated", agent: "dc", detail: "WO-2026-1057 · Inspect cooling system · HIGH." },
  { key: "tech", title: "Technician assigned", agent: "sc", detail: "Arun (Tech Lead) · spare fan motor reserved." },
  { key: "vf", title: "Verification completed", agent: "vf", detail: "Post-maintenance readings confirm fix." },
  { key: "twin", title: "Digital Twin updated", agent: "vf", detail: "Twin state synchronized with field data." },
  { key: "done", title: "Asset health improves", agent: null, detail: "Health 78% → 93%. Risk back to 5.1%." },
] as const;

const scenarioTargets: Record<number, { temperature: number; vibration: number; load: number }> = {
  0: { temperature: 72, vibration: 3.1, load: 70 }, 1: { temperature: 80, vibration: 3.7, load: 76 },
  2: { temperature: 88, vibration: 5.3, load: 84 }, 3: { temperature: 89, vibration: 5.4, load: 85 },
  4: { temperature: 89, vibration: 5.2, load: 84 }, 5: { temperature: 88, vibration: 5.1, load: 83 },
  6: { temperature: 87, vibration: 5.0, load: 80 }, 7: { temperature: 86, vibration: 4.9, load: 78 },
  8: { temperature: 84, vibration: 4.5, load: 72 }, 9: { temperature: 74, vibration: 3.2, load: 68 },
  10: { temperature: 71, vibration: 2.9, load: 67 }, 11: { temperature: 70, vibration: 2.8, load: 66 },
};

const defaultAgents: Record<AgentId, AgentState> = {
  cm: { status: "Active", task: "Streaming 128 assets", confidence: 94.2, lastAction: "Fleet scan complete" },
  fd: { status: "Idle", task: "Awaiting anomalies", confidence: 91.5, lastAction: "Diagnosed SG-203 contact erosion" },
  pg: { status: "Idle", task: "RUL model standby", confidence: 89.8, lastAction: "Updated RUL for 14 assets" },
  sc: { status: "Active", task: "Optimizing 7-day plan", confidence: 92.1, lastAction: "Placed T-108 emergency slot" },
  vf: { status: "Idle", task: "Awaiting completions", confidence: 96.4, lastAction: "Verified WO-2026-1046" },
  dc: { status: "Active", task: "Arbitrating priorities", confidence: 93.0, lastAction: "Approved 3 work orders" },
};

const agentName: Record<AgentId, string> = {
  cm: "Condition Monitoring Agent", fd: "Fault Diagnosis Agent", pg: "Prognosis Agent",
  sc: "Scheduling Agent", vf: "Verification Agent", dc: "Decision Agent",
};

const clockStr = () => new Date().toLocaleTimeString("en-GB", { hour12: false });

function seedHistory(): SensorPoint[] {
  return Array.from({ length: 30 }, (_, i) => {
    const w = Math.sin(i / 3);
    return {
      t: i, label: `${i}`, temperature: +(83 + w * 1.6 + i * 0.08).toFixed(1), oilTemperature: +(77 + w * 1.2).toFixed(1),
      vibration: +(4.3 + w * 0.2 + i * 0.015).toFixed(2), humidity: +(61 + w).toFixed(1), load: +(80 + w * 2).toFixed(1),
      voltage: +(230 + w * 1.5).toFixed(1), current: Math.round(405 + w * 8), partialDischarge: Math.round(42 + w * 6), oilPressure: +(1.42 + w * 0.02).toFixed(2),
    };
  });
}

const seedActivity: Activity[] = [
  { id: 5, time: "23:41:31", agent: "Verification Agent", text: "Checking technician availability and spare parts.", level: "info" },
  { id: 4, time: "23:41:24", agent: "Scheduling Agent", text: "Recommended maintenance window: Tomorrow 02:00–04:00.", level: "info" },
  { id: 3, time: "23:41:18", agent: "Prognosis Agent", text: "Estimated failure probability increased to 18.7%.", level: "warn" },
  { id: 2, time: "23:41:12", agent: "Fault Diagnosis Agent", text: "Possible cooling-system degradation identified.", level: "warn" },
  { id: 1, time: "23:41:08", agent: "Condition Monitoring Agent", text: "Detected abnormal temperature rise in T-104.", level: "crit" },
];

interface SimCtx {
  demoMode: boolean; setDemoMode: (v: boolean) => void;
  history: SensorPoint[]; latest: SensorPoint; live: boolean; setLive: (v: boolean) => void;
  t104: { health: number; failureProbability: number; status: Status; rulDays: number; breakdown: ReturnType<typeof healthBreakdown> };
  alerts: Alert[]; ackAlert: (id: string) => void; resolveAlert: (id: string) => void;
  workOrders: WorkOrder[]; advanceWO: (id: string) => void; assignWO: (id: string, who: string) => void;
  activity: Activity[]; agents: Record<AgentId, AgentState>; activeAgent: AgentId | null;
  scenarioStep: number; scenarioRunning: boolean; startScenario: () => void; resetScenario: () => void;
  runAnalysis: () => void; lastSync: string;
}
const Ctx = createContext<SimCtx | null>(null);
export const useSim = () => { const c = useContext(Ctx); if (!c) throw new Error("useSim outside provider"); return c; };

export function SimProvider({ children }: { children: ReactNode }) {
  const [demoMode, setDemoMode] = useState(true);
  const [live, setLive] = useState(true);
  const [history, setHistory] = useState<SensorPoint[]>(seedHistory);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders);
  const [activity, setActivity] = useState<Activity[]>(seedActivity);
  const [agents, setAgents] = useState(defaultAgents);
  const [activeAgent, setActiveAgent] = useState<AgentId | null>(null);
  const [scenarioStep, setScenarioStep] = useState(-1);
  const [scenarioRunning, setScenarioRunning] = useState(false);
  const [lastSync, setLastSync] = useState("--:--:--");
  const idRef = useRef(100);
  const anomalyRef = useRef(0);
  const lastAlertRef = useRef(0);

  const log = useCallback((agent: string, text: string, level: Activity["level"] = "info") => {
    setActivity((a) => [{ id: ++idRef.current, time: clockStr(), agent, text, level }, ...a].slice(0, 60));
  }, []);
  const pushAlert = useCallback((severity: Alert["severity"], description: string, recommendation: string) => {
    setAlerts((a) => [{ id: `AL-${4000 + idRef.current++}`, assetId: "T-104", severity, description, recommendation, time: clockStr(), status: "Open" as const }, ...a]);
  }, []);

  // Sensor tick
  useEffect(() => {
    setLastSync(clockStr());
    if (!live) return;
    const iv = setInterval(() => {
      setHistory((h) => {
        const prev = h[h.length - 1];
        const target = scenarioStep >= 0 ? scenarioTargets[scenarioStep] : null;
        if (!target) {
          if (anomalyRef.current === 0 && Math.random() < 0.07) anomalyRef.current = 6;
        }
        const ramp = anomalyRef.current > 0 ? 1 : 0;
        if (anomalyRef.current > 0) anomalyRef.current--;
        const n = (s: number) => (Math.random() - 0.5) * s;
        const tT = target?.temperature ?? (ramp ? prev.temperature + 1.4 : 83.5);
        const tV = target?.vibration ?? (ramp ? prev.vibration + 0.25 : 4.4);
        const tL = target?.load ?? (ramp ? Math.min(95, prev.load + 1.5) : 80);
        const temperature = +(prev.temperature + (tT - prev.temperature) * 0.35 + n(0.8)).toFixed(1);
        const vibration = +Math.max(1, prev.vibration + (tV - prev.vibration) * 0.35 + n(0.15)).toFixed(2);
        const load = +(prev.load + (tL - prev.load) * 0.35 + n(1.2)).toFixed(1);
        const p: SensorPoint = {
          t: prev.t + 1, label: `${prev.t + 1}`, temperature, vibration, load,
          oilTemperature: +(temperature - 6 + n(0.6)).toFixed(1), humidity: +(61 + n(2)).toFixed(1),
          voltage: +(230 + n(2.5)).toFixed(1), current: Math.round(load * 5 + n(10)),
          partialDischarge: Math.round(40 + Math.max(0, temperature - 80) * 4 + n(8)), oilPressure: +(1.42 + n(0.04)).toFixed(2),
        };
        return [...h.slice(-39), p];
      });
      setLastSync(clockStr());
    }, 3000);
    return () => clearInterval(iv);
  }, [live, scenarioStep]);

  const latest = history[history.length - 1];
  const t104 = useMemo(() => {
    const breakdown = healthBreakdown({ temperature: latest.temperature, vibration: latest.vibration, load: latest.load, age: 17, type: "Transformer" });
    const anomalies = (latest.temperature > 85 ? 1 : 0) + (latest.vibration > 5 ? 1 : 0) + (latest.load > 90 ? 1 : 0);
    const failureProbability = +Math.max(3, 4 + (100 - breakdown.overall) * 0.55 + (anomalies > 1 ? anomalies * 2.5 : 0)).toFixed(1);
    const health = breakdown.overall;
    return { health, failureProbability, breakdown, status: statusFromRisk(failureProbability, health), rulDays: Math.round(420 - failureProbability * 15) };
  }, [latest]);

  // Threshold alerts (free-running mode)
  useEffect(() => {
    if (scenarioStep >= 0) return;
    if (latest.t - lastAlertRef.current < 8) return;
    if (latest.temperature > 85 && latest.vibration > 5) {
      lastAlertRef.current = latest.t;
      pushAlert("Critical", `T-104 multiple anomalies: ${latest.temperature}°C, ${latest.vibration} mm/s.`, "Inspect cooling fan assembly and oil circulation.");
      log("Condition Monitoring Agent", `Multiple anomalies on T-104 (temp ${latest.temperature}°C, vib ${latest.vibration} mm/s).`, "crit");
      toast.error("Critical anomaly on T-104", { description: "Agents dispatched for diagnosis." });
    } else if (latest.temperature > 85) {
      lastAlertRef.current = latest.t;
      pushAlert("Warning", `T-104 temperature anomaly: ${latest.temperature}°C.`, "Monitor cooling stage.");
      log("Condition Monitoring Agent", `Temperature anomaly on T-104 (${latest.temperature}°C).`, "warn");
      toast.warning("Temperature anomaly on T-104");
    }
  }, [latest, scenarioStep, pushAlert, log]);

  // Background agent chatter
  useEffect(() => {
    const msgs: [string, string][] = [
      ["Condition Monitoring Agent", "Fleet scan: 128 assets nominal telemetry ingest."],
      ["Prognosis Agent", "RUL re-estimated for T-112: 190 days."],
      ["Scheduling Agent", "Re-balanced technician roster for next 48 h."],
      ["Decision Agent", "Approved deferral of SG-206 inspection (low risk)."],
      ["Verification Agent", "WO-2026-1046 closure data validated."],
      ["Fault Diagnosis Agent", "SG-204 PD signature classified: surface discharge."],
    ];
    let i = 0;
    const iv = setInterval(() => { if (scenarioStep < 0) { const [a, t] = msgs[i++ % msgs.length]; log(a, t); } }, 9000);
    return () => clearInterval(iv);
  }, [scenarioStep, log]);

  // Scenario runner
  useEffect(() => {
    if (!scenarioRunning || scenarioStep < 0) return;
    const step = SCENARIO_STEPS[scenarioStep];
    const ag = step.agent as AgentId | null;
    setActiveAgent(ag);
    if (ag) {
      setAgents((s) => ({ ...s, [ag]: { status: "Processing", task: "Transformer T-104", confidence: 90 + Math.round(Math.random() * 60) / 10, lastAction: step.detail } }));
      log(agentName[ag], step.detail, scenarioStep < 6 ? "warn" : "ok");
    } else log("Simulation Engine", `${step.title}. ${step.detail}`, scenarioStep === 2 ? "crit" : scenarioStep === 11 ? "ok" : "info");
    if (scenarioStep === 2) { pushAlert("Warning", "T-104 temperature crossed 85°C with elevated vibration.", "Agent pipeline engaged."); toast.warning("Anomaly detected on T-104"); }
    if (scenarioStep === 7) {
      setWorkOrders((w) => [{ id: "WO-2026-1057", assetId: "T-104", issue: "Cooling-system degradation", priority: "High", recommendation: "Inspect cooling fan assembly & oil circulation", assigned: "Unassigned", scheduled: "26 Sep 2026 02:00", status: "Approved" }, ...w.filter((x) => x.id !== "WO-2026-1057")]);
      toast.success("Work order WO-2026-1057 generated");
    }
    if (scenarioStep === 8) setWorkOrders((w) => w.map((x) => x.id === "WO-2026-1057" ? { ...x, assigned: "Arun (Tech Lead)", status: "Scheduled" } : x));
    if (scenarioStep === 9) setWorkOrders((w) => w.map((x) => x.id === "WO-2026-1057" ? { ...x, status: "Verified" } : x));
    if (scenarioStep === 11) toast.success("Scenario complete", { description: "T-104 health restored." });
    const to = setTimeout(() => {
      if (ag) setAgents((s) => ({ ...s, [ag]: { ...s[ag], status: "Active" } }));
      if (scenarioStep < SCENARIO_STEPS.length - 1) setScenarioStep((s) => s + 1);
      else { setScenarioRunning(false); setActiveAgent(null); }
    }, 3200);
    return () => clearTimeout(to);
  }, [scenarioStep, scenarioRunning, log, pushAlert]);

  const startScenario = useCallback(() => {
    setLive(true); setScenarioRunning(true); setScenarioStep(0);
    setHistory((h) => h.map((p) => ({ ...p, temperature: 72 + (p.t % 3) * 0.3, vibration: 3.1, load: 70 })));
    toast("Fault scenario started", { description: "Watch the agents respond to T-104." });
  }, []);
  const resetScenario = useCallback(() => { setScenarioRunning(false); setScenarioStep(-1); setActiveAgent(null); setAgents(defaultAgents); }, []);

  const runAnalysis = useCallback(() => {
    const seq: AgentId[] = ["cm", "fd", "pg", "sc", "vf", "dc"];
    const text: Record<AgentId, string> = {
      cm: "Scanned 128 assets · 3 anomalies flagged.", fd: "T-108 overheating, T-104 cooling degradation.",
      pg: "Top risk: T-108 31.4%, SG-203 21.3%, T-104 18.7%.", sc: "Optimal windows placed for 3 assets.",
      vf: "Spare parts & crews confirmed.", dc: "Analysis complete — 2 work orders recommended.",
    };
    toast("AI analysis running", { description: "Six agents coordinating across the fleet." });
    seq.forEach((id, i) => setTimeout(() => {
      setActiveAgent(id); log(agentName[id], text[id], i < 3 ? "warn" : "ok");
      if (i === seq.length - 1) { setTimeout(() => setActiveAgent(null), 1500); toast.success("AI analysis complete"); }
    }, i * 1100));
  }, [log]);

  const ackAlert = (id: string) => { setAlerts((a) => a.map((x) => x.id === id ? { ...x, status: "Acknowledged" } : x)); toast("Alert acknowledged"); };
  const resolveAlert = (id: string) => { setAlerts((a) => a.map((x) => x.id === id ? { ...x, status: "Resolved" } : x)); toast.success("Alert resolved"); };
  const advanceWO = (id: string) => setWorkOrders((w) => w.map((x) => {
    if (x.id !== id) return x;
    const i = WO_STATUSES.indexOf(x.status);
    const next = WO_STATUSES[Math.min(i + 1, WO_STATUSES.length - 1)];
    toast.success(`${x.id} → ${next}`);
    return { ...x, status: next };
  }));
  const assignWO = (id: string, who: string) => { setWorkOrders((w) => w.map((x) => x.id === id ? { ...x, assigned: who } : x)); toast(`Assigned to ${who}`); };

  const value: SimCtx = {
    demoMode, setDemoMode, history, latest, live, setLive, t104, alerts, ackAlert, resolveAlert,
    workOrders, advanceWO, assignWO, activity, agents, activeAgent, scenarioStep, scenarioRunning,
    startScenario, resetScenario, runAnalysis, lastSync,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// Returns asset with live T-104 overlay
export function useLiveAsset(id: string) {
  const { latest, t104 } = useSim();
  const a = getAsset(id);
  if (!a) return undefined;
  if (id !== "T-104") return a;
  return { ...a, temperature: latest.temperature, oilTemperature: latest.oilTemperature, vibration: latest.vibration, load: latest.load, current: latest.current, humidity: latest.humidity, voltage: latest.voltage, health: t104.health, failureProbability: t104.failureProbability, status: t104.status, rulDays: t104.rulDays };
}
