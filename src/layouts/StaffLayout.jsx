import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../assets/icons';
import Avatar from '../components/ui/Avatar';
import './StaffLayout.css';

export default function StaffLayout() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="staff-layout">
      <header className="staff-header">
        <div className="staff-header-inner">
          <div className="staff-brand">
            <Icons.Logo size={24} />
            <span className="staff-brand-name">Servora Staff</span>
          </div>
          <div className="staff-profile">
            <Avatar initials={user?.name} size="sm" />
          </div>
        </div>
      </header>
      
      <main className="staff-main">
        <Outlet />
      </main>
      
      <nav className="staff-bottom-nav">
        <NavLink to="/staff" end className={({ isActive }) => `staff-nav-item ${isActive ? 'active' : ''}`}>
          <Icons.Home size={24} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/staff/orders" className={({ isActive }) => `staff-nav-item ${isActive ? 'active' : ''}`}>
          <div className="staff-nav-icon-wrapper">
            <Icons.Activity size={24} />
            <span className="staff-nav-badge">2</span>
          </div>
          <span>Orders</span>
        </NavLink>
        <NavLink to="/staff/tables" className={({ isActive }) => `staff-nav-item ${isActive ? 'active' : ''}`}>
          <Icons.Table size={24} />
          <span>Tables</span>
        </NavLink>
        <NavLink to="/staff/notifications" className={({ isActive }) => `staff-nav-item ${isActive ? 'active' : ''}`}>
          <div className="staff-nav-icon-wrapper">
            <Icons.Bell size={24} />
            <span className="staff-nav-badge">1</span>
          </div>
          <span>Alerts</span>
        </NavLink>
      </nav>
    </div>
  );
}
