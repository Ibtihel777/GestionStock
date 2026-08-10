import axios from 'axios';

const API_URL = 'http://localhost:5083/api/MouvementStock';

export const getAllMouvementsStock = async () => (await axios.get(API_URL)).data;
export const createMouvementStock = async (data) => (await axios.post(API_URL, data)).data;
