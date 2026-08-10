import axios from 'axios';

const API_URL = 'http://localhost:5083/api/Emplacement';

export const getAllEmplacements = async () => (await axios.get(API_URL)).data;
export const createEmplacement = async (data) => (await axios.post(API_URL, data)).data;
export const updateEmplacement = async (id, data) => axios.put(`${API_URL}/${id}`, data);
export const deleteEmplacement = async (id) => axios.delete(`${API_URL}/${id}`);
