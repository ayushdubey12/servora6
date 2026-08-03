import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { Icons } from '../../assets/icons';
import { useState } from 'react';

export default function Sidebar({ items, footerItems, defaultCollapsed = false, className = '' }) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${className}`}>
      <div className="sidebar-header">
        {!isCollapsed && (
          <div className="sidebar-logo">
            <Icons.Logo size={24} />
            <span className="sidebar-brand">Servora</span>
          </div>
        )}
        {isCollapsed && (
          <div className="sidebar-logo-collapsed">
            <Icons.Logo size={24} />
          </div>
        )}
        <button 
          className="sidebar-toggle" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <Icons.ChevronRight size={20} /> : <Icons.ChevronLeft size={20} />}
        </button>
      </div>

      <div className="sidebar-content">
        <nav className="sidebar-nav">
          {items.map((item, index) => {
            if (item.type === 'divider') {
              return <div key={`divider-${index}`} className="sidebar-divider" />;
            }
            return (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                title={isCollapsed ? item.label : ''}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {!isCollapsed && <span className="sidebar-label">{item.label}</span>}
                {!isCollapsed && item.badge && (
                  <span className="sidebar-badge">{item.badge}</span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {footerItems && footerItems.length > 0 && (
        <div className="sidebar-footer">
          <nav className="sidebar-nav">
            {footerItems.map((item, index) => (
              <NavLink 
                key={index} 
                to={item.path} 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                title={isCollapsed ? item.label : ''}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {!isCollapsed && <span className="sidebar-label">{item.label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </aside>
  );
}
