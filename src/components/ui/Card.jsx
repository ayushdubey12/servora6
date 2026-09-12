import { motion } from "motion/react";
import './Card.css';

export default function Card({ children, className = '', padding = true, hover = false, onClick, ...props }) {
  return (
    <motion.div
      className={`card ${padding ? 'card-padded' : ''} ${hover ? 'card-hover' : ''} ${onClick ? 'card-clickable' : ''} ${className}`}
      onClick={onClick}
      whileHover={hover ? { y: -8, scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className = '', action }) {
  return (
    <div className={`card-header ${className}`}>
      <div className="card-header-content">{children}</div>
      {action && <div className="card-header-action">{action}</div>}
    </div>
  );
}

export function CardTitle({ children, subtitle, className = '' }) {
  return (
    <div className={className}>
      <h3 className="card-title">{children}</h3>
      {subtitle && <p className="card-subtitle">{subtitle}</p>}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`card-body ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`card-footer ${className}`}>{children}</div>;
}
