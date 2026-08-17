import { useEffect, useState } from "react";
import { projectsApi, conflictsApi, agenciesApi } from "../services/api";
import type { Project, Conflict, Agency } from "../services/api";
import Card, { CardHeader, CardBody } from "../components/Card";
import { SeverityBadge } from "../components/Badge";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([projectsApi.list(), conflictsApi.list(), agenciesApi.list()])
      .then(([p, c, a]) => {
        setProjects(p);
        setConflicts(c);
        setAgencies(a);
      })
      .catch(() => {
        setProjects([]);
        setConflicts([]);
        setAgencies([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingState}>
          <div className={styles.skeleton}></div>
          <p>Loading infrastructure data...</p>
        </div>
      </div>
    );
  }

  const highSeverityCount = conflicts.filter((c) => c.severity === "high").length;
  const mediumSeverityCount = conflicts.filter((c) => c.severity === "medium").length;

  return (
    <div className={styles.dashboard}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSubtitle}>Real-time infrastructure coordination overview</p>
        </div>
        <div className={styles.topBarStats}>
          {highSeverityCount > 0 && (
            <div className={styles.alertPill} data-severity="high">
              <span className={styles.alertDot}></span>
              <span>{highSeverityCount} critical conflict{highSeverityCount !== 1 ? "s" : ""}</span>
            </div>
          )}
          <div className={styles.timestamp}>
            Updated <time>{new Date().toLocaleTimeString()}</time>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className={styles.kpiGrid}>
        <KPICard
          label="Active Projects"
          value={projects.length}
          unit="projects"
          icon="📋"
          trend={{ label: "this month", value: "+2" }}
        />
        <KPICard
          label="Active Conflicts"
          value={conflicts.length}
          unit="conflicts"
          icon={highSeverityCount > 0 ? "🚨" : "✓"}
          severity={highSeverityCount > 0 ? "high" : "low"}
          trend={{ label: highSeverityCount > 0 ? "critical" : "normal", value: highSeverityCount }}
        />
        <KPICard
          label="Agencies"
          value={agencies.length}
          unit="agencies"
          icon="🏢"
          trend={{ label: "coordinating", value: "active" }}
        />
        <KPICard
          label="System Health"
          value="98.5"
          unit="%"
          icon="💚"
          severity="low"
          trend={{ label: "uptime", value: "excellent" }}
        />
      </div>

      {/* Main Content Grid */}
      <div className={styles.contentGrid}>
        {/* Conflicts */}
        <Card>
          <CardHeader>
            <div>
              <h2 className={styles.sectionTitle}>Active Conflicts</h2>
              <p className={styles.sectionDescription}>Issues requiring coordination</p>
            </div>
            {conflicts.length > 0 && (
              <div className={styles.badge} data-count={conflicts.length}>
                {conflicts.length}
              </div>
            )}
          </CardHeader>
          <CardBody>
            {conflicts.length === 0 ? (
              <div className={styles.emptyStateInline}>
                <p>✓ No active conflicts</p>
              </div>
            ) : (
              <ul className={styles.conflictList}>
                {conflicts.map((c) => (
                  <li key={c.id} className={styles.conflictItem} data-severity={c.severity}>
                    <div className={styles.conflictSeverityBadge}>
                      <SeverityBadge severity={c.severity} />
                    </div>
                    <div className={styles.conflictContent}>
                      <p className={styles.conflictText}>{c.description}</p>
                      <p className={styles.conflictMeta}>
                        ID: <code>{c.id.slice(0, 8)}</code>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Projects */}
        <Card>
          <CardHeader>
            <div>
              <h2 className={styles.sectionTitle}>Active Projects</h2>
              <p className={styles.sectionDescription}>Ongoing infrastructure work</p>
            </div>
            {projects.length > 0 && (
              <div className={styles.badge} data-count={projects.length}>
                {projects.length}
              </div>
            )}
          </CardHeader>
          <CardBody>
            {projects.length === 0 ? (
              <div className={styles.emptyStateInline}>
                <p>No projects loaded</p>
              </div>
            ) : (
              <ul className={styles.projectList}>
                {projects.slice(0, 6).map((p) => (
                  <li key={p.id} className={styles.projectItem}>
                    <div className={styles.projectHeader}>
                      <h4 className={styles.projectName}>{p.name}</h4>
                      {p.status && (
                        <span className={styles.projectStatus} data-status={p.status}>
                          {p.status}
                        </span>
                      )}
                    </div>
                    <div className={styles.projectDetails}>
                      <p className={styles.projectDetail}>
                        Agency: <strong>{p.agency_id}</strong>
                      </p>
                      {p.start_date && (
                        <p className={styles.projectDetail}>
                          Duration: {new Date(p.start_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
                {projects.length > 6 && (
                  <li className={styles.projectItem + " " + styles.more}>
                    <p>+ {projects.length - 6} more projects</p>
                  </li>
                )}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Agencies */}
        <Card>
          <CardHeader>
            <div>
              <h2 className={styles.sectionTitle}>Coordinating Agencies</h2>
              <p className={styles.sectionDescription}>Stakeholders in this zone</p>
            </div>
            {agencies.length > 0 && (
              <div className={styles.badge} data-count={agencies.length}>
                {agencies.length}
              </div>
            )}
          </CardHeader>
          <CardBody>
            {agencies.length === 0 ? (
              <div className={styles.emptyStateInline}>
                <p>No agencies registered</p>
              </div>
            ) : (
              <ul className={styles.agencyList}>
                {agencies.map((a) => (
                  <li key={a.id} className={styles.agencyItem}>
                    <p className={styles.agencyName}>{a.name}</p>
                    {a.contact_email && (
                      <p className={styles.agencyEmail}>{a.contact_email}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

interface KPICardProps {
  label: string;
  value: number | string;
  unit: string;
  icon: string;
  severity?: "low" | "medium" | "high";
  trend?: { label: string; value: string | number };
}

function KPICard({ label, value, unit, icon, severity, trend }: KPICardProps) {
  return (
    <div className={`${styles.kpiCard} ${severity ? styles[`severity${severity}`] : ""}`}>
      <div className={styles.kpiIcon}>{icon}</div>
      <div className={styles.kpiContent}>
        <p className={styles.kpiLabel}>{label}</p>
        <div className={styles.kpiValue}>
          <span>{value}</span>
          <span className={styles.kpiUnit}>{unit}</span>
        </div>
        {trend && (
          <p className={styles.kpiTrend}>
            {trend.value} <span>{trend.label}</span>
          </p>
        )}
      </div>
    </div>
  );
}

  const highSeverityCount = conflicts.filter((c) => c.severity === "high").length;

  return (
    <div className={styles.dashboard}>
      {/* Header Section */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Infrastructure & Project Management Overview</p>
        </div>
        <div className={styles.headerMeta}>
          <span className={styles.lastUpdated}>Last updated: Just now</span>
        </div>
      </div>

      {/* Key Metrics Section */}
      <div className={styles.metricsGrid}>
        <StatCard
          icon="📋"
          label="Active Projects"
          value={projects.length}
          trend="+ 2 this month"
        />
        <StatCard
          icon="⚠️"
          label="Active Conflicts"
          value={conflicts.length}
          alert={highSeverityCount > 0}
          trend={highSeverityCount > 0 ? `${highSeverityCount} high priority` : "All normal"}
        />
        <StatCard
          icon="🏢"
          label="Agencies Involved"
          value={agencies.length}
          trend="Collaborating"
        />
        <StatCard
          icon="✅"
          label="System Status"
          value="Operational"
          status="success"
          trend="99.9% uptime"
        />
      </div>

      {/* Main Content Grid */}
      <div className={styles.contentGrid}>
        {/* Conflicts Section */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Active Conflicts</h2>
            {conflicts.length > 0 && (
              <span className={styles.badge}>{conflicts.length}</span>
            )}
          </div>
          <div className={styles.cardBody}>
            {conflicts.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyIcon}>✓</p>
                <p className={styles.emptyText}>No conflicts detected</p>
              </div>
            ) : (
              <ul className={styles.conflictList}>
                {conflicts.map((c) => (
                  <li key={c.id} className={styles.conflictItem}>
                    <div className={styles.severityIndicator} data-severity={c.severity}></div>
                    <div className={styles.conflictContent}>
                      <div className={styles.conflictSeverity}>
                        {c.severity.toUpperCase()}
                      </div>
                      <p className={styles.conflictDescription}>{c.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Projects Overview */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Projects Overview</h2>
            {projects.length > 0 && (
              <span className={styles.badge}>{projects.length}</span>
            )}
          </div>
          <div className={styles.cardBody}>
            {projects.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyIcon}>📋</p>
                <p className={styles.emptyText}>No projects found</p>
              </div>
            ) : (
              <div className={styles.projectList}>
                {projects.slice(0, 5).map((p) => (
                  <div key={p.id} className={styles.projectItem}>
                    <div className={styles.projectMeta}>
                      <h4 className={styles.projectName}>{p.name}</h4>
                      <p className={styles.projectLocation}>{p.location}</p>
                    </div>
                  </div>
                ))}
                {projects.length > 5 && (
                  <p className={styles.moreItems}>+ {projects.length - 5} more projects</p>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  alert,
  status,
  trend,
}: {
  icon: string;
  label: string;
  value: number | string;
  alert?: boolean;
  status?: "success" | "warning" | "error";
  trend?: string;
}) {
  return (
    <div className={`${styles.statCard} ${alert ? styles.statCardAlert : ""}`}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statContent}>
        <div className={styles.statLabel}>{label}</div>
        <div className={styles.statValue}>{value}</div>
        {trend && <div className={styles.statTrend}>{trend}</div>}
      </div>
      {status && <div className={`${styles.statusIndicator} ${styles[`status${status}`]}`}></div>}
    </div>
  );
}
