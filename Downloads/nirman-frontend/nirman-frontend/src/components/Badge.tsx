import styles from "./Badge.module.css";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${className || ""}`}>
      {children}
    </span>
  );
}

// Severity badge helper
export function SeverityBadge({ severity }: { severity: "low" | "medium" | "high" }) {
  const variants: Record<typeof severity, BadgeVariant> = {
    low: "success",
    medium: "warning",
    high: "danger",
  };

  const labels: Record<typeof severity, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };

  return <Badge variant={variants[severity]}>{labels[severity]}</Badge>;
}

// Status badge helper
export function StatusBadge({ status }: { status: "active" | "pending" | "completed" | "on-hold" }) {
  const variants: Record<typeof status, BadgeVariant> = {
    active: "info",
    pending: "warning",
    completed: "success",
    "on-hold": "danger",
  };

  const labels: Record<typeof status, string> = {
    active: "Active",
    pending: "Pending",
    completed: "Completed",
    "on-hold": "On Hold",
  };

  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
