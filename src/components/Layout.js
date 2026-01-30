import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Layout = ({ children, role = 'admin' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getNavItems = () => {
    if (role === 'admin') {
      return [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/admin/members', label: 'Members', icon: '👥' },
        { path: '/admin/trainers', label: 'Trainers', icon: '🏋️' },
        { path: '/admin/plans', label: 'Plans', icon: '📋' },
        { path: '/admin/payments', label: 'Payments', icon: '💳' },
        { path: '/admin/attendance', label: 'Attendance', icon: '📅' },
        { path: '/admin/announcements', label: 'Announcements', icon: '📢' }
      ];
    } else if (role === 'trainer') {
      return [
        { path: '/trainer/dashboard', label: 'Dashboard', icon: '📊' }
      ];
    } else if (role === 'member') {
      return [
        { path: '/member/dashboard', label: 'Dashboard', icon: '📊' }
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <div className="page-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-logo">💪 WeFit</span>
        </div>
        
        <ul className="sidebar-nav">
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div style={{ position: 'absolute', bottom: '20px', width: 'calc(100% - 40px)' }}>
          <div style={{ 
            padding: '15px', 
            backgroundColor: 'var(--hover-bg)', 
            borderRadius: '8px',
            marginBottom: '10px'
          }}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>
              Logged in as
            </p>
            <p style={{ fontSize: '14px', fontWeight: '600' }}>{user?.username}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
              {user?.role}
            </p>
          </div>
          <button onClick={handleLogout} className="btn btn-danger" style={{ width: '100%' }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
