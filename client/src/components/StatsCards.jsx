import { DollarSign, CalendarDays, Activity, Tag } from 'lucide-react';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

export default function StatsCards({ stats, loading }) {
  if (loading) {
    return (
      <div className="stats-grid">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
              <div className="skeleton" style={{ height: 12, width: 80 }} />
              <div className="skeleton" style={{ height: 40, width: 40, borderRadius: 10 }} />
            </div>
            <div className="skeleton" style={{ height: 36, width: 140, marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 11, width: 90 }} />
          </div>
        ))}
      </div>
    );
  }

  const top = stats?.byCategory?.[0];

  const cards = [
    {
      label: 'Total Spent',
      value: fmt(stats?.total),
      Icon: DollarSign,
      sub: `${stats?.count || 0} transactions total`
    },
    {
      label: 'This Month',
      value: fmt(stats?.thisMonth),
      Icon: CalendarDays,
      sub: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
    },
    {
      label: 'Transactions',
      value: stats?.count ?? 0,
      Icon: Activity,
      sub: 'all time recorded'
    },
    {
      label: 'Top Category',
      value: top?._id || '—',
      Icon: Tag,
      sub: top ? fmt(top.total) + ' total' : 'No data yet'
    }
  ];

  return (
    <div className="stats-grid">
      {cards.map((c, i) => (
        <div key={i} className="stat-card">
          <div className="stat-top">
            <span className="stat-label">{c.label}</span>
            <div className="stat-icon">
              <c.Icon size={17} color="#ffffff" strokeWidth={2} />
            </div>
          </div>
          <div className="stat-value">{c.value}</div>
          <div className="stat-sub">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}
