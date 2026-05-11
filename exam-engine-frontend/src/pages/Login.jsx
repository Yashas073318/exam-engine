import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Login = ({ onAuthSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm]   = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);

  // Ref-based lock: keeps error visible even if something triggers re-render
  const errorLockRef  = useRef(false);
  const errorTimerRef = useRef(null);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const showError = (msg) => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);

    errorLockRef.current = true;
    setError(msg);

    // Shake the box
    setShaking(true);
    setTimeout(() => setShaking(false), 600);

    // Auto-dismiss after 8 seconds
    errorTimerRef.current = setTimeout(() => {
      errorLockRef.current = false;
      setError('');
    }, 8000);
  };

  const dismissError = () => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorLockRef.current = false;
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only clear the old error if the lock has expired
    if (!errorLockRef.current) setError('');

    setLoading(true);
    try {
      let user;
      if (isRegister) {
        user = await register(form.name, form.email, form.password, form.role);
      } else {
        user = await login(form.email, form.password);
      }
      dismissError();
      onAuthSuccess(user);
      navigate(user.role === 'admin' ? '/admin/questions' : '/student/exams');
    } catch (err) {
      showError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className={`login-box${shaking ? ' shake' : ''}`}>
        <div className="login-logo">
          <h1>ExamEngine</h1>
          <p>Advanced MERN · Mongoose · Aggregations · Transactions</p>
        </div>

        {error && (
          <div className="error-msg" role="alert">
            <span className="error-msg-icon">&#9888;&#65039;</span>
            <span className="error-msg-text">{error}</span>
            <button
              className="error-msg-close"
              aria-label="Dismiss error"
              onClick={dismissError}
            >
              &#x2715;
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label" htmlFor="login-name">Full Name</label>
              <input
                id="login-name"
                className="form-input"
                name="name"
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className="form-input"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="form-input"
              name="password"
              type="password"
              placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label" htmlFor="login-role">Role</label>
              <select
                id="login-role"
                className="form-select"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <button
            id="login-submit-btn"
            type="submit"
            className="btn btn-primary btn-lg w-full"
            style={{ marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <button
            id="login-toggle-btn"
            onClick={() => { setIsRegister(!isRegister); dismissError(); }}
            style={{ background: 'none', border: 'none', color: 'var(--accent-light)', fontWeight: 600, cursor: 'pointer' }}
          >
            {isRegister ? 'Sign In' : 'Register'}
          </button>
        </div>

        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text-secondary)' }}>Demo credentials</strong><br />
          Admin: admin@examengine.dev / admin123<br />
          Student: alice@student.dev / student123
        </div>
      </div>
    </div>
  );
};

export default Login;
