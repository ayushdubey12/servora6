import { Icons } from '../../assets/icons';
import './Input.css'; // Reuse input styles

export default function SearchBar({ placeholder = 'Search...', value, onChange, className = '', ...props }) {
  return (
    <div className={`input-group ${className}`}>
      <div className="input-wrapper">
        <span className="input-icon"><Icons.Search size={18} /></span>
        <input
          type="search"
          className="input-field input-with-icon"
          placeholder={placeholder}
          value={value}
          onChange={e => onChange && onChange(e.target.value)}
          {...props}
        />
      </div>
    </div>
  );
}
