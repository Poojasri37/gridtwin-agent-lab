import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/lib/meta";
import { useState } from "react";
import { Btn, PageHeader, StatusBadge, AssetDrawer } from "@/components/kit";
import { getAsset, type Asset } from "@/lib/data";
import { useSim } from "@/lib/sim";

export const Route = createFileRoute("/_shell/alerts")({
  head: () => pageMeta("Alert Center", "Critical, warning and info alerts with AI recommendations and acknowledgement."),
  component: Page,
});

function Page() {
  const { alerts, ackAlert, resolveAlert } = useSim(); const [f, setF] = useState("All"); const [sel, setSel] = useState<Asset | null>(null);
  const rows = alerts.filter((a) => f === "All" || a.severity === f);
  return (<div><PageHeader eyebrow="Operations" title="Alert Center" desc={`${alerts.filter((a) => a.status === "Open").length} open alerts`} actions={<>{["All","Critical","Warning","Info"].map((x) => <button key={x} onClick={() => setF(x)} className={"rounded-lg border px-3 py-1.5 text-xs " + (f === x ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground")}>{x}</button>)}</>} />
    <div className="space-y-2">{rows.map((a) => { const as = getAsset(a.assetId); return (
      <article key={a.id} className={"glass flex flex-col gap-3 p-4 md:flex-row md:items-center " + (a.status === "Resolved" ? "opacity-60" : "")}>
        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2 text-xs"><StatusBadge status={a.severity} /><span className="font-mono text-muted-foreground">{a.time}</span><span className="font-mono text-primary">{a.assetId}</span><span className="text-muted-foreground">· {a.status}</span></div>
          <p className="mt-1 text-sm">{a.description}</p><p className="text-xs text-muted-foreground">AI: {a.recommendation}</p></div>
        <div className="flex shrink-0 gap-2">{a.status === "Open" && <Btn variant="outline" className="px-2.5 py-1 text-xs" onClick={() => ackAlert(a.id)}>Acknowledge</Btn>}{a.status !== "Resolved" && <Btn className="px-2.5 py-1 text-xs" onClick={() => resolveAlert(a.id)}>Resolve</Btn>}{as && <Btn variant="ghost" className="px-2.5 py-1 text-xs" onClick={() => setSel(as)}>View Asset</Btn>}</div>
      </article>); })}</div><AssetDrawer asset={sel} onClose={() => setSel(null)} /></div>);
}
