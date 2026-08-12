import api from './api';

const API_URL = 'http://localhost:5083/api/Stock';

export const getAllStocks = async () => (await api.get(API_URL)).data;
