import './Card.css';

export default function Card({ children, className = '', padding = true, hover = false, onClick, ...props }) {
  return (
    <div
      className={`card ${padding ? 'card-padded' : ''} ${hover ? 'card-hover' : ''} ${onClick ? 'card-clickable' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
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
