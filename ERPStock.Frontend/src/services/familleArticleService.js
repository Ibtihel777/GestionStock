import api from './api';

const API_URL = 'http://localhost:5083/api/FamilleArticle';

export const getAllFamillesArticles = async () => (await api.get(API_URL)).data;
export const createFamilleArticle = async (data) => (await api.post(API_URL, data)).data;
export const updateFamilleArticle = async (id, data) => api.put(`${API_URL}/${id}`, data);
export const deleteFamilleArticle = async (id) => api.delete(`${API_URL}/${id}`);
