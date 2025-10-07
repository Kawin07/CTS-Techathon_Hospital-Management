import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Custom icons using Font Awesome
const ambulanceIcon = L.divIcon({
  className: "leaflet-div-icon fa-icon fa-ambulance",
  html: '<i class="fa-solid fa-truck-medical" style="color:#74C0FC;font-size:32px;display:inline-block;text-shadow:0 0 2px #fff"></i>',
  iconSize: [32, 32],
  iconAnchor: [16, 28],
  popupAnchor: [0, -24],
});

const hospitalIcon = L.divIcon({
  className: "leaflet-div-icon fa-icon fa-hospital",
  html: '<i class="fa-solid fa-house-medical" style="color:#63E6BE;font-size:28px;display:inline-block;text-shadow:0 0 2px #fff"></i>',
  iconSize: [28, 28],
  iconAnchor: [14, 26],
  popupAnchor: [0, -22],
});

// Mock ambulance data (Chennai area)
const ambulances = [
  {
    id: 1,
    lat: 13.0418,
    lng: 80.2337,
    status: "Available",
    driver: "Ravi Kumar",
    patients: 1,
    from: "T. Nagar",
  },
  {
    id: 2,
    lat: 13.0067,
    lng: 80.2573,
    status: "On Duty",
    driver: "Priya Singh",
    patients: 2,
    from: "Adyar",
  },
  {
    id: 3,
    lat: 13.086,
    lng: 80.2101,
    status: "Available",
    driver: "Arjun Patel",
    patients: 0,
    from: "Anna Nagar",
  },
];

// Static hospitals near Chennai
const hospitals = [
  {
    id: "H1",
    name: "Apollo Hospitals, Greams Road",
    lat: 13.0613,
    lng: 80.2572,
  },
  {
    id: "H2",
    name: "Fortis Malar Hospital, Adyar",
    lat: 13.0027,
    lng: 80.2573,
  },
  {
    id: "H3",
    name: "Rajiv Gandhi Govt. General Hospital",
    lat: 13.0823,
    lng: 80.274,
  },
  { id: "H4", name: "Kauvery Hospital, Alwarpet", lat: 13.033, lng: 80.2522 },
  { id: "H5", name: "SIMS Hospital, Vadapalani", lat: 13.0526, lng: 80.2121 },
];

