import './Button.css';

export default function Button({
  children, variant = 'primary', size = 'md', icon, iconRight,
  fullWidth, loading, disabled, className = '', ...props
}) {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${loading ? 'btn-loading' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="btn-spinner" />}
      {!loading && icon && <span className="btn-icon">{icon}</span>}
      {children && <span>{children}</span>}
      {!loading && iconRight && <span className="btn-icon">{iconRight}</span>}
    </button>
  );
}
