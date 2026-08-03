import './ProgressBar.css';

export default function ProgressBar({ progress = 0, label, className = '' }) {
  const normalizedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`progress-bar-container ${className}`}>
      {label && (
        <div className="progress-bar-label">
          <span className="progress-bar-title">{label}</span>
          <span className="progress-bar-value">{Math.round(normalizedProgress)}%</span>
        </div>
      )}
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${normalizedProgress}%` }}></div>
      </div>
    </div>
  );
}
