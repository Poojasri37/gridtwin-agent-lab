import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/lib/meta";
import { useState } from "react";
import { AssetDrawer, PageHeader, Panel, StatusBadge } from "@/components/kit";
import { assets, type Asset } from "@/lib/data";

export const Route = createFileRoute("/_shell/assets")({
  head: () => pageMeta("Asset Intelligence", "Searchable fleet table of transformers and switchgears with health, RUL and risk."),
  component: Page,
});

function Page() {
  const [q, setQ] = useState(""); const [st, setSt] = useState("All"); const [ty, setTy] = useState("All");
  const [sort, setSort] = useState<keyof Asset>("failureProbability"); const [sel, setSel] = useState<Asset | null>(null);
  const rows = assets.filter((a) => (st === "All" || a.status === st) && (ty === "All" || a.type === ty) && (a.id + a.location).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (b[sort] as number) > (a[sort] as number) ? 1 : -1);
  const sel_ = "rounded-lg border border-input bg-surface/60 px-3 py-1.5 text-sm";
  return (<div><PageHeader eyebrow="Fleet" title="Asset Intelligence" desc="25 monitored assets across 6 substations." />
    <Panel><div className="mb-4 flex flex-wrap gap-2">
      <input aria-label="Search" placeholder="Search ID or location" value={q} onChange={(e) => setQ(e.target.value)} className={sel_} />
      <select aria-label="Status" value={st} onChange={(e) => setSt(e.target.value)} className={sel_}>{["All","Healthy","Warning","Critical"].map((s) => <option key={s}>{s}</option>)}</select>
      <select aria-label="Type" value={ty} onChange={(e) => setTy(e.target.value)} className={sel_}>{["All","Transformer","Switchgear"].map((s) => <option key={s}>{s}</option>)}</select>
      <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as keyof Asset)} className={sel_}><option value="failureProbability">Sort: Risk</option><option value="health">Sort: Health</option><option value="age">Sort: Age</option><option value="temperature">Sort: Temperature</option></select>
    </div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-sm"><thead className="text-left text-xs text-muted-foreground"><tr>{["Asset ID","Type","Location","Age","Health","Temp","Load","RUL","Risk","Last Inspection","Status"].map((h) => <th key={h} className="pb-2 font-medium">{h}</th>)}</tr></thead>
    <tbody>{rows.map((a) => <tr key={a.id} tabIndex={0} onClick={() => setSel(a)} onKeyDown={(e) => e.key === "Enter" && setSel(a)} className="cursor-pointer border-t border-border hover:bg-accent/40">
      <td className="py-2 font-mono text-primary">{a.id}</td><td>{a.type}</td><td>{a.location}</td><td>{a.age}y</td><td className="font-mono">{a.health}%</td><td className="font-mono">{a.temperature}°C</td><td className="font-mono">{a.load}%</td><td className="font-mono">{a.rulDays}d</td><td className="font-mono">{a.failureProbability}%</td><td>{a.lastInspection}</td><td><StatusBadge status={a.status} /></td></tr>)}
      {rows.length === 0 && <tr><td colSpan={11} className="py-8 text-center text-muted-foreground">No assets match these filters.</td></tr>}</tbody></table></div></Panel>
    <AssetDrawer asset={sel} onClose={() => setSel(null)} /></div>);
}
