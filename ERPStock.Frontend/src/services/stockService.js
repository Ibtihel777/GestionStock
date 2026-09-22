import api from './api';

import { API_BASE_URL } from './apiUrl';

const API_URL = `${API_BASE_URL}/Stock`;

export const getAllStocks = async () => (await api.get(API_URL)).data;
export const updateStock = async (id, stockData) => api.put(`${API_URL}/${id}`, stockData);
export const deleteStock = async (id) => api.delete(`${API_URL}/${id}`);
