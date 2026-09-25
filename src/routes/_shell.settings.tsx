import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/lib/meta";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Btn, PageHeader, Panel } from "@/components/kit";
import { useSim } from "@/lib/sim";

export const Route = createFileRoute("/_shell/settings")({
  head: () => pageMeta("Settings", "Configure simulation, thresholds and notification preferences."),
  component: Page,
});

function Page() {
  const { demoMode, setDemoMode, live, setLive } = useSim();
  const row = "flex items-center justify-between gap-4 border-t border-border py-3 text-sm first:border-0";
  return (<div className="max-w-2xl"><PageHeader eyebrow="Configuration" title="Settings" />
    <Panel title="Simulation"><div className={row}><span>Demo Simulation mode</span><Switch checked={demoMode} onCheckedChange={setDemoMode} aria-label="Demo mode" /></div><div className={row}><span>Live sensor stream</span><Switch checked={live} onCheckedChange={setLive} aria-label="Live stream" /></div></Panel>
    <Panel className="mt-4" title="Anomaly thresholds">{[["Temperature","85 °C"],["Vibration","5 mm/s"],["Load","90 %"],["Critical failure probability","20 %"]].map(([k,v]) => <div key={k} className={row}><span>{k}</span><span className="font-mono text-primary">{v}</span></div>)}
      <Btn className="mt-3" onClick={() => toast.success("Settings saved")}>Save</Btn></Panel></div>);
}
