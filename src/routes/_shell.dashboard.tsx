import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertOctagon, AlertTriangle, Boxes, CalendarClock, CheckCircle2, Clock4, Sparkles, TrendingDown } from "lucide-react";
import hero from "@/assets/transformer-hero.jpg";
import { Btn, Dot, KpiCard, Panel, SensorChart, AssetDrawer, StatusBadge } from "@/components/kit";
import { ActivityFeed, AgentWorkflow } from "@/components/agentic";
import { GridTopology } from "@/components/twin";
import { fleetKpis, getAsset } from "@/lib/data";
import { useSim, useLiveAsset } from "@/lib/sim";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => pageMeta("Command Center", "Power Grid Intelligence Center — live fleet health, agent activity and predicted failures."),
  component: Dashboard,
});

function Particles() {
  const ps = useMemo(() => Array.from({ length: 18 }, (_, i) => ({ l: (i * 53) % 100, d: 5 + (i % 5) * 1.5, delay: (i * 0.7) % 6, b: 20 + (i * 37) % 60 })), []);
  return <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>{ps.map((p, i) => <span key={i} className="particle absolute h-1 w-1 rounded-full bg-primary" style={{ left: `${p.l}%`, bottom: `${p.b - 20}%`, animationDuration: `${p.d}s`, animationDelay: `${p.delay}s`, boxShadow: "0 0 8px var(--primary)" }} />)}</div>;
}

function Dashboard() {
  const nav = useNavigate();
  const { runAnalysis, history, t104, alerts } = useSim();
  const [sel, setSel] = useState<string | null>(null);
  const live = useLiveAsset(sel ?? "");
  const nodeStatus = (id: string) => (id === "T-104" ? t104.status : getAsset(id)?.status ?? "Monitoring");
  const nodes = [
    { id: "SUB-A", label: "Substation Alpha", kind: "Substation", status: "Monitoring" as const, x: 400, y: 50 },
    { id: "T-104", label: "T-104", kind: "Transformer", status: nodeStatus("T-104"), x: 180, y: 150, parent: "SUB-A" },
    { id: "T-105", label: "T-105", kind: "Transformer", status: nodeStatus("T-105"), x: 400, y: 150, parent: "SUB-A" },
    { id: "T-108", label: "T-108", kind: "Transformer", status: nodeStatus("T-108"), x: 620, y: 150, parent: "SUB-A" },
    { id: "SG-201", label: "SG-201", kind: "Switchgear", status: nodeStatus("SG-201"), x: 110, y: 250, parent: "T-104" },
    { id: "SG-202", label: "SG-202", kind: "Switchgear", status: nodeStatus("SG-202"), x: 260, y: 250, parent: "T-104" },
    { id: "SG-203", label: "SG-203", kind: "Switchgear", status: nodeStatus("SG-203"), x: 400, y: 250, parent: "T-105" },
    { id: "SG-204", label: "SG-204", kind: "Switchgear", status: nodeStatus("SG-204"), x: 560, y: 250, parent: "T-108" },
    { id: "T-112", label: "T-112", kind: "Transformer", status: nodeStatus("T-112"), x: 700, y: 250, parent: "T-108" },
  ];
  const k = fleetKpis;
  return (
    <div className="space-y-6">
      <section className="relative -mx-4 -mt-4 overflow-hidden sm:-mx-6 sm:-mt-6">
        <img src={hero} alt="Engineer maintaining a high-voltage transformer in a substation" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--background)_0%,color-mix(in_oklab,var(--background)_85%,transparent)_35%,color-mix(in_oklab,var(--surface)_35%,transparent)_65%,color-mix(in_oklab,var(--surface)_85%,transparent)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
        <Particles />
        <div className="relative px-4 py-14 sm:px-8 md:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-success/40 bg-success/10 px-3 py-1 font-mono text-[11px] tracking-widest text-success"><Dot status="Healthy" /> GRID OPERATIONAL</span>
          <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">Power Grid Intelligence Center</h1>
          <p className="mt-2 text-lg text-primary sm:text-xl">Predict failures before they become outages.</p>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">Agentic AI continuously monitors transformer and switchgear health, reasons across sensor and operational data, and coordinates predictive maintenance actions.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Btn onClick={runAnalysis}><Sparkles className="h-4 w-4" /> Run AI Analysis</Btn>
            <Btn variant="outline" onClick={() => nav({ to: "/digital-twin" })}><Boxes className="h-4 w-4" /> Open Digital Twin</Btn>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        <KpiCard i={0} icon={Boxes} label="Total Assets" value={k.total} trend="+4 onboarded this month" />
        <KpiCard i={1} icon={CheckCircle2} label="Healthy" value={k.healthy} trend="75% of fleet" tone="success" />
        <KpiCard i={2} icon={AlertTriangle} label="Warning" value={k.warning} trend="+2 since yesterday" tone="warning" />
        <KpiCard i={3} icon={AlertOctagon} label="Critical" value={k.critical} trend="−1 since yesterday" tone="critical" />
        <KpiCard i={4} icon={TrendingDown} label="Predicted Failures" value={k.predicted} trend="next 90 days" tone="warning" />
        <KpiCard i={5} icon={CalendarClock} label="Maintenance Due" value={k.due} trend="6 this week" tone="info" />
        <KpiCard i={6} icon={Clock4} label="Downtime Avoided" value={<>{k.downtimeAvoided}<span className="text-sm text-muted-foreground"> hrs</span></>} trend="↑ 12% vs last quarter" tone="success" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Live Grid Health" subtitle="Click a node to open asset details"
          action={<div className="flex gap-3 text-[10px] text-muted-foreground">{["Healthy", "Warning", "Critical", "Monitoring"].map((s) => <span key={s} className="flex items-center gap-1"><Dot status={s} />{s}</span>)}</div>}>
          <GridTopology nodes={nodes} onSelect={(id) => id.startsWith("SUB") ? nav({ to: "/digital-twin" }) : setSel(id)} />
        </Panel>
        <Panel title="Agent Activity" subtitle="Autonomous reasoning log" action={<span className="flex items-center gap-1.5 font-mono text-[10px] text-critical"><Dot status="Critical" />LIVE</span>}>
          <ActivityFeed limit={8} className="max-h-[300px]" />
        </Panel>
      </div>

      <Panel title="Agentic Pipeline" subtitle="Sensor data → autonomous agents → maintenance work order"><AgentWorkflow /></Panel>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SensorChart data={history} k="temperature" label="T-104 Temperature" unit="°C" threshold={85} />
        <SensorChart data={history} k="vibration" label="T-104 Vibration" unit="mm/s" color="var(--chart-2)" threshold={5} />
        <SensorChart data={history} k="load" label="T-104 Load" unit="%" color="var(--chart-5)" threshold={90} />
        <Panel title="Recent Alerts">
          <ul className="space-y-2">{alerts.slice(0, 4).map((a) => <li key={a.id} className="text-xs"><div className="flex items-center gap-2"><StatusBadge status={a.severity} /><span className="font-mono text-muted-foreground">{a.time}</span></div><p className="mt-1 line-clamp-2">{a.description}</p></li>)}</ul>
        </Panel>
      </div>
      <AssetDrawer asset={live} onClose={() => setSel(null)} />
    </div>
  );
}
