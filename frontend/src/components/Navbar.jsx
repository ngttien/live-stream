import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="flex items-center gap-lg">
        <Link to="/" className="navbar-brand">
          <span className="icon">▶</span>
          <span>Streemly</span>
        </Link>
      </div>

      <div className="navbar-nav">
        <Link to="/watch" className="navbar-link">
          Khám phá
        </Link>

        {user ? (
          <>
            <Link to="/stream" className="navbar-link">
              Stream
            </Link>

            <div className="navbar-user">
              <div className="navbar-avatar">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontWeight: 500 }}>{user.username}</span>
              <button
                onClick={handleLogout}
                className="btn-icon"
                style={{ width: '32px', height: '32px', fontSize: '18px' }}
                title="Đăng xuất"
              >
                ⏻
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">
              Đăng nhập
            </Link>
            <Link to="/register">
              <button className="btn-primary">
                Đăng ký
              </button>
            </Link>
          </>
        )}

        <button
          onClick={toggleTheme}
          className="theme-toggle"
          title={theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
