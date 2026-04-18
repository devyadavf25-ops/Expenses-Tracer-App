import api from './api';

export const getLedgerEntries = (params) => api.get('/ledger', { params });
export const createLedgerEntry = (data)  => api.post('/ledger', data);
export const updateLedgerEntry = (id, data) => api.put(`/ledger/${id}`, data);
export const deleteLedgerEntry = (id)    => api.delete(`/ledger/${id}`);
