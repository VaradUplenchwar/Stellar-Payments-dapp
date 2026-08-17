import { NavLink, Outlet } from "react-router-dom";
import styles from "./Layout.module.css";

export default function Layout() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          {/* Logo & Branding */}
          <div className={styles.brandSection}>
            <div className={styles.logo}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 3L21 9V21H3V9Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M9 21V12H15V21" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="17" cy="6" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <div className={styles.brandText}>
              <h1 className={styles.appTitle}>Nirman</h1>
              <p className={styles.appSubtitle}>Infrastructure Coordinator</p>
            </div>
          </div>

          {/* Live Status */}
          <div className={styles.liveStatus}>
            <span className={styles.statusDot} />
            <span>System Active</span>
          </div>

          {/* Header Actions */}
          <div className={styles.headerActions}>
            <button className={styles.iconButton} title="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <div className={styles.userAvatar}>NMC</div>
          </div>
        </div>
      </header>

      <div className={styles.mainContainer}>
        {/* Sidebar Navigation */}
        <nav className={styles.sidebar}>
          <div className={styles.navGroup}>
            <p className={styles.navGroupLabel}>Navigation</p>
            <NavLink
              to="/"
              end
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/map"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Map</span>
            </NavLink>
          </div>

          <div className={styles.sidebarFooter}>
            <p className={styles.sidebarVersion}>v1.0 Beta</p>
          </div>
        </nav>

        {/* Main Content */}
        <main className={styles.mainContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
  );
}

function NavItem({ to, children, icon }: { to: string; children: React.ReactNode; icon?: string }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
      }
    >
      {icon && <span className={styles.navIcon}>{icon}</span>}
      <span>{children}</span>
    </NavLink>
  );
}
