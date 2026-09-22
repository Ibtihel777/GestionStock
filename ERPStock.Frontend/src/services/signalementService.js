import api from './api';

import { API_BASE_URL } from './apiUrl';

const API_URL = `${API_BASE_URL}/signalements`;

export const getAllSignalements = async () => (await api.get(API_URL)).data;
export const markSignalementAsProcessed = async (id) => api.patch(`${API_URL}/${id}/traiter`);
