import axios from 'axios'
import axiosRetry from 'axios-retry'
import { parseURL } from '@/utils/parseURL'
import { env } from '@/env'

const devOpsChallengeServer = env.DEV_OPS_CHALLENGE_HOST || ''

const serverBaseUrl = parseURL(devOpsChallengeServer)

export interface Patch {
  op: 'replace' | 'add' | 'remove' | 'copy'
  path: string
  value: string
}

const authenticatedAxiosInstance = axios.create({
  baseURL: serverBaseUrl,
})

// Configure axios-retry: retries 3 times but will not retry for a 404 response.
axiosRetry(authenticatedAxiosInstance, {
  retries: 3,
  retryCondition: (error) => {
    // Do not retry if the error status is 404
    if (error.response && error.response.status === 404) {
      return false
    }
    // Otherwise, follow the default retry logic (network errors, 5xx responses, etc.)
    return axiosRetry.isNetworkError(error) || axiosRetry.isRetryableError(error)
  },
})

authenticatedAxiosInstance.interceptors.request.use((config) => {
  if (!!localStorage.getItem('jwt_token') && localStorage.getItem('jwt_token') !== '') {
    config.headers['Authorization'] = `Bearer ${localStorage.getItem('jwt_token') ?? ''}`
  }
  return config
})

export { authenticatedAxiosInstance as devOpsChallengeAxiosInstance }
