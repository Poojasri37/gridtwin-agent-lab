import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CheckCircle2, Info, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { healthBreakdown, type Asset, type Status } from "@/lib/data";
import type { SensorPoint } from "@/lib/sim";

export const statusColor: Record<string, string> = {
  Healthy: "text-success", Warning: "text-warning", Critical: "text-critical", Monitoring: "text-info",
  Info: "text-info", High: "text-warning", Medium: "text-info", Low: "text-success",
};
export const statusVar: Record<string, string> = {
  Healthy: "var(--success)", Warning: "var(--warning)", Critical: "var(--critical)", Monitoring: "var(--info)",
};

export function Panel({ className, children, title, action, subtitle }: { className?: string; children: ReactNode; title?: ReactNode; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <section className={cn("glass p-4 sm:p-5", className)}>
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h2 className="truncate text-sm font-semibold tracking-wide text-foreground">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function PageHeader({ eyebrow, title, desc, actions }: { eyebrow?: string; title: string; desc?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">{eyebrow}</p>}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {desc && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Dot({ status, className }: { status: string; className?: string }) {
  return <span className={cn("relative inline-flex h-2 w-2 shrink-0", statusColor[status] ?? "text-primary", className)}>
    <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-50" />
    <span className="relative h-2 w-2 rounded-full bg-current" />
  </span>;
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-current/30 bg-current/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide", statusColor[status] ?? "text-primary")}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />{status}
    </span>
  );
}

export function Btn({ children, variant = "primary", className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "outline" }) {
  const v = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_-6px_var(--primary)]",
    outline: "border border-primary/40 text-primary hover:bg-primary/10",
    ghost: "text-muted-foreground hover:bg-accent hover:text-foreground",
  }[variant];
  return <button {...p} className={cn("inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", v, className)}>{children}</button>;
}

export function KpiCard({ icon: Icon, label, value, trend, tone = "primary", i = 0 }: { icon: React.ElementType; label: string; value: ReactNode; trend: string; tone?: "primary" | "success" | "warning" | "critical" | "info"; i?: number }) {
  const c = { primary: "text-primary", success: "text-success", warning: "text-warning", critical: "text-critical", info: "text-info" }[tone];
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
      className="glass group relative overflow-hidden p-4 transition hover:-translate-y-0.5">
      <div className={cn("absolute inset-x-0 top-0 h-px bg-current opacity-60", c)} />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className={cn("h-4 w-4", c)} aria-hidden />
      </div>
      <div className="mt-2 font-mono text-2xl font-semibold tracking-tight">{value}</div>
      <div className={cn("mt-1 text-[11px]", c)}>{trend}</div>
    </motion.div>
  );
}

export function HealthGauge({ value, size = 120, label = "Health" }: { value: number; size?: number; label?: string }) {
  const r = size / 2 - 10, c = 2 * Math.PI * r, pct = Math.max(0, Math.min(100, value));
  const color = pct >= 82 ? "var(--success)" : pct >= 60 ? "var(--warning)" : "var(--critical)";
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }} role="img" aria-label={`${label} ${pct}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--muted)" strokeWidth="8" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="8" fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} style={{ transition: "stroke-dashoffset .8s, stroke .5s", filter: `drop-shadow(0 0 6px ${color})` }} />
      </svg>
      <div className="absolute text-center">
        <div className="font-mono text-2xl font-semibold">{Math.round(pct)}%</div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

export function SensorChart({ data, k, label, unit, color = "var(--chart-1)", threshold, height = 160 }: { data: SensorPoint[]; k: keyof SensorPoint; label: string; unit: string; color?: string; threshold?: number; height?: number }) {
  const last = data[data.length - 1]?.[k] as number;
  const over = threshold !== undefined && last > threshold;
  return (
    <div className="glass p-4" aria-label={`${label} chart, current ${last} ${unit}`}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={cn("font-mono text-lg font-semibold", over && "text-critical")}>{last}<span className="ml-1 text-xs text-muted-foreground">{unit}</span></span>
      </div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs><linearGradient id={`g-${String(k)}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.35} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
            <XAxis dataKey="label" hide />
            <YAxis domain={["auto", "auto"]} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} labelFormatter={() => label} />
            {threshold !== undefined && <ReferenceLine y={threshold} stroke="var(--critical)" strokeDasharray="4 4" />}
            <Area type="monotone" dataKey={k as string} stroke={over ? "var(--critical)" : color} strokeWidth={2} fill={`url(#g-${String(k)})`} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function HealthBreakdown({ asset }: { asset: Pick<Asset, "temperature" | "vibration" | "load" | "age" | "type"> }) {
  const b = healthBreakdown(asset);
  const rows: [string, number, number][] = [["Temperature", b.temperature, 30], ["Vibration", b.vibration, 20], ["Load", b.load, 20], ["Oil Condition", b.oil, 15], ["Maintenance", b.maintenance, 15]];
  return (
    <div>
      <div className="space-y-2">
        {rows.map(([n, v, w]) => (
          <div key={n}>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">{n} <span className="opacity-60">· {w}%</span></span><span className="font-mono">{v}%</span></div>
            <div className="mt-1 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${v}%` }} /></div>
          </div>
        ))}
      </div>
      <details className="mt-3 text-xs text-muted-foreground">
        <summary className="cursor-pointer text-primary">How calculated?</summary>
        <p className="mt-2 font-mono leading-relaxed">Health = 0.30·Temp + 0.20·Vib + 0.20·Load + 0.15·Oil + 0.15·Maint = <span className="text-foreground">{b.overall}%</span></p>
        <p className="mt-1">Each factor is a 0–100 condition score derived from deviation vs. baseline. Mock model for demonstration.</p>
      </details>
    </div>
  );
}

