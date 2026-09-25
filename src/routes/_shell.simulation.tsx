import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/lib/meta";
import { Play, RotateCcw } from "lucide-react";
import { Btn, HealthGauge, Metric, PageHeader, Panel, SensorChart } from "@/components/kit";
import { ActivityFeed, AgentWorkflow, SimulationTimeline } from "@/components/agentic";
import { useSim } from "@/lib/sim";

export const Route = createFileRoute("/_shell/simulation")({
  head: () => pageMeta("Simulation", "Run the end-to-end T-104 fault scenario and watch agents respond autonomously."),
  component: Page,
});

function Page() {
  const { startScenario, resetScenario, scenarioRunning, scenarioStep, history, t104 } = useSim();
  return (<div className="space-y-4"><PageHeader eyebrow="Simulation Engine — Demonstration Data" title="Fault Scenario: Transformer T-104" desc="Healthy → anomaly → agents diagnose, predict, schedule, verify → health restored."
    actions={<><Btn onClick={startScenario} disabled={scenarioRunning}><Play className="h-4 w-4" />Start Fault Scenario</Btn><Btn variant="ghost" onClick={resetScenario}><RotateCcw className="h-4 w-4" />Reset</Btn></>} />
    <Panel title="Agent pipeline"><AgentWorkflow /></Panel>
    <div className="grid gap-4 xl:grid-cols-[360px_1fr_340px]">
      <Panel title="Scenario timeline"><SimulationTimeline /></Panel>
      <div className="space-y-4"><Panel title="T-104 live state"><div className="flex flex-wrap items-center gap-6"><HealthGauge value={t104.health} size={130} />
        <div className="grid flex-1 grid-cols-2 gap-2"><Metric label="Failure Prob." value={t104.failureProbability} unit="%" /><Metric label="RUL" value={t104.rulDays} unit="d" /><Metric label="Status" value={t104.status} /><Metric label="Step" value={scenarioStep < 0 ? "Idle" : `${scenarioStep + 1}/12`} /></div></div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="rounded-lg border border-border p-3"><p className="text-muted-foreground">Failure probability</p><p className="font-mono">Before 8.2% → After anomaly <span className="text-warning">18.7%</span></p></div><div className="rounded-lg border border-border p-3"><p className="text-muted-foreground">Asset health</p><p className="font-mono">Before 91% → After <span className="text-warning">78%</span></p></div></div>
        <p className="mt-3 text-sm"><span className="text-muted-foreground">Recommended action:</span> Inspect cooling system.</p></Panel>
        <div className="grid gap-4 md:grid-cols-2"><SensorChart data={history} k="temperature" label="Temperature" unit="°C" threshold={85} /><SensorChart data={history} k="vibration" label="Vibration" unit="mm/s" color="var(--chart-2)" threshold={5} /></div></div>
      <Panel title="Agent execution log"><ActivityFeed limit={16} className="max-h-[640px]" /></Panel>
    </div></div>);
}
