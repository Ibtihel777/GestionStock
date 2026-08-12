import api from './api';

const API_URL = 'http://localhost:5083/api/verification';

export const getAllVerifications = async () => (await api.get(API_URL)).data;

export const createVerification = async ({ articleId, emplacementId, photo }) => {
  const formData = new FormData();
  formData.append('articleId', articleId);
  formData.append('emplacementId', emplacementId);
  formData.append('photo', photo);

  return (await api.post(API_URL, formData)).data;
};
