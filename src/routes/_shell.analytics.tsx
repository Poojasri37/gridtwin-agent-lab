import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/lib/meta";
import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Pie, PieChart, Cell } from "recharts";
import { PageHeader, Panel } from "@/components/kit";
import { analyticsSeries, riskDistribution, rulDistribution } from "@/lib/data";
const ranges = { "24 Hours": 24, "7 Days": 7, "30 Days": 30, "90 Days": 12 } as const;
const tt = { contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", fontSize: 12 } };
const ax = { tick: { fill: "var(--muted-foreground)", fontSize: 10 }, axisLine: false, tickLine: false };
function C({ title, children }: { title: string; children: React.ReactElement }) { return <Panel title={title}><div className="h-48"><ResponsiveContainer>{children}</ResponsiveContainer></div></Panel>; }

export const Route = createFileRoute("/_shell/analytics")({
  head: () => pageMeta("Analytics", "Fleet analytics: failure trend, cost, downtime, accuracy and impact of agentic AI."),
  component: Page,
});

function Page() {
  const [r, setR] = useState<keyof typeof ranges>("30 Days"); const d = analyticsSeries(ranges[r]);
  return (<div className="space-y-4"><PageHeader eyebrow="Insights" title="Analytics" desc="Synthetic analytics data." actions={<>{Object.keys(ranges).map((k) => <button key={k} onClick={() => setR(k as keyof typeof ranges)} className={"rounded-lg border px-3 py-1.5 text-xs " + (r === k ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground")}>{k}</button>)}</>} />
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <C title="Asset Health Distribution"><PieChart><Pie data={riskDistribution} dataKey="value" innerRadius={40} outerRadius={70} stroke="none">{riskDistribution.map((x) => <Cell key={x.name} fill={x.color} />)}</Pie><Tooltip {...tt} /></PieChart></C>
      <C title="Failure Probability Trend (%)"><AreaChart data={d}><XAxis dataKey="label" {...ax} /><YAxis {...ax} /><Tooltip {...tt} /><Area dataKey="failureProb" stroke="var(--chart-4)" fill="var(--chart-4)" fillOpacity={0.2} /></AreaChart></C>
      <C title="Maintenance Cost (₹k)"><BarChart data={d}><XAxis dataKey="label" {...ax} /><YAxis {...ax} /><Tooltip {...tt} /><Bar dataKey="cost" fill="var(--chart-1)" radius={3} /></BarChart></C>
      <C title="Unplanned Downtime (hrs)"><BarChart data={d}><XAxis dataKey="label" {...ax} /><YAxis {...ax} /><Tooltip {...tt} /><Bar dataKey="downtime" fill="var(--chart-2)" radius={3} /></BarChart></C>
      <C title="Prediction Accuracy (%)"><LineChart data={d}><XAxis dataKey="label" {...ax} /><YAxis domain={[80, 100]} {...ax} /><Tooltip {...tt} /><Line dataKey="accuracy" stroke="var(--chart-3)" dot={false} strokeWidth={2} /></LineChart></C>
      <C title="Response Time (hrs)"><LineChart data={d}><XAxis dataKey="label" {...ax} /><YAxis {...ax} /><Tooltip {...tt} /><Line dataKey="response" stroke="var(--chart-5)" dot={false} strokeWidth={2} /></LineChart></C>
      <C title="Asset Reliability (%)"><AreaChart data={d}><XAxis dataKey="label" {...ax} /><YAxis domain={[90, 100]} {...ax} /><Tooltip {...tt} /><Area dataKey="reliability" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.2} /></AreaChart></C>
      <C title="RUL Distribution"><BarChart data={rulDistribution}><XAxis dataKey="bucket" {...ax} /><YAxis {...ax} /><Tooltip {...tt} /><Bar dataKey="count" fill="var(--chart-5)" radius={3} /></BarChart></C>
    </div>
    <Panel title="Impact Simulation" subtitle="Before vs after agentic predictive maintenance (synthetic)"><div className="grid gap-3 sm:grid-cols-3">{[["Unplanned failures","18","6"],["Downtime","76 hrs","37.5 hrs"],["Maintenance cost","₹8.4L","₹5.1L"]].map(([k,b,a]) => <div key={k} className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">{k}</p><p className="mt-1 font-mono"><span className="text-critical line-through opacity-70">{b}</span> → <span className="text-xl text-success">{a}</span></p></div>)}</div></Panel></div>);
}
