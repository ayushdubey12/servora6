import { useState } from 'react';
import { Icons } from '../../assets/icons';
import './Input.css';

export default function Input({
  label, type = 'text', error, hint, icon,
  className = '', id, ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || `input-${label?.toLowerCase().replace(/\s/g, '-')}`;
  const isPassword = type === 'password';

  return (
    <div className={`input-group ${error ? 'input-error' : ''} ${className}`}>
      {label && <label htmlFor={inputId} className="input-label">{label}</label>}
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          id={inputId}
          type={isPassword && showPassword ? 'text' : type}
          className={`input-field ${icon ? 'input-with-icon' : ''}`}
          {...props}
        />
        {isPassword && (
          <button type="button" className="input-toggle" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
          </button>
        )}
      </div>
      {error && <span className="input-error-text">{error}</span>}
      {hint && !error && <span className="input-hint">{hint}</span>}
    </div>
  );
}

export function Textarea({ label, error, hint, className = '', id, ...props }) {
  const inputId = id || `textarea-${label?.toLowerCase().replace(/\s/g, '-')}`;
  return (
    <div className={`input-group ${error ? 'input-error' : ''} ${className}`}>
      {label && <label htmlFor={inputId} className="input-label">{label}</label>}
      <textarea id={inputId} className="input-field input-textarea" {...props} />
      {error && <span className="input-error-text">{error}</span>}
      {hint && !error && <span className="input-hint">{hint}</span>}
    </div>
  );
}

export function Select({ label, options = [], error, className = '', id, ...props }) {
  const inputId = id || `select-${label?.toLowerCase().replace(/\s/g, '-')}`;
  return (
    <div className={`input-group ${error ? 'input-error' : ''} ${className}`}>
      {label && <label htmlFor={inputId} className="input-label">{label}</label>}
      <div className="input-wrapper">
        <select id={inputId} className="input-field input-select" {...props}>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="input-select-arrow"><Icons.ChevronDown size={16} /></span>
      </div>
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
}
