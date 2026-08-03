import './Avatar.css';

export default function Avatar({ src, alt, initials, size = 'md', className = '' }) {
  return (
    <div className={`avatar avatar-${size} ${className}`}>
      {src ? (
        <img src={src} alt={alt || 'Avatar'} className="avatar-image" />
      ) : (
        <span className="avatar-initials">{initials?.substring(0, 2).toUpperCase() || '?'}</span>
      )}
    </div>
  );
}
