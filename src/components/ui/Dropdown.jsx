import { useState, useRef, useEffect } from 'react';
import { Icons } from '../../assets/icons';
import './Dropdown.css';

export default function Dropdown({ trigger, menu, align = 'right', className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`dropdown ${className}`} ref={dropdownRef}>
      <div className="dropdown-trigger" onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div className={`dropdown-menu dropdown-menu-${align} animate-scale-in`}>
          {menu}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ children, onClick, icon, danger, className = '', ...props }) {
  return (
    <button 
      className={`dropdown-item ${danger ? 'text-error' : ''} ${className}`}
      onClick={(e) => {
        if (onClick) onClick(e);
      }}
      {...props}
    >
      {icon && <span className="dropdown-item-icon">{icon}</span>}
      {children}
    </button>
  );
}

export function DropdownDivider() {
  return <div className="dropdown-divider"></div>;
}
