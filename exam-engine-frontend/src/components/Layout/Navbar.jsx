const Navbar = ({ title, user, theme, toggleTheme }) => {
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <header className="navbar">
      <span className="navbar-title">{title}</span>
      <div className="navbar-user" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button 
          onClick={toggleTheme} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="navbar-avatar">{initials}</div>
          <div>
            <div className="navbar-name">{user?.name}</div>
          </div>
          <span className="navbar-role">{user?.role}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
