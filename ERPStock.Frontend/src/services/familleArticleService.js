import api from './api';

import { API_BASE_URL } from './apiUrl';

const API_URL = `${API_BASE_URL}/FamilleArticle`;

export const getAllFamillesArticles = async () => (await api.get(API_URL)).data;
export const createFamilleArticle = async (data) => (await api.post(API_URL, data)).data;
export const updateFamilleArticle = async (id, data) => api.put(`${API_URL}/${id}`, data);
export const deleteFamilleArticle = async (id) => api.delete(`${API_URL}/${id}`);