export function AIExplanation({ asset }: { asset: Asset }) {
  const tempEv = Math.max(4, Math.round((asset.temperature - 65) * 1.4));
  const ev: [string, number][] = [["Temperature anomaly", tempEv], ["Vibration anomaly", Math.max(3, Math.round((asset.vibration - 2.5) * 8))], ["Load stress", Math.max(3, Math.round((asset.load - 60) * 0.9))], ["Historical degradation", Math.round(asset.age * 0.9)]];
  const conf = Math.min(97.8, 86 + asset.failureProbability * 0.4).toFixed(1);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary"><Sparkles className="h-3.5 w-3.5" /> AI Diagnosis</div>
      <p className="text-sm leading-relaxed">
        {asset.name} shows {asset.temperature > 80 ? "a sustained temperature increase" : "stable thermal behaviour"} combined with {asset.vibration > 4 ? "elevated vibration" : "normal vibration"} and {asset.load > 80 ? "high" : "moderate"} load.
        Historical patterns indicate potential <b className="text-foreground">{asset.predictedFault.toLowerCase()}</b>.
      </p>
      <div>
        <p className="mb-2 text-xs text-muted-foreground">Evidence</p>
        {ev.map(([n, v]) => (
          <div key={n} className="mb-1.5 flex items-center gap-2 text-xs">
            <span className="w-40 shrink-0 text-muted-foreground">{n}</span>
            <div className="h-1.5 flex-1 rounded-full bg-muted"><div className="h-full rounded-full bg-warning" style={{ width: `${Math.min(100, v * 2.5)}%` }} /></div>
            <span className="w-10 text-right font-mono text-warning">+{v}%</span>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-surface/60 p-3">
        <p className="mb-2 text-xs text-muted-foreground">Why did the AI recommend this?</p>
        {["Temperature rising above baseline", "Vibration above baseline", "Load above historical average", "Similar historical pattern found"].map((t) => (
          <div key={t} className="flex items-center gap-2 text-xs"><CheckCircle2 className="h-3.5 w-3.5 text-success" />{t}</div>
        ))}
        <div className="mt-3 flex flex-wrap items-center gap-1 font-mono text-[10px] text-muted-foreground">
          {["Observation", "Anomaly", "Diagnosis", "Risk estimation", "Recommendation"].map((s, i) => <span key={s} className="flex items-center gap-1">{i > 0 && <span className="text-primary">→</span>}<span className="rounded bg-muted px-1.5 py-0.5">{s}</span></span>)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div><p className="text-xs text-muted-foreground">AI Confidence</p><p className="font-mono text-lg text-primary">{conf}%</p></div>
        <div><p className="text-xs text-muted-foreground">Recommended</p><p className="text-sm">{asset.recommendedAction}</p></div>
      </div>
      <p className="flex items-start gap-1.5 rounded-md bg-warning/10 p-2 text-[11px] text-warning"><Info className="mt-0.5 h-3 w-3 shrink-0" /> Simulation / demo prediction generated from synthetic data. No trained model is running.</p>
    </div>
  );
}

export function Metric({ label, value, unit }: { label: string; value: ReactNode; unit?: string }) {
  return <div className="rounded-lg border border-border bg-surface/50 p-2.5"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p><p className="font-mono text-sm font-semibold">{value}{unit && <span className="ml-0.5 text-[10px] text-muted-foreground">{unit}</span>}</p></div>;
}

export function AssetDetail({ asset }: { asset: Asset }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <HealthGauge value={asset.health} size={104} />
        <div className="space-y-1 text-sm">
          <StatusBadge status={asset.status} />
          <p><span className="text-muted-foreground">RUL </span><span className="font-mono">{asset.rulDays} days</span></p>
          <p><span className="text-muted-foreground">Failure prob. </span><span className="font-mono text-warning">{asset.failureProbability}%</span></p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Metric label="Age" value={asset.age} unit="yr" /><Metric label="Load" value={asset.load} unit="%" /><Metric label="Temp" value={asset.temperature} unit="°C" />
        <Metric label="Oil Temp" value={asset.oilTemperature || "—"} unit={asset.oilTemperature ? "°C" : ""} /><Metric label="Vibration" value={asset.vibration} unit="mm/s" /><Metric label="Humidity" value={asset.humidity} unit="%" />
        <Metric label="Voltage" value={asset.voltage} unit="kV" /><Metric label="Current" value={asset.current} unit="A" /><Metric label="Inspected" value={asset.lastInspection.slice(5)} />
      </div>
      <div><p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Health contributions</p><HealthBreakdown asset={asset} /></div>
      <AIExplanation asset={asset} />
    </div>
  );
}

export function AssetDrawer({ asset, onClose }: { asset: Asset | null | undefined; onClose: () => void }) {
  return (
    <Sheet open={!!asset} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto border-border bg-popover sm:max-w-md">
        {asset && <>
          <SheetHeader className="p-0 pb-4">
            <SheetTitle className="font-mono">{asset.id} · {asset.type}</SheetTitle>
            <SheetDescription>{asset.model} — {asset.location}</SheetDescription>
          </SheetHeader>
          <AssetDetail asset={asset} />
        </>}
      </SheetContent>
    </Sheet>
  );
}

export const statusOf = (s: Status) => s;
