import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
  ReferenceLine, LabelList,
} from 'recharts';

/* ── Custom tooltip ─────────────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        fontSize: '0.82rem',
        minWidth: 140,
      }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>
          Score: {d.label}
        </div>
        <div style={{ color: 'var(--accent-light)', fontWeight: 600, fontSize: '1.1rem' }}>
          {d.count} student{d.count !== 1 ? 's' : ''}
        </div>
      </div>
    );
  }
  return null;
};

/* ── Component ──────────────────────────────────────────────────────────── */
/**
 * props:
 *   data     – array of { band, label, count } from /analytics/score-distribution
 *   passMark – number (e.g. 50) — drawn as a red reference line
 */
const LeaderboardChart = ({ data = [], passMark = 50 }) => {
  if (!data.length) {
    return (
      <div className="loading">No score data yet — submit some attempts first.</div>
    );
  }

  // Compute average for reference line (weighted by band lower bound)
  const totalStudents = data.reduce((s, d) => s + d.count, 0);
  const weightedSum   = data.reduce((s, d) => s + d.band * d.count, 0);
  const avgBand       = totalStudents > 0 ? Math.round(weightedSum / totalStudents) : 0;

  const barColor = (band) => {
    if (band >= passMark) return '#10b981';  // green — passing range
    return '#ef4444';                         // red   — failing range
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 24, left: 0, bottom: 10 }}
        barCategoryGap="18%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />

        <XAxis
          dataKey="label"
          tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
          axisLine={{ stroke: 'var(--border)' }}
          tickLine={false}
        />

        <YAxis
          allowDecimals={false}
          tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          label={{
            value: 'Students',
            angle: -90,
            position: 'insideLeft',
            offset: 10,
            style: { fill: 'var(--text-muted)', fontSize: 11 },
          }}
        />

        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(108,99,255,0.07)' }} />

        {/* Pass-mark line */}
        <ReferenceLine
          x={`${passMark}–${passMark + 10}%`}
          stroke="var(--warning)"
          strokeDasharray="5 4"
          strokeWidth={1.5}
          label={{
            value: `Pass ${passMark}%`,
            position: 'top',
            fill: 'var(--warning)',
            fontSize: 11,
            fontWeight: 600,
          }}
        />

        {/* Average band line */}
        <ReferenceLine
          x={`${avgBand}–${avgBand + 10}%`}
          stroke="var(--accent-light)"
          strokeDasharray="4 3"
          strokeWidth={1.5}
          label={{
            value: `Avg ~${avgBand}%`,
            position: 'insideTopRight',
            fill: 'var(--accent-light)',
            fontSize: 10,
            fontWeight: 600,
          }}
        />

        <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={52}>
          {data.map((d, i) => (
            <Cell key={i} fill={barColor(d.band)} fillOpacity={0.85} />
          ))}
          <LabelList
            dataKey="count"
            position="top"
            style={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 600 }}
            formatter={(v) => (v > 0 ? v : '')}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default LeaderboardChart;
