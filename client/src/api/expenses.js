import axios from 'axios';

const BASE = '/api/expenses';

export const getExpenses = (params = {}) => axios.get(BASE, { params });
export const getStats    = ()           => axios.get(`${BASE}/stats`);
export const createExpense  = (data)    => axios.post(BASE, data);
export const updateExpense  = (id, data)=> axios.put(`${BASE}/${id}`, data);
export const deleteExpense  = (id)      => axios.delete(`${BASE}/${id}`);
