import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/lib/meta";
import { Sparkles } from "lucide-react";
import { Btn, PageHeader, Panel } from "@/components/kit";
import { ActivityFeed, AgentCard, AgentWorkflow } from "@/components/agentic";
import { agentDefs } from "@/lib/data";
import { useSim } from "@/lib/sim";

export const Route = createFileRoute("/_shell/agents")({
  head: () => pageMeta("AI Agents", "Agentic AI operations: six autonomous agents coordinating predictive maintenance."),
  component: Page,
});

function Page() {
  const { runAnalysis } = useSim();
  return (<div className="space-y-4"><PageHeader eyebrow="Core" title="Agentic AI Operations" desc="Mock agentic reasoning simulation — no trained model is running." actions={<Btn onClick={runAnalysis}><Sparkles className="h-4 w-4" />Run AI Analysis</Btn>} />
    <Panel title="Agent Workflow"><AgentWorkflow /></Panel>
    <div className="grid gap-4 xl:grid-cols-[1fr_380px]"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{agentDefs.map((a) => <AgentCard key={a.id} id={a.id} />)}</div>
    <Panel title="Agent Activity Log"><ActivityFeed limit={20} className="max-h-[520px]" /></Panel></div></div>);
}
