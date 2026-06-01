import { Plus, Wallet } from 'lucide-react';

export default function Header({ onAdd }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo-wrap">
          <div className="logo-icon">
            <Wallet size={18} color="#000000" strokeWidth={2.5} />
          </div>
          <div>
            <div className="logo-name">ExpenseFlow</div>
            <div className="logo-tagline">Personal Finance</div>
          </div>
        </div>
        <button className="btn-add" onClick={onAdd}>
          <Plus size={14} strokeWidth={3} />
          Add Expense
        </button>
      </div>
    </header>
  );
}
