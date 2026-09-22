import api from './api';

import { API_BASE_URL } from './apiUrl';

const API_URL = `${API_BASE_URL}/Emplacement`;

export const getAllEmplacements = async () => (await api.get(API_URL)).data;
export const createEmplacement = async (data) => (await api.post(API_URL, data)).data;
export const updateEmplacement = async (id, data) => api.put(`${API_URL}/${id}`, data);
export const deleteEmplacement = async (id) => api.delete(`${API_URL}/${id}`);
