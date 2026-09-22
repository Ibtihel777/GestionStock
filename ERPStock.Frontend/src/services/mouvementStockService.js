import api from './api';

import { API_BASE_URL } from './apiUrl';

const API_URL = `${API_BASE_URL}/MouvementStock`;

export const getAllMouvementsStock = async () => (await api.get(API_URL)).data;
export const createMouvementStock = async (data) => (await api.post(API_URL, data)).data;
