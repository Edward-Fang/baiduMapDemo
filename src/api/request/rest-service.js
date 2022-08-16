import axios from 'axios'

const requestSuccess = config => {
  const token = '#'
  config.headers['Authorization'] = `Bearer ${token}`
  return config
}

const createRestService = origin => {
  const service = axios.create({ baseURL: `${origin}/`, timeout: 5000 })
  service.interceptors.request.use(requestSuccess)
  return service
}

export { createRestService }