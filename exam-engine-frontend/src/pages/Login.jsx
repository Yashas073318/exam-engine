import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Login = ({ onAuthSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm]   = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let user;
      if (isRegister) {
        user = await register(form.name, form.email, form.password, form.role);
      } else {
        user = await login(form.email, form.password);
      }
      onAuthSuccess(user);
      navigate(user.role === 'admin' ? '/admin/questions' : '/student/exams');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <h1>ExamEngine</h1>
          <p>Advanced MERN · Mongoose · Aggregations · Transactions</p>
        </div>

        {error && <div className="error-msg">⚠️ {error}</div>}

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
              placeholder="••••••••"
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
            {loading ? '⏳ Please wait...' : isRegister ? '🚀 Create Account' : '🔐 Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <button
            id="login-toggle-btn"
            onClick={() => setIsRegister(!isRegister)}
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
