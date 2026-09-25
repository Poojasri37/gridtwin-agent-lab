import { motion, AnimatePresence } from "framer-motion";
import { Bot, Brain, CalendarCheck, CheckCircle2, Database, Gauge, ShieldCheck, Stethoscope, FileCheck2, Circle, Loader2 } from "lucide-react";
import { agentDefs, type AgentId } from "@/lib/data";
import { SCENARIO_STEPS, useSim, type Activity } from "@/lib/sim";
import { cn } from "@/lib/utils";

const icons: Record<AgentId, React.ElementType> = { cm: Gauge, fd: Stethoscope, pg: Brain, sc: CalendarCheck, vf: ShieldCheck, dc: Bot };

export function AgentCard({ id }: { id: AgentId }) {
  const { agents, activeAgent } = useSim();
  const s = agents[id]; const def = agentDefs.find((a) => a.id === id)!; const Icon = icons[id];
  const active = activeAgent === id;
  return (
    <motion.div layout className={cn("glass relative overflow-hidden p-4 transition", active && "ring-1 ring-primary shadow-[0_0_30px_-8px_var(--primary)]")}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary", active && "animate-pulse")}><Icon className="h-4.5 w-4.5" /></div>
          <p className="truncate text-xs font-semibold uppercase tracking-wider">{def.name}</p>
        </div>
        <span className={cn("flex shrink-0 items-center gap-1 text-[10px] font-medium uppercase", active ? "text-primary" : s.status === "Idle" ? "text-muted-foreground" : "text-success")}>
          {active ? <Loader2 className="h-3 w-3 animate-spin" /> : <Circle className="h-2 w-2 fill-current" />}{active ? "Processing" : s.status}
        </span>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div><dt className="text-muted-foreground">Analyzing</dt><dd className="truncate">{s.task}</dd></div>
        <div><dt className="text-muted-foreground">Confidence</dt><dd className="font-mono text-primary">{s.confidence.toFixed(1)}%</dd></div>
        <div className="col-span-2"><dt className="text-muted-foreground">Last action</dt><dd className="line-clamp-2">{s.lastAction}</dd></div>
      </dl>
    </motion.div>
  );
}

const flow = [
  { key: "data", label: "Sensor Data", icon: Database },
  { key: "cm", label: "Condition Monitoring", icon: Gauge },
  { key: "fd", label: "Fault Diagnosis", icon: Stethoscope },
  { key: "pg", label: "Prognosis", icon: Brain },
  { key: "sc", label: "Scheduling", icon: CalendarCheck },
  { key: "vf", label: "Verification", icon: ShieldCheck },
  { key: "wo", label: "Work Order", icon: FileCheck2 },
];

export function AgentWorkflow({ vertical = false }: { vertical?: boolean }) {
  const { activeAgent } = useSim();
  const activeIdx = flow.findIndex((f) => f.key === activeAgent || (activeAgent === "dc" && f.key === "wo"));
  return (
    <div className={cn("flex gap-0", vertical ? "flex-col items-stretch" : "flex-col md:flex-row md:items-center")} role="list" aria-label="Agent workflow">
      {flow.map((f, i) => {
        const Icon = f.icon; const on = i === activeIdx; const done = activeIdx > i;
        return (
          <div key={f.key} className={cn("flex items-center", vertical ? "flex-col" : "flex-col md:flex-1 md:flex-row")} role="listitem">
            <div className={cn("flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-xs transition md:flex-col md:text-center",
              on ? "border-primary bg-primary/15 text-primary shadow-[0_0_24px_-6px_var(--primary)]" : done ? "border-success/40 text-success" : "border-border bg-surface/60 text-muted-foreground")}>
              <Icon className="h-4 w-4 shrink-0" /><span className="font-medium">{f.label}</span>
            </div>
            {i < flow.length - 1 && (
              <svg className={cn("shrink-0", vertical ? "h-6 w-4" : "h-6 w-4 md:h-4 md:w-full md:min-w-4")} viewBox="0 0 40 10" preserveAspectRatio="none" aria-hidden>
                <line x1="0" y1="5" x2="40" y2="5" stroke={on || done ? "var(--primary)" : "var(--border)"} strokeWidth="2" className="dash-flow" transform={vertical ? "" : undefined} />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}

const lvl: Record<Activity["level"], string> = { info: "bg-info", warn: "bg-warning", crit: "bg-critical", ok: "bg-success" };
export function ActivityFeed({ limit = 12, className }: { limit?: number; className?: string }) {
  const { activity } = useSim();
  return (
    <ol className={cn("space-y-0 overflow-y-auto", className)} aria-live="polite">
      <AnimatePresence initial={false}>
        {activity.slice(0, limit).map((a) => (
          <motion.li key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="relative border-l border-border py-2 pl-4">
            <span className={cn("absolute -left-[4px] top-3.5 h-2 w-2 rounded-full", lvl[a.level])} />
            <div className="flex items-baseline gap-2 text-[11px]"><span className="font-mono text-muted-foreground">{a.time}</span><span className="truncate font-semibold text-primary">{a.agent}</span></div>
            <p className="text-xs text-foreground/90">{a.text}</p>
          </motion.li>
        ))}
      </AnimatePresence>
    </ol>
  );
}

export function SimulationTimeline() {
  const { scenarioStep } = useSim();
  return (
    <ol className="relative space-y-1">
      {SCENARIO_STEPS.map((s, i) => {
        const done = i < scenarioStep, on = i === scenarioStep;
        return (
          <li key={s.key} className={cn("flex gap-3 rounded-lg px-3 py-2 transition", on && "bg-primary/10 ring-1 ring-primary/40")}>
            <div className="flex flex-col items-center">
              <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-[10px]",
                done ? "border-success bg-success/20 text-success" : on ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground")}>
                {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : on ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : i + 1}
              </span>
              {i < SCENARIO_STEPS.length - 1 && <span className={cn("mt-1 w-px flex-1", done ? "bg-success/50" : "bg-border")} />}
            </div>
            <div className="min-w-0 pb-1">
              <p className="font-mono text-[10px] text-muted-foreground">00:{String(i * 10).padStart(2, "0")}</p>
              <p className={cn("text-sm font-medium", !done && !on && "text-muted-foreground")}>{s.title}</p>
              {(done || on) && <p className="text-xs text-muted-foreground">{s.detail}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
