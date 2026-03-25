import axios from 'axios'

const BASE_URL = 'http://localhost:8000/api'

export const getStockSummary = async (ticker) => {
  const response = await axios.get(`${BASE_URL}/stock/${ticker}/summary`)
  return response.data
}

export const getStockHistory = async (ticker, period = '1y') => {
  const response = await axios.get(`${BASE_URL}/stock/${ticker}/history?period=${period}`)
  return response.data
}

export const getStockIndicators = async (ticker) => {
  const response = await axios.get(`${BASE_URL}/stock/${ticker}/indicators`)
  return response.data
}

export const getPrediction = async (ticker) => {
  const response = await axios.get(`${BASE_URL}/stock/${ticker}/predict`);
  return response.data;
};

export const getSentiment = async (ticker) => {
  const response = await axios.get(`${BASE_URL}/stock/${ticker}/sentiment`);
  return response.data;
};

export const getBacktest = async (ticker) => {
  const response = await axios.get(`${BASE_URL}/stock/${ticker}/backtest`);
  return response.data;
};