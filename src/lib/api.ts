import axios from 'axios'

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export const api = axios.create({ baseURL: API_BASE })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('demo_token')
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export { API_BASE }



