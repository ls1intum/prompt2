// TODO rewrite this as context provider and re-integrate it into the shared library

import axios from 'axios'
import { env } from '@/env'
import { parseURL } from '@/utils/parseURL'

const coreURL = env.CORE_HOST || ''

const serverBaseUrl = parseURL(coreURL)

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
