import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ---- Types (mirror backend models loosely; refine once backend/models/ is defined) ----

export interface Project {
  id: string;
  name: string;
  agency_id: string;
  status: string;
  start_date: string;
  end_date: string;
  geometry: GeoJSON.Geometry;
}

export interface RoadSegment {
  id: string;
  name: string;
  geometry: GeoJSON.LineString;
}

export interface UtilityLine {
  id: string;
  type: "water" | "sewage" | "power" | "gas" | "telecom";
  geometry: GeoJSON.LineString;
}

export interface Conflict {
  id: string;
  project_ids: string[];
  description: string;
  severity: "low" | "medium" | "high";
  location: GeoJSON.Point;
}

export interface Agency {
  id: string;
  name: string;
  contact_email?: string;
}

// ---- API calls ----

export const projectsApi = {
  list: () => api.get<Project[]>("/api/projects").then((r) => r.data),
  get: (id: string) => api.get<Project>(`/api/projects/${id}`).then((r) => r.data),
};

export const roadsApi = {
  list: () => api.get<RoadSegment[]>("/api/roads").then((r) => r.data),
};

// NOTE: backend/api/ currently has no utilities.py — add one (or fold into roads.py)
// when utility line data is ready. Endpoint assumed as /api/utilities for now.
export const utilitiesApi = {
  list: () => api.get<UtilityLine[]>("/api/utilities").then((r) => r.data),
};

export const conflictsApi = {
  list: () => api.get<Conflict[]>("/api/conflicts").then((r) => r.data),
};

export const agenciesApi = {
  list: () => api.get<Agency[]>("/api/agencies").then((r) => r.data),
};
