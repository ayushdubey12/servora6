import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/ui/Sidebar';
import { Icons } from '../assets/icons';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';
import Dropdown, { DropdownItem, DropdownDivider } from '../components/ui/Dropdown';
import Badge from '../components/ui/Badge';
import './DashboardLayout.css';

export default function DashboardLayout() {
  const { isAuthenticated, user, logout } = useAuth();

  // Protect route
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const sidebarItems = [
    { label: 'Overview', path: '/dashboard', icon: <Icons.Grid size={20} /> },
    { label: 'Live Orders', path: '/dashboard/orders', icon: <Icons.Activity size={20} />, badge: '5' },
    { label: 'Menu Management', path: '/dashboard/menu', icon: <Icons.UtensilsCrossed size={20} /> },
    { label: 'Table Map', path: '/dashboard/tables', icon: <Icons.Table size={20} /> },
    { label: 'Reservations', path: '/dashboard/reservations', icon: <Icons.Calendar size={20} /> },
    { label: 'QR Codes', path: '/dashboard/qr', icon: <Icons.QrCode size={20} /> },
    { label: 'Customers', path: '/dashboard/customers', icon: <Icons.Users size={20} /> },
    { label: 'Staff & Kitchen', path: '/dashboard/staff', icon: <Icons.ChefHat size={20} /> },
    { type: 'divider' },
    { label: 'Kitchen Display', path: '/kitchen', icon: <Icons.Monitor size={20} />, badge: 'KDS' },
    { label: 'Staff Portal', path: '/staff', icon: <Icons.User size={20} />, badge: 'STAFF' },
    { type: 'divider' },
    { label: 'Analytics', path: '/dashboard/analytics', icon: <Icons.BarChart size={20} /> },
    { label: 'Reviews', path: '/dashboard/reviews', icon: <Icons.Star size={20} /> },
    { label: 'Payments', path: '/dashboard/payments', icon: <Icons.DollarSign size={20} /> },
  ];

  const footerItems = [
    { label: 'Settings', path: '/dashboard/settings', icon: <Icons.Settings size={20} /> },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar items={sidebarItems} footerItems={footerItems} />
      
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-search">
            <div className="search-input-wrapper">
              <Icons.Search size={18} className="search-icon" />
              <input type="text" placeholder="Search orders, customers, or items..." className="search-input" />
            </div>
          </div>
          
          <div className="topbar-actions">
            <button className="topbar-btn">
              <Icons.Bell size={20} />
              <span className="topbar-badge">3</span>
            </button>
            
            <Dropdown
              align="right"
              trigger={
                <div className="topbar-profile">
                  <Avatar initials={user?.name} size="sm" />
                  <div className="profile-info hide-mobile">
                    <span className="profile-name">{user?.name}</span>
                    <span className="profile-role">{user?.role}</span>
                  </div>
                  <Icons.ChevronDown size={16} className="profile-chevron" />
                </div>
              }
              menu={
                <>
                  <div className="dropdown-header">
                    <span className="text-sm font-medium">{user?.name}</span>
                    <span className="text-xs text-muted">{user?.email}</span>
                  </div>
                  <DropdownDivider />
                  <DropdownItem icon={<Icons.User size={16} />}>My Profile</DropdownItem>
                  <DropdownItem icon={<Icons.Store size={16} />}>Restaurant Details</DropdownItem>
                  <DropdownDivider />
                  <DropdownItem icon={<Icons.LogOut size={16} />} danger onClick={logout}>Sign Out</DropdownItem>
                </>
              }
            />
          </div>
        </header>
        
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
