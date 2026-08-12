import api from './api';

const API_URL = 'http://localhost:5083/api/signalements';

export const getAllSignalements = async () => (await api.get(API_URL)).data;
export const markSignalementAsProcessed = async (id) => api.patch(`${API_URL}/${id}/traiter`);
