import axios from 'axios';

const API_URL = 'https://localhost:7081/api/Article';

export const getAllArticles = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getArticleById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createArticle = async (articleData) => {
  const response = await axios.post(API_URL, articleData);
  return response.data;
};

export const updateArticle = async (id, articleData) => {
  const response = await axios.put(`${API_URL}/${id}`, articleData);
  return response.data;
};

export const deleteArticle = async (id) => {
  await axios.delete(`${API_URL}/${id}`);
};