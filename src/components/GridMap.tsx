import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, Tooltip } from "react-leaflet";
import { assets, substations } from "@/lib/data";

const col = { Healthy: "#34d17a", Warning: "#f5b93d", Critical: "#f0564a", Monitoring: "#5b9cf5" } as const;

export default function GridMap({ filter }: { filter: string }) {
  const shown = assets.filter((a) => filter === "All" || a.type === filter || a.status === filter);
  const lines: [number, number][][] = [[0, 1], [0, 3], [0, 4], [1, 2], [2, 5], [3, 2], [1, 5]].map(([a, b]) => [[substations[a].lat, substations[a].lng], [substations[b].lat, substations[b].lng]]);
  return (
    <MapContainer center={[11.02, 78.13]} zoom={11} className="h-full w-full rounded-xl" scrollWheelZoom>
      <TileLayer attribution="&copy; OpenStreetMap &copy; CARTO" url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
      {lines.map((l, i) => <Polyline key={i} positions={l} pathOptions={{ color: "#4fd1e8", weight: 2, opacity: 0.6, dashArray: "6 8" }} />)}
      {(filter === "All" || filter === "Substation") && substations.map((s) => (
        <CircleMarker key={s.id} center={[s.lat, s.lng]} radius={11} pathOptions={{ color: "#4fd1e8", fillColor: "#0b1728", fillOpacity: 1, weight: 3 }}>
          <Tooltip permanent direction="top" offset={[0, -10]}>{s.name}</Tooltip>
          <Popup><b>{s.name}</b><br />132/33 kV · {assets.filter((a) => a.location === s.name).length} assets</Popup>
        </CircleMarker>
      ))}
      {filter !== "Substation" && shown.map((a) => (
        <CircleMarker key={a.id} center={[a.lat, a.lng]} radius={a.type === "Transformer" ? 7 : 5} pathOptions={{ color: col[a.status], fillColor: col[a.status], fillOpacity: 0.8, weight: 2 }}>
          <Popup>
            <b>{a.id}</b> · {a.type}<br />{a.location}<br />Health <b>{a.health}%</b> · Risk <b>{a.failureProbability}%</b><br />Status: <b style={{ color: col[a.status] }}>{a.status}</b><br />{a.recommendedAction}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
