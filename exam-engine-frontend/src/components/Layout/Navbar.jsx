const Navbar = ({ title, user }) => {
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <header className="navbar">
      <span className="navbar-title">{title}</span>
      <div className="navbar-user">
        <div className="navbar-avatar">{initials}</div>
        <div>
          <div className="navbar-name">{user?.name}</div>
        </div>
        <span className="navbar-role">{user?.role}</span>
      </div>
    </header>
  );
};

export default Navbar;