// Haversine distance (km)
function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const la1 = (aLat * Math.PI) / 180;
  const la2 = (bLat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(la1) * Math.cos(la2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

function nearestHospitals(lat: number, lng: number, limit = 3) {
  return hospitals
    .map((h) => ({ ...h, distance: distanceKm(lat, lng, h.lat, h.lng) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

const AmbulanceTracking: React.FC = () => {
  // Centered on Chennai
  const center = useMemo<[number, number]>(() => [13.0827, 80.2707], []);
  // routes: ambId -> list of [lat, lng]
  const [routes, setRoutes] = useState<Record<number, [number, number][]>>({});
  // routes meta: ambId -> destination hospital and metrics
  const [routeMeta, setRouteMeta] = useState<
    Record<
      number,
      {
        hospitalId: string;
        hospitalName: string;
        distanceKm: number;
        durationMin: number;
      }
    >
  >({});

  useEffect(() => {
    let cancelled = false;
    async function fetchRoutes() {
      for (const amb of ambulances) {
        const nearest = nearestHospitals(amb.lat, amb.lng, 1)[0];
        if (!nearest) continue;
        const url = `https://router.project-osrm.org/route/v1/driving/${amb.lng},${amb.lat};${nearest.lng},${nearest.lat}?overview=full&geometries=geojson`;
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`OSRM status ${res.status}`);
          const data = await res.json();
          const coords: [number, number][] =
            data?.routes?.[0]?.geometry?.coordinates?.map(
              (c: [number, number]) => [c[1], c[0]]
            ) || [];
          const distanceKm = (data?.routes?.[0]?.distance ?? 0) / 1000;
          const durationMin = (data?.routes?.[0]?.duration ?? 0) / 60;
          if (!cancelled && coords.length) {
            setRoutes((prev) => ({ ...prev, [amb.id]: coords }));
            setRouteMeta((prev) => ({
              ...prev,
              [amb.id]: {
                hospitalId: nearest.id,
                hospitalName: nearest.name,
                distanceKm,
                durationMin,
              },
            }));
          }
        } catch (e) {
          console.warn("Routing failed for ambulance", amb.id, e);
        }
      }
    }
    fetchRoutes();
    return () => {
      cancelled = true;
    };
  }, []);
  return (
    <div style={{ width: "100%" }}>
      <div style={{ height: "500px", width: "100%" }}>
        <MapContainer
          center={center}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Render routing polylines */}
          {Object.entries(routes).map(([ambId, pts]) => (
            <Polyline
              key={`route-${ambId}`}
              positions={pts}
              pathOptions={{ color: "#1976d2", weight: 4, opacity: 0.8 }}
            />
          ))}
          {/* Hospitals */}
          {hospitals.map((h) => (
            <Marker key={h.id} position={[h.lat, h.lng]} icon={hospitalIcon}>
              <Popup>
                <b>{h.name}</b>
              </Popup>
            </Marker>
          ))}

          {/* Ambulances with nearest hospitals */}
          {ambulances.map((amb) => {
            const nearest = nearestHospitals(amb.lat, amb.lng, 3);
            return (
              <Marker
                key={amb.id}
                position={[amb.lat, amb.lng]}
                icon={ambulanceIcon}
              >
                <Popup>
                  <div style={{ minWidth: 220 }}>
                    <b>Ambulance ID:</b> {amb.id}
                    <br />
                    <b>Status:</b> {amb.status}
                    <br />
                    <b>Driver:</b> {amb.driver}
                    <br />
                    <b>Patients:</b> {amb.patients}
                    <hr />
                    <b>Nearby hospitals</b>
                    <ol style={{ margin: "6px 0 0 18px" }}>
                      {nearest.map((h) => (
                        <li key={h.id}>
                          {h.name} — {h.distance.toFixed(2)} km
                        </li>
                      ))}
                    </ol>
                    {routes[amb.id] && (
                      <p style={{ marginTop: 6, color: "#1976d2" }}>
                        Route to nearest hospital shown on map.
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Details panel */}
      <div style={{ marginTop: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Ambulance Details
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", background: "#f8fafc" }}>
                <th
                  style={{ padding: "10px", borderBottom: "1px solid #e2e8f0" }}
                >
                  ID
                </th>
                <th
                  style={{ padding: "10px", borderBottom: "1px solid #e2e8f0" }}
                >
                  Driver
                </th>
                <th
                  style={{ padding: "10px", borderBottom: "1px solid #e2e8f0" }}
                >
                  Status
                </th>
                <th
                  style={{ padding: "10px", borderBottom: "1px solid #e2e8f0" }}
                >
                  Patients
                </th>
                <th
                  style={{ padding: "10px", borderBottom: "1px solid #e2e8f0" }}
                >
                  From
                </th>
                <th
                  style={{ padding: "10px", borderBottom: "1px solid #e2e8f0" }}
                >
                  To Hospital
                </th>
                <th
                  style={{ padding: "10px", borderBottom: "1px solid #e2e8f0" }}
                >
                  Distance
                </th>
                <th
                  style={{ padding: "10px", borderBottom: "1px solid #e2e8f0" }}
                >
                  ETA
                </th>
              </tr>
            </thead>
            <tbody>
              {ambulances.map((amb) => {
                const meta = routeMeta[amb.id];
                const toName =
                  meta?.hospitalName ||
                  nearestHospitals(amb.lat, amb.lng, 1)[0]?.name ||
                  "-";
                const dist = meta ? `${meta.distanceKm.toFixed(2)} km` : "-";
                const eta = meta ? `${Math.round(meta.durationMin)} min` : "-";
                return (
                  <tr
                    key={`row-${amb.id}`}
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <td style={{ padding: "10px" }}>{amb.id}</td>
                    <td style={{ padding: "10px" }}>{amb.driver}</td>
                    <td style={{ padding: "10px" }}>{amb.status}</td>
                    <td style={{ padding: "10px" }}>{amb.patients}</td>
                    <td style={{ padding: "10px" }}>{amb.from}</td>
                    <td style={{ padding: "10px" }}>{toName}</td>
                    <td style={{ padding: "10px" }}>{dist}</td>
                    <td style={{ padding: "10px" }}>{eta}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AmbulanceTracking;
