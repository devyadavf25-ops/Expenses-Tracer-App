import API from './api';

export const getExpenses = (params) => API.get('/expenses', { params });
export const getExpenseStats = () => API.get('/expenses/stats');
export const createExpense = (data) => API.post('/expenses', data);
export const updateExpense = (id, data) => API.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);
