import api from './api';

const API_URL = 'http://localhost:5083/api/Article';

export const getAllArticles = async () => {
  const response = await api.get(API_URL);
  return response.data;
};

export const getArticleById = async (id) => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};

export const createArticle = async (articleData) => {
  const response = await api.post(API_URL, articleData);
  return response.data;
};

export const updateArticle = async (id, articleData) => {
  const response = await api.put(`${API_URL}/${id}`, articleData);
  return response.data;
};

export const deleteArticle = async (id) => {
  await api.delete(`${API_URL}/${id}`);
};
