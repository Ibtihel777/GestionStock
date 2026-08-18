import api from './api';

const API_URL = 'http://localhost:5083/api/Stock';

export const getAllStocks = async () => (await api.get(API_URL)).data;
export const updateStock = async (id, stockData) => api.put(`${API_URL}/${id}`, stockData);
export const deleteStock = async (id) => api.delete(`${API_URL}/${id}`);
