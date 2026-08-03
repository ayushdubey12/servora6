import './Toggle.css';

export default function Toggle({ checked, onChange, label, disabled, className = '' }) {
  return (
    <label className={`toggle-container ${disabled ? 'disabled' : ''} ${className}`}>
      <div className="toggle-track" onClick={() => !disabled && onChange && onChange(!checked)}>
        <input
          type="checkbox"
          className="toggle-input"
          checked={checked}
          onChange={(e) => !disabled && onChange && onChange(e.target.checked)}
          disabled={disabled}
        />
        <div className="toggle-thumb"></div>
      </div>
      {label && <span className="toggle-label">{label}</span>}
    </label>
  );
}
