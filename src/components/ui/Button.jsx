import { motion } from "motion/react";
import './Button.css';

export default function Button({
  children, variant = 'primary', size = 'md', icon, iconRight,
  fullWidth, loading, disabled, className = '', as, ...props
}) {
  const Component = as || 'button';
  const isLink = Component === 'a' || Component?.displayName === 'Link';

  return (
    <motion.button
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${loading ? 'btn-loading' : ''} ${className}`}
      disabled={!isLink && (disabled || loading)}
      whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {loading && <span className="btn-spinner" />}
      {!loading && icon && <span className="btn-icon">{icon}</span>}
      {children && <span>{children}</span>}
      {!loading && iconRight && <span className="btn-icon">{iconRight}</span>}
    </motion.button>
  );
}
