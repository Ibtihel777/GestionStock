import api from './api';

import { API_BASE_URL } from './apiUrl';

const API_URL = `${API_BASE_URL}/verification`;

export const getAllVerifications = async () => (await api.get(API_URL)).data;

export const createVerification = async ({ articleId, emplacementId, photo }) => {
  const formData = new FormData();
  formData.append('articleId', articleId);
  formData.append('emplacementId', emplacementId);
  formData.append('photo', photo);

  return (await api.post(API_URL, formData)).data;
};
