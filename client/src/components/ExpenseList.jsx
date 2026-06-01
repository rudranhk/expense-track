import { useState } from 'react';
import { Search, Pencil, Trash2 } from 'lucide-react';

const CATS = ['all','Food','Transport','Shopping','Entertainment','Health','Education','Bills','Other'];

/* B&W category chips — white to near-black spectrum */
const CAT_STYLE = {
  Food:          { bg: 'rgba(255,255,255,0.09)', color: '#ffffff', border: 'rgba(255,255,255,0.18)', emoji: '🍔' },
  Transport:     { bg: 'rgba(255,255,255,0.07)', color: '#d8d8d8', border: 'rgba(255,255,255,0.14)', emoji: '🚗' },
  Shopping:      { bg: 'rgba(255,255,255,0.06)', color: '#bebebe', border: 'rgba(255,255,255,0.12)', emoji: '🛍️' },
  Entertainment: { bg: 'rgba(255,255,255,0.05)', color: '#a0a0a0', border: 'rgba(255,255,255,0.10)', emoji: '🎬' },
  Health:        { bg: 'rgba(255,255,255,0.05)', color: '#888888', border: 'rgba(255,255,255,0.08)', emoji: '💊' },
  Education:     { bg: 'rgba(255,255,255,0.04)', color: '#707070', border: 'rgba(255,255,255,0.08)', emoji: '📚' },
  Bills:         { bg: 'rgba(255,255,255,0.04)', color: '#606060', border: 'rgba(255,255,255,0.07)', emoji: '📋' },
  Other:         { bg: 'rgba(255,255,255,0.03)', color: '#505050', border: 'rgba(255,255,255,0.06)', emoji: '📌' }
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const fmtAmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

export default function ExpenseList({ expenses, loading, filters, onFilterChange, onDelete, onEdit }) {
  const [confirmId, setConfirmId] = useState(null);

  const handleDelete = (id) => {
    if (confirmId === id) {
      onDelete(id);
      setConfirmId(null);
    } else {
      setConfirmId(id);
      setTimeout(() => setConfirmId(null), 3000);
    }
  };

  return (
    <div className="expense-section">

      {/* ── Header ── */}
      <div className="expense-header">
        <div className="expense-header-left">
          <span className="expense-title">Transactions</span>
          {!loading && <span className="count-badge">{expenses.length}</span>}
        </div>
        <div className="filter-row">
          <div className="search-box">
            <Search size={13} color="#444" />
            <input
              placeholder="Search expenses…"
              value={filters.search}
              onChange={e => onFilterChange({ ...filters, search: e.target.value })}
            />
          </div>
          <select
            className="filter-select"
            value={filters.category}
            onChange={e => onFilterChange({ ...filters, category: e.target.value })}
          >
            {CATS.map(c => (
              <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Body ── */}
      {loading ? (
        <div style={{ padding: '12px 26px' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ display:'flex', gap:16, padding:'14px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              <div className="skeleton" style={{ flex:1, height:12 }} />
              <div className="skeleton" style={{ width:100, height:12 }} />
              <div className="skeleton" style={{ width:88, height:12 }} />
              <div className="skeleton" style={{ width:72, height:12 }} />
            </div>
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💸</div>
          <h3>No expenses found</h3>
          <p>
            {(filters.search || filters.category !== 'all')
              ? 'Try adjusting your search or filter'
              : 'Hit "Add Expense" to record your first transaction'}
          </p>
        </div>
      ) : (
        <>
          <div className="tbl-head">
            <span>Description</span>
            <span>Category</span>
            <span>Date</span>
            <span>Amount</span>
            <span>Actions</span>
          </div>
          {expenses.map(exp => {
            const st = CAT_STYLE[exp.category] || CAT_STYLE.Other;
            return (
              <div key={exp._id} className="exp-row">

                <div>
                  <div className="exp-desc">{exp.description}</div>
                  <div className="exp-subdate">{fmtDate(exp.date)}</div>
                </div>

                <div>
                  <span
                    className="cat-chip"
                    style={{ background: st.bg, color: st.color, borderColor: st.border }}
                  >
                    {st.emoji} {exp.category}
                  </span>
                </div>

                <div className="exp-date">{fmtDate(exp.date)}</div>

                <div className="exp-amount">{fmtAmt(exp.amount)}</div>

                <div className="exp-actions">
                  <button className="btn-icon" onClick={() => onEdit(exp)} title="Edit">
                    <Pencil size={12} />
                  </button>
                  <button
                    className={`btn-icon del${confirmId === exp._id ? ' confirm' : ''}`}
                    onClick={() => handleDelete(exp._id)}
                    title={confirmId === exp._id ? 'Click again to confirm' : 'Delete'}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
