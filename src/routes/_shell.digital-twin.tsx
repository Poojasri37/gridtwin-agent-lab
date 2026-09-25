import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AIExplanation, Btn, HealthBreakdown, HealthGauge, Metric, Panel, StatusBadge } from "@/components/kit";
import { DigitalTwin, type TwinPart } from "@/components/twin";
import { getAsset, type Asset } from "@/lib/data";
import { useLiveAsset, useSim } from "@/lib/sim";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/_shell/digital-twin")({
  head: () => pageMeta("Digital Twin", "Interactive digital twin of Substation Alpha with live transformer and switchgear condition."),
  component: TwinPage,
});

const auxiliary: Record<string, Partial<Asset> & { label: string }> = {
  cooling: { label: "Cooling System", type: "Transformer", model: "ONAF fan bank · 4 fans", temperature: 58.4, load: 76, vibration: 5.1, health: 71, failureProbability: 16.2, rulDays: 120, predictedFault: "Fan bearing wear", recommendedAction: "Inspect cooling fan assembly" },
  oil: { label: "Oil Tank", type: "Transformer", model: "Conservator 12,000 L", temperature: 79.1, load: 0, vibration: 0.8, health: 86, failureProbability: 6.4, rulDays: 540, predictedFault: "Moisture ingress", recommendedAction: "Perform DGA oil sampling" },
  "feeder-in": { label: "Incoming Feeder", type: "Substation", model: "132 kV overhead line", temperature: 41, load: 78, vibration: 0.4, health: 94, failureProbability: 2.1, rulDays: 2400, predictedFault: "None", recommendedAction: "Routine patrol" },
  "feeder-out": { label: "Outgoing Feeder", type: "Substation", model: "33 kV cable feeder", temperature: 44, load: 74, vibration: 0.3, health: 92, failureProbability: 2.8, rulDays: 2100, predictedFault: "None", recommendedAction: "Routine patrol" },
};

function TwinPage() {
  const [sel, setSel] = useState("T-104");
  const { t104 } = useSim();
  const t104Live = useLiveAsset("T-104")!;
  const base = getAsset("T-104")!;
  const resolve = (id: string): Asset => {
    if (id === "T-104") return t104Live;
    const g = getAsset(id);
    if (g) return g;
    const a = auxiliary[id];
    return { ...base, ...a, id: a.label, name: a.label, location: "Substation Alpha", status: a.health! >= 82 ? "Healthy" : "Warning" } as Asset;
  };
  const ids = ["T-104", "T-105", "SG-201", "SG-202", "cooling", "oil", "feeder-in", "feeder-out"];
  const parts: Record<string, TwinPart> = Object.fromEntries(ids.map((id) => { const a = resolve(id); return [id, { id, label: id.startsWith("T-") || id.startsWith("SG") ? id : auxiliary[id].label, status: id === "T-104" ? t104.status : a.status }]; }));
  const a = resolve(sel);
  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div><p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">Digital Twin</p><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Digital Twin — Substation Alpha</h1><p className="text-sm text-muted-foreground">Click any component to inspect its live twin state.</p></div>
        <Btn variant="outline" onClick={() => toast.success("Digital Twin synchronized", { description: "8 components · 42 sensor channels" })}><RefreshCw className="h-4 w-4" /> Sync twin</Btn>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Panel className="grid-bg p-2 sm:p-4"><DigitalTwin parts={parts} selected={sel} onSelect={setSel} /></Panel>
        <Panel title={<span className="font-mono uppercase">{a.name}</span>} subtitle={`${a.model} · age ${a.age} yr`} action={<StatusBadge status={a.status} />}>
          <div className="flex items-center gap-4">
            <HealthGauge value={a.health} size={110} />
            <div className="grid flex-1 grid-cols-1 gap-2">
              <Metric label="Remaining Useful Life" value={a.rulDays} unit="days" />
              <Metric label="Failure Probability" value={a.failureProbability} unit="%" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Metric label="Temp" value={a.temperature} unit="°C" /><Metric label="Oil Temp" value={a.oilTemperature || "—"} unit="°C" /><Metric label="Load" value={a.load} unit="%" />
            <Metric label="Vibration" value={a.vibration} unit="mm/s" /><Metric label="Humidity" value={a.humidity} unit="%" /><Metric label="Voltage" value={a.voltage} unit="kV" />
          </div>
          <div className="mt-4"><HealthBreakdown asset={a} /></div>
        </Panel>
      </div>
      <Panel className="mt-4" title="Why did the AI flag this component?"><AIExplanation asset={a} /></Panel>
    </div>
  );
}
