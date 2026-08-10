import axios from 'axios';

const API_URL = 'http://localhost:5083/api/Stock';

export const getAllStocks = async () => (await axios.get(API_URL)).data;
