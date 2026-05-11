import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

import useAuth from './hooks/useAuth';
import Sidebar from './components/Layout/Sidebar';
import Navbar  from './components/Layout/Navbar';

// Pages
import Login          from './pages/Login';
import ExamList       from './pages/Student/ExamList';
import ActiveExam     from './pages/Student/ActiveExam';
import Results        from './pages/Student/Results';
import History        from './pages/Student/History';
import AdminQuestions from './pages/Admin/Questions';
import AdminExams     from './pages/Admin/Exams';
import Leaderboard    from './pages/Admin/Leaderboard';
import Insights       from './pages/Admin/Insights';

// ── Route guards ──────────────────────────────────────────────────────────────
const RequireAuth = ({ children, role, user }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin/questions' : '/student/exams'} replace />;
  return children;
};

// ── Shared layout (sidebar + navbar + content) ────────────────────────────────
const AppLayout = ({ user, logout, title, children }) => (
  <div className="app-layout">
    <Sidebar user={user} onLogout={logout} />
    <div className="main-content" style={{ paddingTop: 64 }}>
      <Navbar title={title} user={user} />
      <main className="page-content">{children}</main>
    </div>
  </div>
);

const App = () => {
  const { user, isAuthenticated, login, register, logout } = useAuth();
  const [authUser, setAuthUser] = useState(user);

  const handleAuthSuccess = (u) => setAuthUser(u);
  const handleLogout = () => { logout(); setAuthUser(null); };

  const currentUser = authUser || user;

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ────────────────────────────────────────────────────────── */}
        <Route path="/login" element={
          currentUser
            ? <Navigate to={currentUser.role === 'admin' ? '/admin/questions' : '/student/exams'} replace />
            : <Login onAuthSuccess={handleAuthSuccess} />
        } />

        {/* ── Student routes ────────────────────────────────────────────────── */}
        <Route path="/student/exams" element={
          <RequireAuth user={currentUser} role="student">
            <AppLayout user={currentUser} logout={handleLogout} title="Browse Exams">
              <ExamList />
            </AppLayout>
          </RequireAuth>
        } />
        <Route path="/student/exam/:id" element={
          <RequireAuth user={currentUser} role="student">
            <AppLayout user={currentUser} logout={handleLogout} title="Active Exam">
              <ActiveExam />
            </AppLayout>
          </RequireAuth>
        } />
        <Route path="/student/results/:attemptId" element={
          <RequireAuth user={currentUser} role="student">
            <AppLayout user={currentUser} logout={handleLogout} title="Exam Results">
              <Results />
            </AppLayout>
          </RequireAuth>
        } />
        <Route path="/student/history" element={
          <RequireAuth user={currentUser} role="student">
            <AppLayout user={currentUser} logout={handleLogout} title="My Attempts">
              <History />
            </AppLayout>
          </RequireAuth>
        } />

        {/* ── Admin routes ──────────────────────────────────────────────────── */}
        <Route path="/admin/questions" element={
          <RequireAuth user={currentUser} role="admin">
            <AppLayout user={currentUser} logout={handleLogout} title="Question Bank">
              <AdminQuestions />
            </AppLayout>
          </RequireAuth>
        } />
        <Route path="/admin/exams" element={
          <RequireAuth user={currentUser} role="admin">
            <AppLayout user={currentUser} logout={handleLogout} title="Exam Management">
              <AdminExams />
            </AppLayout>
          </RequireAuth>
        } />
        <Route path="/admin/leaderboard" element={
          <RequireAuth user={currentUser} role="admin">
            <AppLayout user={currentUser} logout={handleLogout} title="Leaderboard">
              <Leaderboard />
            </AppLayout>
          </RequireAuth>
        } />
        <Route path="/admin/insights" element={
          <RequireAuth user={currentUser} role="admin">
            <AppLayout user={currentUser} logout={handleLogout} title="Question Insights">
              <Insights />
            </AppLayout>
          </RequireAuth>
        } />

        {/* ── Default redirect ──────────────────────────────────────────────── */}
        <Route path="*" element={
          <Navigate to={currentUser ? (currentUser.role === 'admin' ? '/admin/questions' : '/student/exams') : '/login'} replace />
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
