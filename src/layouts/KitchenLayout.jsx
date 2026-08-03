import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../assets/icons';
import './KitchenLayout.css';

export default function KitchenLayout() {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="kitchen-layout">
      <header className="kitchen-header">
        <div className="kitchen-header-left">
          <Icons.Logo size={28} />
          <h1 className="kitchen-title">Kitchen Display System</h1>
        </div>
        
        <div className="kitchen-header-right">
          <div className="kitchen-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <button className="kitchen-logout" onClick={logout}>
            <Icons.LogOut size={20} />
            <span>Exit</span>
          </button>
        </div>
      </header>
      
      <main className="kitchen-main">
        <Outlet />
      </main>
    </div>
  );
}
