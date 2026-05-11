import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const COLORS = ['#6c63ff', '#8b84ff', '#a78bfa', '#c4b5fd', '#818cf8', '#7c3aed'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.82rem',
      }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Rank #{d.rank}</div>
        <div style={{ color: 'var(--text-secondary)' }}>{d.name}</div>
        <div style={{ color: 'var(--accent-light)', fontWeight: 600, marginTop: 4 }}>
          Score: {d.bestScore}%
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          Attempts: {d.attempts}
        </div>
      </div>
    );
  }
  return null;
};

const LeaderboardChart = ({ data = [] }) => {
  if (!data.length) return <div className="loading">No leaderboard data yet.</div>;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
        <XAxis
          dataKey="name"
          tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
          angle={-25} textAnchor="end"
          interval={0}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(108,99,255,0.08)' }} />
        <Bar dataKey="bestScore" radius={[6, 6, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default LeaderboardChart;
