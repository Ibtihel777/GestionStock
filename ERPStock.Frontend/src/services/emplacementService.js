import api from './api';

const API_URL = 'http://localhost:5083/api/Emplacement';

export const getAllEmplacements = async () => (await api.get(API_URL)).data;
export const createEmplacement = async (data) => (await api.post(API_URL, data)).data;
export const updateEmplacement = async (id, data) => api.put(`${API_URL}/${id}`, data);
export const deleteEmplacement = async (id) => api.delete(`${API_URL}/${id}`);
