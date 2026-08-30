import axios from 'axios';
import api from './api';

const API_URL = 'http://localhost:5083/api/auth';

export const login = async (email, password) => (await axios.post(`${API_URL}/login`, { email, password })).data;

export const register = async ({ nom, prenom, telephone, email, password }) => (
  await axios.post(`${API_URL}/register`, { nom, prenom, telephone, email, password })
).data;

export const getConsultantRequests = async () => (await api.get(`${API_URL}/consultant-requests`)).data;

export const approveConsultantRequest = async (id) => api.patch(`${API_URL}/consultant-requests/${id}/accepter`);

export const rejectConsultantRequest = async (id) => api.patch(`${API_URL}/consultant-requests/${id}/refuser`);
