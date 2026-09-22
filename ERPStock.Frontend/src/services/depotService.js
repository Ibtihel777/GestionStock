import api from './api';

import { API_BASE_URL } from './apiUrl';

const API_URL = `${API_BASE_URL}/Depot`;

export const getAllDepots = async () => (await api.get(API_URL)).data;
export const createDepot = async (data) => (await api.post(API_URL, data)).data;
export const updateDepot = async (id, data) => api.put(`${API_URL}/${id}`, data);
export const deleteDepot = async (id) => api.delete(`${API_URL}/${id}`);
