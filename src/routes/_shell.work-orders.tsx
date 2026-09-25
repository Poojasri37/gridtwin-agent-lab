import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/lib/meta";
import { Btn, PageHeader, StatusBadge } from "@/components/kit";
import { WO_STATUSES } from "@/lib/data";
import { useSim } from "@/lib/sim";
const actionFor: Record<string, string> = { Detected: "Diagnose", Diagnosis: "Approve", Approved: "Schedule", Scheduled: "Start Work", "In Progress": "Complete", Completed: "Verify" };

export const Route = createFileRoute("/_shell/work-orders")({
  head: () => pageMeta("Work Orders", "Work-order lifecycle from detection to verification with simulated transitions."),
  component: Page,
});

function Page() {
  const { workOrders, advanceWO, assignWO } = useSim();
  return (<div><PageHeader eyebrow="Execution" title="Work Orders" desc={`${workOrders.length} work orders · statuses: ${WO_STATUSES.join(" → ")}`} />
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{workOrders.map((w) => { const idx = WO_STATUSES.indexOf(w.status); return (
      <article key={w.id} className="glass p-4"><div className="flex items-center justify-between"><span className="font-mono text-sm text-primary">{w.id}</span><StatusBadge status={w.priority} /></div>
        <p className="mt-2 font-medium">{w.assetId} — {w.issue}</p><p className="text-xs text-muted-foreground">AI: {w.recommendation}</p>
        <p className="mt-2 text-xs"><span className="text-muted-foreground">Assigned:</span> {w.assigned} · <span className="text-muted-foreground">Scheduled:</span> {w.scheduled}</p>
        <div className="mt-3 flex gap-0.5">{WO_STATUSES.map((s, i) => <div key={s} title={s} className={"h-1.5 flex-1 rounded " + (i <= idx ? "bg-primary" : "bg-muted")} />)}</div>
        <p className="mt-1 text-[11px] text-muted-foreground">{w.status}</p>
        <div className="mt-3 flex flex-wrap gap-2">{actionFor[w.status] && <Btn className="px-2.5 py-1 text-xs" onClick={() => advanceWO(w.id)}>{actionFor[w.status]}</Btn>}
          {w.assigned === "Unassigned" && <Btn variant="outline" className="px-2.5 py-1 text-xs" onClick={() => assignWO(w.id, "Maintenance Team A")}>Assign Technician</Btn>}</div>
      </article>); })}</div></div>);
}
