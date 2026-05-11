import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { attemptAPI } from '../../api/endpoints';

const History = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    attemptAPI.getMyAll()
      .then(({ data }) => setAttempts(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading history...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>My Attempts</h1>
        <p>Review your past exam submissions.</p>
      </div>

      {attempts.length === 0 ? (
        <div className="loading">No attempts yet. <Link to="/student/exams">Take an exam!</Link></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Exam</th>
                <th>Score</th>
                <th>Correct</th>
                <th>Time Taken</th>
                <th>Result</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => {
                const passed = a.score >= (a.exam?.passMark || 50);
                const mins = Math.floor((a.timeTaken || 0) / 60);
                const secs = (a.timeTaken || 0) % 60;
                return (
                  <tr key={a._id}>
                    <td style={{ fontWeight: 600 }}>{a.exam?.title}</td>
                    <td style={{ fontWeight: 700, color: passed ? 'var(--success)' : 'var(--danger)' }}>
                      {a.score}%
                    </td>
                    <td>{a.correctAnswers}/{a.totalQuestions}</td>
                    <td>{mins}m {secs}s</td>
                    <td>
                      <span className={`badge ${passed ? 'badge-success' : 'badge-danger'}`}>
                        {passed ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {new Date(a.submittedAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Link to={`/student/results/${a._id}`} className="btn btn-outline btn-sm">
                        Review
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default History;
