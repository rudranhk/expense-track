import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

/* Silver-to-charcoal spectrum for the donut */
const CAT_COLORS = {
  Food:          '#ffffff',
  Transport:     '#d8d8d8',
  Shopping:      '#b0b0b0',
  Entertainment: '#909090',
  Health:        '#6e6e6e',
  Education:     '#525252',
  Bills:         '#383838',
  Other:         '#272727'
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const fmtY = (v) => v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`;

function Tip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div style={{
      background: '#161616',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 8, padding: '10px 15px',
      fontSize: '0.8rem', color: '#fff',
      boxShadow: '0 8px 32px rgba(0,0,0,0.9)'
    }}>
      <div style={{ fontWeight: 700, marginBottom: 3 }}>{p.name || p.dataKey}</div>
      <div style={{ color: '#aaa', fontWeight: 600 }}>${Number(p.value).toLocaleString()}</div>
    </div>
  );
}

export default function Charts({ stats, loading }) {
  if (loading || !stats) {
    return (
      <div className="charts-grid">
        {[1, 2].map(i => (
          <div key={i} className="chart-card">
            <div className="skeleton" style={{ height: 14, width: 140, marginBottom: 22 }} />
            <div className="skeleton" style={{ height: 210, borderRadius: 14 }} />
          </div>
        ))}
      </div>
    );
  }

  const pieData = (stats.byCategory || []).map(c => ({
    name: c._id,
    value: Math.round(c.total),
    color: CAT_COLORS[c._id] || '#303030'
  }));

  const barData = (stats.byMonth || []).map(m => ({
    name: MONTHS[m._id.month - 1],
    amount: Math.round(m.total)
  }));

  const empty = (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: 200, color: '#333', fontSize: '0.82rem', fontWeight: 500
    }}>
      No data — add your first expense
    </div>
  );

  return (
    <div className="charts-grid">

      {/* ── Category Donut ── */}
      <div className="chart-card">
        <div className="chart-heading">
          <span className="chart-heading-dot" />
          Spending by Category
        </div>
        {pieData.length === 0 ? empty : (
          <>
            <ResponsiveContainer width="100%" height={196}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={84}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<Tip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="legend-list">
              {pieData.map((item, i) => (
                <div key={i} className="legend-row">
                  <div className="legend-left">
                    <div className="legend-dot" style={{ background: item.color }} />
                    {item.name}
                  </div>
                  <div className="legend-amount">${item.value.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Monthly Bar Chart ── */}
      <div className="chart-card">
        <div className="chart-heading">
          <span className="chart-heading-dot" />
          Monthly Spending
        </div>
        {barData.length === 0 ? empty : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData} barCategoryGap="38%">
              <defs>
                <linearGradient id="bwGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#ffffff" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity={0.18} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="name"
                tick={{ fill: '#444', fontSize: 11, fontWeight: 500 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tickFormatter={fmtY}
                tick={{ fill: '#444', fontSize: 11, fontWeight: 500 }}
                axisLine={false} tickLine={false}
                width={52}
              />
              <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar
                dataKey="amount" name="Amount"
                fill="url(#bwGrad)"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
}
