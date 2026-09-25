import { statusVar } from "./kit";
import type { Status } from "@/lib/data";
import { cn } from "@/lib/utils";

export interface TwinPart { id: string; label: string; status: Status; }

// 2.5D isometric-ish SVG digital twin of Substation Alpha
export function DigitalTwin({ parts, selected, onSelect }: { parts: Record<string, TwinPart>; selected: string; onSelect: (id: string) => void }) {
  const c = (id: string) => statusVar[parts[id]?.status ?? "Monitoring"];
  const G = ({ id, children, x, y }: { id: string; children: React.ReactNode; x: number; y: number }) => (
    <g transform={`translate(${x} ${y})`} role="button" tabIndex={0} aria-label={parts[id]?.label ?? id}
      onClick={() => onSelect(id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(id)}
      className={cn("cursor-pointer outline-none transition-opacity hover:opacity-100 focus-visible:opacity-100", selected && selected !== id ? "opacity-70" : "opacity-100")}>
      {children}
      {selected === id && <rect x="-8" y="-8" width="136" height="146" rx="10" fill="none" stroke="var(--primary)" strokeDasharray="4 4" />}
    </g>
  );
  const Transformer = ({ id }: { id: string }) => (
    <>
      <ellipse cx="60" cy="122" rx="58" ry="10" fill={c(id)} opacity=".15" />
      <path d="M10 40 L60 20 L110 40 L110 110 L60 130 L10 110 Z" fill="var(--surface-2)" stroke={c(id)} strokeWidth="1.5" />
      <path d="M10 40 L60 60 L110 40" fill="none" stroke={c(id)} strokeWidth="1" opacity=".6" />
      <path d="M60 60 L60 130" stroke={c(id)} strokeWidth="1" opacity=".4" />
      {[20, 32, 44].map((x) => <line key={x} x1={x} y1={60 + (x - 20) * 0.4} x2={x} y2={108 + (x - 20) * 0.4} stroke={c(id)} opacity=".5" />)}
      {[76, 88, 100].map((x) => <line key={x} x1={x} y1={60 - (x - 76) * 0.4 + 0} x2={x} y2={116 - (x - 76) * 0.4} stroke={c(id)} opacity=".5" />)}
      {[36, 60, 84].map((x) => <g key={x}><rect x={x - 3} y={x === 60 ? 2 : 8} width="6" height="22" rx="2" fill="var(--muted-foreground)" /><circle cx={x} cy={x === 60 ? 2 : 8} r="3" fill={c(id)} /></g>)}
      <circle cx="100" cy="30" r="5" fill={c(id)}><animate attributeName="opacity" values="1;.3;1" dur="1.6s" repeatCount="indefinite" /></circle>
      <text x="60" y="148" textAnchor="middle" className="fill-foreground font-mono text-[11px]">{parts[id].label}</text>
    </>
  );
  const Switchgear = ({ id }: { id: string }) => (
    <>
      <rect x="15" y="30" width="90" height="90" rx="4" fill="var(--surface-2)" stroke={c(id)} strokeWidth="1.5" />
      {[0, 1, 2].map((i) => <g key={i}><rect x={22 + i * 28} y="40" width="22" height="70" rx="2" fill="none" stroke={c(id)} opacity=".5" /><circle cx={33 + i * 28} cy="55" r="3" fill={c(id)} /><rect x={27 + i * 28} y="75" width="12" height="4" fill="var(--muted-foreground)" /></g>)}
      <text x="60" y="140" textAnchor="middle" className="fill-foreground font-mono text-[11px]">{parts[id].label}</text>
    </>
  );
  return (
    <svg viewBox="0 0 900 520" className="h-auto w-full" role="group" aria-label="Substation Alpha digital twin">
      <defs>
        <pattern id="tg" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="var(--grid-line)" /></pattern>
      </defs>
      <rect width="900" height="520" fill="url(#tg)" />
      <path d="M40 470 L450 330 L860 470" fill="none" stroke="var(--border)" />
      {/* busbars */}
      <line x1="60" y1="90" x2="840" y2="90" stroke="var(--primary)" strokeWidth="3" opacity=".7" />
      <line x1="60" y1="90" x2="840" y2="90" stroke="var(--primary)" strokeWidth="3" className="dash-flow" />
      <line x1="200" y1="420" x2="760" y2="420" stroke="var(--primary)" strokeWidth="2" opacity=".5" className="dash-flow" />
      {[210, 690].map((x) => <line key={x} x1={x} y1="90" x2={x} y2="160" stroke="var(--primary)" strokeWidth="2" className="dash-flow" />)}
      {[210, 690].map((x) => <line key={x} x1={x} y1="300" x2={x} y2="420" stroke="var(--primary)" strokeWidth="2" className="dash-flow" />)}
      <G id="feeder-in" x={0} y={20}><rect x="20" y="40" width="80" height="50" rx="6" fill="var(--surface-2)" stroke={c("feeder-in")} /><text x="60" y="70" textAnchor="middle" className="fill-foreground font-mono text-[10px]">INCOMING</text><text x="60" y="110" textAnchor="middle" className="fill-muted-foreground text-[10px]">132 kV feeder</text></G>
      <G id="feeder-out" x={780} y={20}><rect x="20" y="40" width="80" height="50" rx="6" fill="var(--surface-2)" stroke={c("feeder-out")} /><text x="60" y="70" textAnchor="middle" className="fill-foreground font-mono text-[10px]">OUTGOING</text><text x="60" y="110" textAnchor="middle" className="fill-muted-foreground text-[10px]">33 kV feeder</text></G>
      <G id="T-104" x={150} y={150}><Transformer id="T-104" /></G>
      <G id="T-105" x={630} y={150}><Transformer id="T-105" /></G>
      <G id="cooling" x={330} y={170}>
        <rect x="10" y="30" width="100" height="80" rx="6" fill="var(--surface-2)" stroke={c("cooling")} />
        {[35, 85].map((x) => <g key={x} transform={`translate(${x} 70)`}><circle r="18" fill="none" stroke={c("cooling")} opacity=".6" /><g><path d="M0 -15 L4 0 L0 15 L-4 0Z M-15 0 L0 4 L15 0 L0 -4Z" fill={c("cooling")} opacity=".8" /><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="2s" repeatCount="indefinite" /></g></g>)}
        <text x="60" y="140" textAnchor="middle" className="fill-foreground font-mono text-[11px]">Cooling System</text>
      </G>
      <G id="oil" x={470} y={170}>
        <rect x="20" y="30" width="80" height="80" rx="40" fill="var(--surface-2)" stroke={c("oil")} />
        <clipPath id="oilc"><rect x="20" y="30" width="80" height="80" rx="40" /></clipPath>
        <rect x="20" y="62" width="80" height="50" fill={c("oil")} opacity=".3" clipPath="url(#oilc)" />
        <text x="60" y="140" textAnchor="middle" className="fill-foreground font-mono text-[11px]">Oil Tank</text>
      </G>
      <G id="SG-201" x={250} y={340}><Switchgear id="SG-201" /></G>
      <G id="SG-202" x={530} y={340}><Switchgear id="SG-202" /></G>
      <text x="450" y="30" textAnchor="middle" className="fill-muted-foreground font-mono text-[11px] tracking-[0.3em]">SUBSTATION ALPHA · LIVE TWIN</text>
    </svg>
  );
}

// Grid health topology
export function GridTopology({ nodes, onSelect }: { nodes: { id: string; label: string; kind: string; status: Status; x: number; y: number; parent?: string }[]; onSelect: (id: string) => void }) {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  return (
    <svg viewBox="0 0 800 300" className="h-auto w-full" role="group" aria-label="Grid health topology">
      {nodes.filter((n) => n.parent).map((n) => { const p = byId[n.parent!]; return <line key={n.id} x1={p.x} y1={p.y} x2={n.x} y2={n.y} stroke="var(--primary)" strokeOpacity=".5" strokeWidth="1.5" className="dash-flow" />; })}
      {nodes.map((n) => (
        <g key={n.id} transform={`translate(${n.x} ${n.y})`} className="cursor-pointer" role="button" tabIndex={0} aria-label={`${n.label} ${n.status}`}
          onClick={() => onSelect(n.id)} onKeyDown={(e) => e.key === "Enter" && onSelect(n.id)}>
          <circle r="22" fill={statusVar[n.status]} opacity=".12"><animate attributeName="r" values="16;24;16" dur="2.4s" repeatCount="indefinite" /></circle>
          <circle r={n.kind === "Substation" ? 13 : 9} fill="var(--surface-2)" stroke={statusVar[n.status]} strokeWidth="2.5" style={{ filter: `drop-shadow(0 0 6px ${statusVar[n.status]})` }} />
          <text y={n.kind === "Substation" ? -22 : 26} textAnchor="middle" className="fill-foreground font-mono text-[10px]">{n.label}</text>
        </g>
      ))}
    </svg>
  );
}
