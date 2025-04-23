import axios from 'axios'
import { env } from '@/env'
import { parseURL } from '@/utils/parseURL'

const selfTeamAllocationServer = env.SELF_TEAM_ALLOCATION_SERVER || ''

const serverBaseUrl = parseURL(selfTeamAllocationServer)

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
