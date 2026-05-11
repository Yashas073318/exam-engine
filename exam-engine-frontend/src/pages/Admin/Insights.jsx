import { useEffect, useState } from 'react';
import { analyticsAPI } from '../../api/endpoints';
import InsightsChart from '../../components/Dashboard/InsightsChart';

const Insights = () => {
  const [data, setData]       = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsAPI.insights(), analyticsAPI.summary()])
      .then(([ins, sum]) => { setData(ins.data); setSummary(sum.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const failureColor = (rate) => {
    if (rate >= 0.7) return 'var(--danger)';
    if (rate >= 0.4) return 'var(--warning)';
    return 'var(--success)';
  };

  return (
    <div>
      <div className="page-header">
        <h1>Question Insights</h1>
        <p>Aggregation pipeline: $unwind → $lookup (cross-collection join) → $group → $addFields (failureRate)</p>
      </div>

      {summary && (
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-label">Total Attempts</div>
            <div className="stat-value">{summary.totalAttempts}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Score</div>
            <div className="stat-value text-accent">{summary.avgScore}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Highest Score</div>
            <div className="stat-value text-success">{summary.maxScore}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Lowest Score</div>
            <div className="stat-value text-danger">{summary.minScore}%</div>
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <div className="card-title">Question Failure Rate (Top 10 Hardest)</div>
          <span className="badge badge-danger">$unwind + $lookup</span>
        </div>
        {loading ? <div className="loading">Running aggregation pipeline...</div> : <InsightsChart data={data} />}
      </div>

      {/* ── Full table ────────────────────────────────────────────────────────── */}
      {!loading && data.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>#</th><th>Question</th><th>Topic</th><th>Difficulty</th><th>Attempts</th><th>Wrong</th><th>Failure Rate</th></tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={row.questionId}>
                  <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {row.questionText}
                  </td>
                  <td><span className="badge badge-info">{row.topic}</span></td>
                  <td><span className="badge badge-accent">{row.difficulty}</span></td>
                  <td>{row.totalAttempts}</td>
                  <td>{row.wrongAnswers}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: failureColor(row.failureRate) }}>
                      {(row.failureRate * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Insights;
