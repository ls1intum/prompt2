import axios from 'axios'
import { env } from '@/env'
import { parseURL } from '@/utils/parseURL'

const introCourseServer = env.TEAM_ALLOCATION_HOST || ''

const serverBaseUrl = parseURL(introCourseServer)

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

export { authenticatedAxiosInstance as teamAllocationAxiosInstance }
