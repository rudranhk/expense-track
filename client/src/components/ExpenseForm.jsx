import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import axios from 'axios';

const CATS = [
  { name: 'Food',          emoji: '🍔' },
  { name: 'Transport',     emoji: '🚗' },
  { name: 'Shopping',      emoji: '🛍️' },
  { name: 'Entertainment', emoji: '🎬' },
  { name: 'Health',        emoji: '💊' },
  { name: 'Education',     emoji: '📚' },
  { name: 'Bills',         emoji: '📋' },
  { name: 'Other',         emoji: '📌' }
];

const toDateInput = (raw) => {
  if (!raw) return new Date().toISOString().split('T')[0];
  return new Date(raw).toISOString().split('T')[0];
};

export default function ExpenseForm({ expense, onSubmit, onClose }) {
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: 'Other',
    date: new Date().toISOString().split('T')[0]
  });
  const [saving, setSaving] = useState(false);
  const [aiSuggest, setAiSuggest] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const desc = form.description.trim();
    if (desc.length < 4) { setAiSuggest(null); return; }
    const t = setTimeout(async () => {
      setAiLoading(true);
      try {
        const { data } = await axios.post('/api/ai/categorize', { description: desc });
        if (data.category) setAiSuggest(data.category);
      } catch {}
      setAiLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, [form.description]);

  useEffect(() => {
    if (expense) {
      setForm({
        description: expense.description || '',
        amount: expense.amount?.toString() || '',
        category: expense.category || 'Other',
        date: toDateInput(expense.date)
      });
    }
  }, [expense]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.description.trim() || !form.amount) return;
    setSaving(true);
    try {
      await onSubmit({ ...form, amount: parseFloat(form.amount) });
    } finally {
      setSaving(false);
    }
  };

  const isValid = form.description.trim() && parseFloat(form.amount) > 0;

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="drawer" role="dialog" aria-modal="true">

        {/* Head */}
        <div className="drawer-head">
          <h2 className="drawer-title">
            {expense ? 'Edit Expense' : 'New Expense'}
          </h2>
          <button className="btn-close" onClick={onClose} aria-label="Close">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="drawer-body">

          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              className="form-input"
              placeholder="e.g. Grocery shopping, Uber ride…"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
            {(aiLoading || aiSuggest) && (
              <div className="ai-suggest">
                {aiLoading ? (
                  <span className="ai-suggest-loading">
                    <Sparkles size={10} /> Detecting category…
                  </span>
                ) : (
                  <button
                    type="button"
                    className="ai-suggest-chip"
                    onClick={() => { set('category', aiSuggest); setAiSuggest(null); }}
                  >
                    <Sparkles size={10} />
                    AI suggests: {aiSuggest} — Apply
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Amount (USD)</label>
            <div className="amount-wrap">
              <span className="amount-symbol">$</span>
              <input
                className="form-input"
                style={{ paddingLeft: 28 }}
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                value={form.amount}
                onChange={e => set('amount', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <div className="cat-grid">
              {CATS.map(c => (
                <button
                  key={c.name}
                  type="button"
                  className={`cat-btn${form.category === c.name ? ' active' : ''}`}
                  onClick={() => set('category', c.name)}
                >
                  <span className="cat-emoji">{c.emoji}</span>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              className="form-input"
              type="date"
              value={form.date}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => set('date', e.target.value)}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="drawer-foot">
          <button className="btn-cancel" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            className="btn-save"
            onClick={handleSubmit}
            disabled={saving || !isValid}
          >
            {saving ? 'Saving…' : expense ? 'Update Expense' : 'Add Expense'}
          </button>
        </div>

      </div>
    </>
  );
}
