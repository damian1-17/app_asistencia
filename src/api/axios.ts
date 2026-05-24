import axios from 'axios'

// En desarrollo usa el proxy de Vite → Railway
// En producción el baseURL debe ser la URL real del backend
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // ← cookies HttpOnly (accessToken / refreshToken)
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Interceptor: refresca tokens automáticamente si recibe 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        await api.post('/auth/refresh')
        return api(originalRequest)
      } catch {
        // Si el refresh falla → ir al login
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api
