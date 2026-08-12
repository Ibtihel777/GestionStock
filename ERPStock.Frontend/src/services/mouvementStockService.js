import api from './api';

const API_URL = 'http://localhost:5083/api/MouvementStock';

export const getAllMouvementsStock = async () => (await api.get(API_URL)).data;
export const createMouvementStock = async (data) => (await api.post(API_URL, data)).data;
