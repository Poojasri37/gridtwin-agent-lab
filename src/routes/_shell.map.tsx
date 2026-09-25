import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/lib/meta";
import { lazy, Suspense, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { PageHeader } from "@/components/kit";
const GridMap = lazy(() => import("@/components/GridMap"));

export const Route = createFileRoute("/_shell/map")({
  head: () => pageMeta("GIS Grid Map", "Fictional GIS view of substations, transformers, switchgears and transmission lines."),
  component: Page,
});

function Page() {
  const [f, setF] = useState("All");
  const fb = <div className="grid h-full place-items-center text-sm text-muted-foreground">Loading map…</div>;
  return (<div><PageHeader eyebrow="Geospatial" title="GIS Grid Map" desc="Fictional region and synthetic coordinates — no real infrastructure."
    actions={<>{["All","Substation","Transformer","Switchgear","Critical","Warning"].map((x) => <button key={x} onClick={() => setF(x)} className={"rounded-lg border px-3 py-1.5 text-xs " + (f === x ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground")}>{x}</button>)}</>} />
    <div className="glass h-[70vh] overflow-hidden p-1"><ClientOnly fallback={fb}><Suspense fallback={fb}><GridMap filter={f} /></Suspense></ClientOnly></div></div>);
}
