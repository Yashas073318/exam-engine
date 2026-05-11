import { useEffect, useState } from 'react';
import { examAPI, analyticsAPI } from '../../api/endpoints';
import LeaderboardChart from '../../components/Dashboard/LeaderboardChart';

const Leaderboard = () => {
  const [exams, setExams]       = useState([]);
  const [examId, setExamId]     = useState('');
  const [examMeta, setExamMeta] = useState(null);   // for passMark
  const [data, setData]         = useState([]);      // ranked rows
  const [distrib, setDistrib]   = useState([]);      // score distribution buckets
  const [loading, setLoading]   = useState(false);

  // ── Load exam list once ─────────────────────────────────────────────────
  useEffect(() => {
    examAPI.getAll().then(({ data: exs }) => {
      setExams(exs);
      if (exs.length) {
        setExamId(exs[0]._id);
        setExamMeta(exs[0]);
      }
    });
  }, []);

  // ── Re-fetch leaderboard + distribution whenever exam changes ───────────
  useEffect(() => {
    if (!examId) return;
    setLoading(true);

    const meta = exams.find((e) => e._id === examId);
    setExamMeta(meta || null);

    Promise.all([
      analyticsAPI.leaderboard(examId),
      analyticsAPI.scoreDistribution(examId),
    ])
      .then(([lb, sd]) => {
        setData(lb.data);
        setDistrib(sd.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [examId, exams]);

  const rankStyle = (rank) => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return 'other';
  };

  return (
    <div>
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="page-header flex-between">
        <div>
          <h1>Leaderboard</h1>
          <p>Aggregation pipeline: $group → $lookup → $setWindowFields ($rank)</p>
        </div>
        <select
          id="leaderboard-exam-select"
          className="form-select"
          style={{ width: 260 }}
          value={examId}
          onChange={(e) => setExamId(e.target.value)}
        >
          {exams.map((e) => (
            <option key={e._id} value={e._id}>{e.title}</option>
          ))}
        </select>
      </div>

      {/* ── Score Distribution histogram ──────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <div>
            <div className="card-title">Score Distribution</div>
            <div className="card-subtitle" style={{ marginTop: '0.25rem' }}>
              $bucket pipeline · 10-point bands · green = pass, red = fail
            </div>
          </div>
          <span className="badge badge-accent">$bucket Aggregation</span>
        </div>

        {loading ? (
          <div className="loading">Running aggregation…</div>
        ) : (
          <LeaderboardChart
            data={distrib}
            passMark={examMeta?.passMark ?? 50}
          />
        )}
      </div>

      {/* ── Ranking table ─────────────────────────────────────────────────── */}
      {data.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: '1.25rem 1.5rem' }}>
            <div className="card-title">🏆 Rankings</div>
            <span className="badge badge-info">{data.length} students</span>
          </div>
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student</th>
                  <th>Best Score</th>
                  <th>Correct</th>
                  <th>Best Time</th>
                  <th>Attempts</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => {
                  const mins = Math.floor((row.bestTime || 0) / 60);
                  const secs = (row.bestTime || 0) % 60;
                  return (
                    <tr key={row.userId || row.name}>
                      <td>
                        <span className={`rank-chip ${rankStyle(row.rank)}`}>
                          {row.rank}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{row.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {row.email}
                        </div>
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
        </div>
      )}

      {!loading && data.length === 0 && (
        <div className="loading">No attempts for this exam yet.</div>
      )}
    </div>
  );
};

export default Leaderboard;
