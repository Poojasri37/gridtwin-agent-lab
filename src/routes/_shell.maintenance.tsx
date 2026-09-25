import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/lib/meta";
import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { AssetDrawer, PageHeader, Panel, StatusBadge } from "@/components/kit";
import { assets, riskDistribution, schedule, technicians, type Asset } from "@/lib/data";
const days = ["Today","Tomorrow","Sun","Mon","Tue","Wed","Thu"];

export const Route = createFileRoute("/_shell/maintenance")({
  head: () => pageMeta("Predictive Maintenance", "Risk distribution, top maintenance candidates and AI-optimized scheduling."),
  component: Page,
});

function Page() {
  const [sel, setSel] = useState<Asset | null>(null);
  const top = [...assets].sort((a, b) => b.failureProbability - a.failureProbability).slice(0, 8);
  const risk = (p: number) => p > 20 ? "Critical" : p > 15 ? "High" : p > 10 ? "Medium" : "Low";
  return (<div className="space-y-4"><PageHeader eyebrow="Prognosis" title="Predictive Maintenance Intelligence" desc="Simulated predictions from synthetic data." />
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]"><Panel title="Risk Distribution"><div className="h-44"><ResponsiveContainer><PieChart><Pie data={riskDistribution} dataKey="value" innerRadius={45} outerRadius={70} stroke="none">{riskDistribution.map((r) => <Cell key={r.name} fill={r.color} />)}</Pie><Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} /></PieChart></ResponsiveContainer></div>
      <div className="grid grid-cols-2 gap-2 text-xs">{riskDistribution.map((r) => <div key={r.name} className="flex justify-between"><span style={{ color: r.color }}>{r.name}</span><span className="font-mono">{r.value}</span></div>)}</div></Panel>
    <Panel title="Top Maintenance Candidates" subtitle="Click a row for the AI explanation"><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-sm"><thead className="text-left text-xs text-muted-foreground"><tr>{["Asset","Failure Prob.","RUL","Risk","Predicted Fault","Recommended Action","Priority"].map((h) => <th key={h} className="pb-2 font-medium">{h}</th>)}</tr></thead>
      <tbody>{top.map((a) => <tr key={a.id} onClick={() => setSel(a)} className="cursor-pointer border-t border-border hover:bg-accent/40"><td className="py-2 font-mono text-primary">{a.id}</td><td className="font-mono">{a.failureProbability}%</td><td className="font-mono">{a.rulDays}d</td><td><StatusBadge status={risk(a.failureProbability)} /></td><td>{a.predictedFault}</td><td>{a.recommendedAction}</td><td><StatusBadge status={risk(a.failureProbability)} /></td></tr>)}</tbody></table></div></Panel></div>
    <Panel title="Maintenance Schedule — next 7 days" subtitle="Scheduling Agent balances asset risk, technician availability, duration, grid load, criticality and spare parts">
      <div className="overflow-x-auto"><div className="min-w-[760px]"><div className="grid grid-cols-[90px_repeat(7,1fr)] gap-1 text-xs text-muted-foreground"><span />{days.map((d) => <span key={d} className="text-center">{d}</span>)}</div>
      {technicians.map((t) => <div key={t.name} className="mt-1 grid grid-cols-[90px_repeat(7,1fr)] gap-1"><span className="py-2 text-xs">{t.name}</span>{days.map((_, d) => { const s = schedule.find((x) => x.tech === t.name && x.day === d); return <div key={d} className="min-h-12 rounded-md border border-border bg-surface/40 p-1">{s && <div className={"rounded p-1.5 text-[10px] " + (s.priority === "Critical" ? "bg-critical/20 text-critical" : s.priority === "High" ? "bg-warning/20 text-warning" : "bg-info/20 text-info")}><b className="font-mono">{s.assetId}</b> · {String(s.start).padStart(2,"0")}:00–{String(s.end).padStart(2,"0")}:00<br />{s.task}</div>}</div>; })}</div>)}</div></div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">{[["Asset risk","35%"],["Technician avail.","20%"],["Duration","10%"],["Grid load","15%"],["Criticality","12%"],["Spare parts","8%"]].map(([k,v]) => <div key={k} className="rounded-lg border border-border p-2 text-xs"><p className="text-muted-foreground">{k}</p><p className="font-mono text-primary">{v} weight</p></div>)}</div>
    </Panel><AssetDrawer asset={sel} onClose={() => setSel(null)} /></div>);
}
