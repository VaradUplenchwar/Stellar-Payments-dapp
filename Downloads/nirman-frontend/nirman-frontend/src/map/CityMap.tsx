import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, LayersControl } from "react-leaflet";
import type { FeatureCollection } from "geojson";
import "leaflet/dist/leaflet.css";
import { roadsApi, projectsApi } from "../services/api";
import type { RoadSegment, Project } from "../services/api";
import styles from "./CityMap.module.css";

const { Overlay } = LayersControl;

const DEFAULT_CENTER: [number, number] = [21.1458, 79.0882];
const DEFAULT_ZOOM = 13;

export default function CityMap() {
  const [roads, setRoads] = useState<RoadSegment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([roadsApi.list(), projectsApi.list()])
      .then(([roadData, projectData]) => {
        setRoads(roadData);
        setProjects(projectData);
      })
      .catch((err) => setError(err.message ?? "Failed to load map data"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.mapContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Infrastructure Map</h1>
          <p className={styles.subtitle}>Real-time project & conflict visualization</p>
        </div>
        <div className={styles.stats}>
          <span className={styles.stat}>{roads.length} roads</span>
          <span className={styles.stat}>{projects.length} projects</span>
        </div>
      </div>

      {loading && <MapOverlayMessage text="🗺️ Loading map..." />}
      {error && <MapOverlayMessage text={`Error: ${error}`} isError />}

      <div className={styles.mapWrapper}>
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          className={styles.mapElement}
        >
          {/* Dark Basemap */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          <LayersControl position="topright" collapsed={false}>
            {/* Roads Layer */}
            <Overlay checked name="🛣️ Roads">
              <GeoJSON
                data={{
                  type: "FeatureCollection",
                  features: roads.map((r) => ({
                    type: "Feature",
                    properties: { id: r.id, name: r.name },
                    geometry: r.geometry,
                  })),
                } as FeatureCollection}
                style={{
                  color: "#58a6ff",
                  weight: 2.5,
                  opacity: 0.7,
                }}
              />
            </Overlay>

            {/* Projects Layer */}
            <Overlay checked name="🏗️ Projects">
              <GeoJSON
                data={{
                  type: "FeatureCollection",
                  features: projects.map((p) => ({
                    type: "Feature",
                    properties: { id: p.id, name: p.name, status: p.status },
                    geometry: p.geometry,
                  })),
                } as FeatureCollection}
                style={{
                  color: "#50fa7b",
                  weight: 3,
                  opacity: 0.8,
                  dashArray: "5 3",
                }}
              />
            </Overlay>
          </LayersControl>
        </MapContainer>

        {/* Floating Legend */}
        <div className={styles.legend}>
          <h3 className={styles.legendTitle}>Legend</h3>
          <ul className={styles.legendItems}>
            <li className={styles.legendItem}>
              <span className={styles.legendColor} style={{ borderColor: "#58a6ff" }}></span>
              <span>Roads</span>
            </li>
            <li className={styles.legendItem}>
              <span className={styles.legendColor} style={{ borderColor: "#50fa7b" }}></span>
              <span>Projects</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function MapOverlayMessage({ text, isError }: { text: string; isError?: boolean }) {
  return (
    <div className={`${styles.overlayMessage} ${isError ? styles.error : ""}`}>
      {text}
    </div>
  );
}
