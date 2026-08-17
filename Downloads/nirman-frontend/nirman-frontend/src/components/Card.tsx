import styles from "./Card.module.css";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className, interactive, onClick }: CardProps) {
  return (
    <div
      className={`${styles.card} ${interactive ? styles.interactive : ""} ${className || ""}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return <div className={`${styles.header} ${className || ""}`}>{children}</div>;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function CardBody({ children, className }: CardBodyProps) {
  return <div className={`${styles.body} ${className || ""}`}>{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return <div className={`${styles.footer} ${className || ""}`}>{children}</div>;
}
