import axios from 'axios';

const API_URL = 'http://localhost:5083/api/auth';

export const login = async (email, password) => (await axios.post(`${API_URL}/login`, { email, password })).data;

export const register = async (email, password) => (await axios.post(`${API_URL}/register`, { email, password })).data;
