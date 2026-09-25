import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/lib/meta";
import { PageHeader, Panel } from "@/components/kit";
const Box = ({ t, hi }: { t: string; hi?: boolean }) => <div className={"rounded-lg border px-4 py-2.5 text-center font-mono text-xs " + (hi ? "border-primary bg-primary/15 text-primary shadow-[0_0_24px_-8px_var(--primary)]" : "border-border bg-surface/60")}>{t}</div>;
const Arrow = () => <div className="mx-auto h-6 w-px bg-primary/50" />;

export const Route = createFileRoute("/_shell/architecture")({
  head: () => pageMeta("Architecture", "System architecture of the agentic predictive maintenance framework."),
  component: Page,
});

function Page() {
  return (<div><PageHeader eyebrow="System" title="Architecture" desc="How data flows from field sensors through the agentic engine back into the digital twin." />
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]"><Panel className="grid-bg"><div className="mx-auto max-w-md">
      <Box t="SENSOR DATA" /><Arrow /><Box t="DIGITAL TWIN" hi /><Arrow /><Box t="CONDITION MONITOR" /><Arrow /><Box t="AGENTIC ENGINE" hi /><Arrow />
      <div className="grid grid-cols-2 gap-3"><Box t="Diagnosis" /><Box t="Prognosis" /></div><Arrow /><Box t="Scheduling" /><Arrow /><Box t="Work Order" /><Arrow /><Box t="Verification" /><Arrow /><Box t="Digital Twin Update" hi />
    </div></Panel>
    <Panel title="Data sources"><div className="space-y-2">{[["SCADA","Real-time switching & measurements"],["Sensors","Thermal, vibration, DGA, PD"],["ERP","Spares, crews, costs"],["GIS","Asset locations & topology"],["Historical Data","Failures & maintenance records"]].map(([k,v]) => <div key={k} className="rounded-lg border border-border p-3"><p className="font-mono text-sm text-primary">{k}</p><p className="text-xs text-muted-foreground">{v}</p></div>)}</div></Panel></div></div>);
}
