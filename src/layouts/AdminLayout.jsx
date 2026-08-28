import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from '../components/ui/Sidebar';
import { Icons } from '../assets/icons';
import Avatar from '../components/ui/Avatar';
import Dropdown, { DropdownItem, DropdownDivider } from '../components/ui/Dropdown';
import ErrorBoundary from '../components/ErrorBoundary';
import './AdminLayout.css';

const ADMIN_STORAGE_KEY = 'servora-admin';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY) || 'null');
      if (stored?.token && stored?.user) {
        setToken(stored.token);
        setAdmin(stored.user);
      }
    } catch {}
    setLoading(false);
  }, []);

  const login = useCallback((newToken, user) => {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify({ token: newToken, user }));
    setToken(newToken);
    setAdmin(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setToken(null);
    setAdmin(null);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <AdminAuthContext.Provider value={{ admin, token, isAuthenticated: !!token, login, logout }}>
      <Outlet />
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}

export default function AdminLayout() {
  const { isAuthenticated, admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const sidebarItems = [
    { label: 'Overview', path: '/admin', icon: <Icons.Grid size={20} /> },
    { label: 'Restaurants', path: '/admin/restaurants', icon: <Icons.Store size={20} /> },
    { label: 'Customers', path: '/admin/customers', icon: <Icons.Users size={20} /> },
    { label: 'Revenue', path: '/admin/revenue', icon: <Icons.DollarSign size={20} /> },
    { type: 'divider' },
    { label: 'Users', path: '/admin/users', icon: <Icons.User size={20} /> },
    { label: 'System Health', path: '/admin/health', icon: <Icons.Activity size={20} /> },
  ];

  const footerItems = [
    { label: 'Back to Site', path: '/', icon: <Icons.Home size={20} /> },
  ];

  return (
    <div className="admin-layout">
      <Sidebar items={sidebarItems} footerItems={footerItems} />

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <span className="admin-badge">PLATFORM ADMIN</span>
          </div>

          <div className="admin-topbar-actions">
            <Dropdown
              align="right"
              trigger={
                <div className="admin-profile">
                  <Avatar initials={admin?.name || 'A'} size="sm" />
                  <div className="profile-info hide-mobile">
                    <span className="profile-name">{admin?.name}</span>
                    <span className="profile-role">admin</span>
                  </div>
                  <Icons.ChevronDown size={16} className="profile-chevron" />
                </div>
              }
              menu={
                <>
                  <div className="dropdown-header">
                    <span className="text-sm font-medium">{admin?.name}</span>
                    <span className="text-xs text-muted">{admin?.email}</span>
                  </div>
                  <DropdownDivider />
                  <DropdownItem icon={<Icons.Home size={16} />} onClick={() => navigate('/')}>Back to Site</DropdownItem>
                  <DropdownDivider />
                  <DropdownItem icon={<Icons.LogOut size={16} />} danger onClick={handleLogout}>Sign Out</DropdownItem>
                </>
              }
            />
          </div>
        </header>

        <main className="admin-content">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
