import axios from 'axios';

const API_URL = 'http://localhost:5083/api/verification';

export const getAllVerifications = async () => (await axios.get(API_URL)).data;

export const createVerification = async ({ articleId, emplacementId, photo }) => {
  const formData = new FormData();
  formData.append('articleId', articleId);
  formData.append('emplacementId', emplacementId);
  formData.append('photo', photo);

  return (await axios.post(API_URL, formData)).data;
};
