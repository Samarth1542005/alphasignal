import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://samarth1542005-stock-predictor-api.hf.space/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 90000, // 90 seconds — HF Space cold starts can take ~45s
})

export const getStockSummary = async (ticker) => {
  const response = await api.get(`/stock/${ticker}/summary`)
  return response.data
}

export const getStockHistory = async (ticker, period = '1y') => {
  const response = await api.get(`/stock/${ticker}/history?period=${period}`)
  return response.data
}

export const getStockIndicators = async (ticker) => {
  const response = await api.get(`/stock/${ticker}/indicators`)
  return response.data
}

export const getPrediction = async (ticker) => {
  const response = await api.get(`/stock/${ticker}/predict`)
  return response.data
}

export const getSentiment = async (ticker) => {
  const response = await api.get(`/stock/${ticker}/sentiment`)
  return response.data
}

export const getBacktest = async (ticker) => {
  const response = await api.get(`/stock/${ticker}/backtest`)
  return response.data
}