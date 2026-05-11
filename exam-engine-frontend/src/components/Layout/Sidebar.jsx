import { NavLink, useLocation } from 'react-router-dom';

const adminLinks = [
  { to: '/admin/questions', label: 'Questions', icon: '❓' },
  { to: '/admin/exams',     label: 'Exams',     icon: '📋' },
  { to: '/admin/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { to: '/admin/insights',  label: 'Insights',  icon: '📊' },
];

const studentLinks = [
  { to: '/student/exams',   label: 'Browse Exams', icon: '📚' },
  { to: '/student/history', label: 'My Attempts',  icon: '📝' },
];

const Sidebar = ({ user, onLogout }) => {
  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-text">ExamEngine</div>
        <div className="sidebar-logo-sub">Advanced MERN</div>
      </div>

      <nav className="sidebar-section">
        <div className="sidebar-section-label">
          {user?.role === 'admin' ? 'Admin Panel' : 'Student'}
        </div>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="sidebar-nav-icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
        </div>
        <button className="btn btn-outline w-full btn-sm" onClick={onLogout}>
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
