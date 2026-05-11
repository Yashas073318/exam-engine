import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.82rem',
        maxWidth: 260,
      }}>
        <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
          {d.questionText}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          Topic: {d.topic} · {d.difficulty}
        </div>
        <div style={{ color: 'var(--danger)', fontWeight: 700, marginTop: 6, fontSize: '1rem' }}>
          {(d.failureRate * 100).toFixed(1)}% failure rate
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
          {d.wrongAnswers} wrong / {d.totalAttempts} attempts
        </div>
      </div>
    );
  }
  return null;
};

const getBarColor = (rate) => {
  if (rate >= 0.7) return '#ef4444';
  if (rate >= 0.4) return '#f59e0b';
  return '#10b981';
};

const InsightsChart = ({ data = [] }) => {
  if (!data.length) return <div className="loading">No insights data yet. Submit some attempts first.</div>;

  const top10 = data.slice(0, 10).map((d, i) => ({
    ...d,
    label: `Q${i + 1}`,
    failurePct: parseFloat((d.failureRate * 100).toFixed(1)),
  }));

  return (
    <ResponsiveContainer width="100%" height={340}>
      <BarChart
        data={top10}
        layout="vertical"
        margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
          tickFormatter={(v) => `${v}%`}
        />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
          width={36}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(239,68,68,0.06)' }} />
        <Bar dataKey="failurePct" radius={[0, 6, 6, 0]}>
          {top10.map((d, i) => (
            <Cell key={i} fill={getBarColor(d.failureRate)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default InsightsChart;
