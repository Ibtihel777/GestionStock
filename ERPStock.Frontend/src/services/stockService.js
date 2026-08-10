import axios from 'axios';

const API_URL = 'http://localhost:5083/api/Stock';

export const getAllStocks = async () => (await axios.get(API_URL)).data;
export const createStock = async (data) => (await axios.post(API_URL, data)).data;
export const updateStock = async (id, data) => axios.put(`${API_URL}/${id}`, data);
export const deleteStock = async (id) => axios.delete(`${API_URL}/${id}`);
