import { useEffect, useState } from 'react';
import { examAPI, analyticsAPI } from '../../api/endpoints';
import LeaderboardChart from '../../components/Dashboard/LeaderboardChart';

const Leaderboard = () => {
  const [exams, setExams]   = useState([]);
  const [examId, setExamId] = useState('');
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    examAPI.getAll().then(({ data }) => {
      setExams(data);
      if (data.length) setExamId(data[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!examId) return;
    setLoading(true);
    analyticsAPI.leaderboard(examId)
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [examId]);

  const rankStyle = (rank) => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return 'other';
  };

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1>Leaderboard</h1>
          <p>Aggregation pipeline: $group → $lookup → $setWindowFields ($rank)</p>
        </div>
        <select id="leaderboard-exam-select" className="form-select" style={{ width: 260 }}
          value={examId} onChange={(e) => setExamId(e.target.value)}>
          {exams.map((e) => <option key={e._id} value={e._id}>{e.title}</option>)}
        </select>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <div className="card-title">Score Distribution</div>
          <span className="badge badge-accent">Live Aggregation</span>
        </div>
        {loading ? <div className="loading">Running aggregation...</div> : <LeaderboardChart data={data} />}
      </div>

      {/* ── Ranking table ────────────────────────────────────────────────────── */}
      {data.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Rank</th><th>Student</th><th>Best Score</th><th>Correct</th><th>Best Time</th><th>Attempts</th></tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const mins = Math.floor((row.bestTime || 0) / 60);
                const secs = (row.bestTime || 0) % 60;
                return (
                  <tr key={row.userId}>
                    <td><span className={`rank-chip ${rankStyle(row.rank)}`}>{row.rank}</span></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{row.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.email}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-light)', fontSize: '1.1rem' }}>
                      {row.bestScore}%
                    </td>
                    <td>{row.correctAnswers}/{row.totalQuestions}</td>
                    <td>{mins}m {secs}s</td>
                    <td><span className="badge badge-info">{row.attempts}</span></td>
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

export default Leaderboard;
