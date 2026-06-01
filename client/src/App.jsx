import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import StatsCards from './components/StatsCards.jsx';
import Charts from './components/Charts.jsx';
import AIInsights from './components/AIInsights.jsx';
import ExpenseList from './components/ExpenseList.jsx';
import ExpenseForm from './components/ExpenseForm.jsx';
import AIChat from './components/AIChat.jsx';
import { getExpenses, getStats, createExpense, updateExpense, deleteExpense } from './api/expenses.js';

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filters, setFilters] = useState({ category: 'all', search: '', startDate: '', endDate: '' });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.category !== 'all') params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const [expRes, statsRes] = await Promise.all([getExpenses(params), getStats()]);
      setExpenses(expRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddExpense = async (data) => {
    await createExpense(data);
    setFormOpen(false);
    fetchData();
  };

  const handleUpdateExpense = async (id, data) => {
    await updateExpense(id, data);
    setEditingExpense(null);
    setFormOpen(false);
    fetchData();
  };

  const handleDeleteExpense = async (id) => {
    await deleteExpense(id);
    fetchData();
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingExpense(null);
  };

  return (
    <div className="app">
      <Header onAdd={() => setFormOpen(true)} />
      <main className="main-content">
        <StatsCards stats={stats} loading={loading} />
        <Charts stats={stats} loading={loading} />
        <AIInsights stats={stats} expenses={expenses} />
        <ExpenseList
          expenses={expenses}
          loading={loading}
          filters={filters}
          onFilterChange={setFilters}
          onDelete={handleDeleteExpense}
          onEdit={handleEdit}
        />
      </main>
      <AIChat stats={stats} expenses={expenses} />
      {formOpen && (
        <ExpenseForm
          expense={editingExpense}
          onSubmit={editingExpense
            ? (data) => handleUpdateExpense(editingExpense._id, data)
            : handleAddExpense}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
