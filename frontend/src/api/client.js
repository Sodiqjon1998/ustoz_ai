import axios from 'axios'

const client = axios.create({
  baseURL: '/api/v1',
  headers: {
    Accept: 'application/json',
  },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('ustoz_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ustoz_token')
    }
    return Promise.reject(error)
  },
)

export default client
