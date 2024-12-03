// TODO rewrite this as context provider and re-integrate it into the shared library

import axios from 'axios'

export const serverBaseUrl = `${process.env.REACT_APP_SERVER_HOST ?? 'http://localhost:8080'}`

export interface Patch {
  op: 'replace' | 'add' | 'remove' | 'copy'
  path: string
  value: string
}

const authenticatedAxiosInstance = axios.create({
  baseURL: serverBaseUrl,
})

authenticatedAxiosInstance.interceptors.request.use((config) => {
  if (!!localStorage.getItem('jwt_token') && localStorage.getItem('jwt_token') !== '') {
    config.headers['Authorization'] = `Bearer ${localStorage.getItem('jwt_token') ?? ''}`
  }
  return config
})

const notAuthenticatedAxiosInstance = axios.create({
  baseURL: serverBaseUrl,
})

export { authenticatedAxiosInstance as axiosInstance, notAuthenticatedAxiosInstance }
