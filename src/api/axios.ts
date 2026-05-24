import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // ← cookies HttpOnly
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Interceptor de respuesta: refresca tokens si recibe 401
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
        // Si el refresh falla, redirigir al login
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api
