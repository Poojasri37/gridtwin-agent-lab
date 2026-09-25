import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/lib/meta";
import { Btn, Dot, PageHeader, SensorChart } from "@/components/kit";
import { useSim } from "@/lib/sim";

export const Route = createFileRoute("/_shell/monitoring")({
  head: () => pageMeta("Live Monitoring", "Real-time sensor streams with anomaly thresholds for transformer T-104."),
  component: Page,
});

function Page() {
  const { history, live, setLive, lastSync } = useSim();
  return (<div><PageHeader eyebrow="Telemetry · T-104" title="Live Monitoring" desc="Sensor values update every 3 seconds. Simulation Engine — Demonstration Data."
    actions={<><span className="flex items-center gap-2 font-mono text-xs text-critical"><Dot status="Critical" />LIVE · {lastSync}</span><Btn variant="outline" onClick={() => setLive(!live)}>{live ? "Pause" : "Resume"}</Btn></>} />
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <SensorChart data={history} k="temperature" label="Temperature" unit="°C" threshold={85} />
      <SensorChart data={history} k="oilTemperature" label="Oil Temperature" unit="°C" color="var(--chart-2)" />
      <SensorChart data={history} k="vibration" label="Vibration" unit="mm/s" color="var(--chart-4)" threshold={5} />
      <SensorChart data={history} k="load" label="Load" unit="%" color="var(--chart-5)" threshold={90} />
      <SensorChart data={history} k="voltage" label="Voltage" unit="kV" color="var(--chart-3)" />
      <SensorChart data={history} k="current" label="Current" unit="A" />
      <SensorChart data={history} k="humidity" label="Humidity" unit="%" color="var(--chart-5)" />
      <SensorChart data={history} k="partialDischarge" label="Partial Discharge" unit="pC" color="var(--chart-2)" />
      <SensorChart data={history} k="oilPressure" label="Oil Pressure" unit="bar" color="var(--chart-3)" />
    </div></div>);
}
