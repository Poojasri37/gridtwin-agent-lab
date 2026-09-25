import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Activity, AlertTriangle, BarChart3, Bell, Bot, Boxes, CalendarClock, ClipboardList, Cpu, FlaskConical,
  LayoutDashboard, Map, Menu, Network, Search, Settings, Wrench, X, Zap, Play,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useSim } from "@/lib/sim";
import { Dot } from "./kit";
import { cn } from "@/lib/utils";

export const nav = [
  { to: "/dashboard", label: "Command Center", icon: LayoutDashboard },
  { to: "/digital-twin", label: "Digital Twin", icon: Boxes },
  { to: "/assets", label: "Asset Intelligence", icon: Cpu },
  { to: "/monitoring", label: "Live Monitoring", icon: Activity },
  { to: "/agents", label: "AI Agents", icon: Bot },
  { to: "/maintenance", label: "Predictive Maintenance", icon: CalendarClock },
  { to: "/work-orders", label: "Work Orders", icon: ClipboardList },
  { to: "/map", label: "GIS Grid Map", icon: Map },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/simulation", label: "Simulation", icon: FlaskConical },
  { to: "/alerts", label: "Alerts", icon: AlertTriangle },
  { to: "/architecture", label: "Architecture", icon: Network },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/40"><Zap className="h-5 w-5" /></div>
      <div className="min-w-0 leading-tight"><div className="font-semibold tracking-tight">GridTwin <span className="text-primary">AI</span></div><div className="truncate text-[10px] text-muted-foreground">Agentic Predictive Maintenance</div></div>
    </div>
  );
}

function SidebarBody({ onNav }: { onNav?: () => void }) {
  const { alerts, t104 } = useSim();
  const open = alerts.filter((a) => a.status === "Open").length;
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-4"><Logo /></div>
      <div className="mx-4 mb-3 flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-2.5 py-1.5 text-[11px] text-success"><Dot status="Healthy" /> Agents online · 6/6</div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2" aria-label="Main">
        {nav.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} onClick={onNav}
            className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent/60 hover:text-foreground"
            activeProps={{ className: "bg-primary/10 text-primary! ring-1 ring-primary/25" }}>
            <Icon className="h-4 w-4 shrink-0" /><span className="truncate">{label}</span>
            {to === "/alerts" && open > 0 && <span className="ml-auto rounded-full bg-critical/20 px-1.5 font-mono text-[10px] text-critical">{open}</span>}
          </Link>
        ))}
      </nav>
      <div className="m-3 rounded-lg border border-border bg-surface/60 p-3 text-xs">
        <p className="mb-1.5 text-muted-foreground">System status</p>
        <div className="flex justify-between"><span>Grid</span><span className="text-success">Operational</span></div>
        <div className="flex justify-between"><span>T-104 health</span><span className="font-mono">{t104.health}%</span></div>
      </div>
      <div className="flex items-center gap-3 border-t border-border px-4 py-3">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/20 font-mono text-xs text-primary">PN</div>
        <div className="min-w-0 text-xs"><p className="truncate font-medium">Grid Operator</p><p className="truncate text-muted-foreground">admin@gridtwin.ai</p></div>
      </div>
    </div>
  );
}

function Clock() {
  const [t, setT] = useState("");
  useEffect(() => { const f = () => setT(new Date().toLocaleTimeString("en-GB", { hour12: false })); f(); const i = setInterval(f, 1000); return () => clearInterval(i); }, []);
  return <span className="font-mono tabular-nums">{t || "--:--:--"}</span>;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { demoMode, setDemoMode, lastSync, alerts, startScenario } = useSim();
  const navigate = useNavigate();
  const openCount = alerts.filter((a) => a.status === "Open").length;
  return (
    <div className="min-h-screen grid-bg">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-surface/80 backdrop-blur-xl lg:block"><SidebarBody /></aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-background/70" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-border bg-surface"><button aria-label="Close menu" className="absolute right-3 top-4 p-1" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button><SidebarBody onNav={() => setOpen(false)} /></aside>
        </div>
      )}
      <div className="lg:pl-64">
        {demoMode && <div className="border-b border-warning/20 bg-warning/10 px-4 py-1 text-center font-mono text-[11px] tracking-wide text-warning">SIMULATION MODE · Demo Environment · Synthetic Grid Data · No Real Infrastructure</div>}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/75 px-4 py-2.5 backdrop-blur-xl">
          <button className="p-1 lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
          <label className="relative hidden min-w-0 flex-1 md:block md:max-w-sm">
            <span className="sr-only">Search assets</span>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Search assets, work orders…" onKeyDown={(e) => { if (e.key === "Enter") navigate({ to: "/assets" }); }}
              className="w-full rounded-lg border border-input bg-surface/60 py-1.5 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" />
          </label>
          <div className="ml-auto flex items-center gap-3 text-xs sm:gap-4">
            <span className="hidden items-center gap-1.5 text-success sm:flex"><Dot status="Healthy" /> GRID ONLINE</span>
            <span className="hidden text-muted-foreground xl:inline">Sync <span className="font-mono text-foreground">{lastSync}</span></span>
            <span className="hidden text-muted-foreground md:inline"><Clock /></span>
            <label className="hidden items-center gap-2 text-muted-foreground sm:flex">Demo Simulation <Switch checked={demoMode} onCheckedChange={setDemoMode} aria-label="Demo simulation" /></label>
            <Link to="/alerts" className="relative p-1" aria-label={`${openCount} open alerts`}><Bell className="h-4.5 w-4.5" />{openCount > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-critical px-1 font-mono text-[9px] text-destructive-foreground">{openCount}</span>}</Link>
            <button onClick={() => { startScenario(); navigate({ to: "/simulation" }); }} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"><Play className="h-3.5 w-3.5" /><span className="hidden sm:inline">Run Simulation</span></button>
          </div>
        </header>
        <main className={cn("mx-auto max-w-[1600px] p-4 sm:p-6")}>{children}</main>
      </div>
    </div>
  );
}

export { Wrench };
