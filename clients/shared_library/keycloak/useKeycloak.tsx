import { useContext, useEffect, useCallback } from 'react'
import Keycloak from 'keycloak-js'
import { KeycloakContext } from './KeycloakProvider'
import { useAuthStore } from '@/zustand/useAuthStore'
import { jwtDecode } from 'jwt-decode'

export const keycloakUrl = `${process.env.REACT_APP_KEYCLOAK_HOST ?? 'http://localhost:8081'}`
export const keycloakRealmName = `${process.env.REACT_APP_KEYCLOAK_REALM_NAME ?? 'prompt'}`

// Helper function to decode JWT safely
const parseJwt = (token: string) => {
  try {
    return jwtDecode<{
      given_name: string
      family_name: string
      email: string
      preferred_username: string
    }>(token)
  } catch {
    return null
  }
}

export const useKeycloak = (): { keycloak: Keycloak | undefined; logout: () => void } => {
  const context = useContext(KeycloakContext)
  const { setUser, setPermissions, clearUser, clearPermissions } = useAuthStore()

  if (!context) {
    throw new Error('useKeycloak must be used within a KeycloakProvider')
  }

  const { keycloakValue } = context

  const initializeKeycloak = useCallback(() => {
    const keycloak = new Keycloak({
      realm: keycloakRealmName,
      url: keycloakUrl,
      clientId: 'prompt-client',
    })

    keycloak.onTokenExpired = () => {
      keycloak
        .updateToken(5)
        .then(() => {
          localStorage.setItem('jwt_token', keycloak.token ?? '')
          localStorage.setItem('refreshToken', keycloak.refreshToken ?? '')
        })
        .catch(() => {
          clearUser()
          clearPermissions()
          alert('Session expired. Please log in again.')
          keycloak.logout({ redirectUri: window.location.origin })
        })
    }

    void keycloak
      .init({ onLoad: 'login-required' })
      .then(() => {
        localStorage.setItem('jwt_token', keycloak.token ?? '')
        localStorage.setItem('refreshToken', keycloak.refreshToken ?? '')
        context.keycloakValue = keycloak // Update context dynamically

        if (keycloak.token) {
          const decodedJwt = parseJwt(keycloak.token)
          if (decodedJwt) {
            setUser({
              firstName: decodedJwt.given_name || '',
              lastName: decodedJwt.family_name || '',
              email: decodedJwt.email || '',
              username: decodedJwt.preferred_username || '',
            })
          } else {
            clearUser()
          }
          const resourceRoles = keycloak.resourceAccess?.['prompt-server']?.roles || []
          setPermissions(resourceRoles)
        }
      })
      .catch((err) => {
        clearUser()
        clearPermissions()
        alert(`Authentication error: ${err.message}`)
      })

    return keycloak
  }, [context, clearUser, clearPermissions, setUser, setPermissions])

  useEffect(() => {
    if (!keycloakValue) {
      initializeKeycloak()
    }
  }, [keycloakValue, initializeKeycloak])

  const logout = () => {
    if (keycloakValue) {
      keycloakValue.logout({ redirectUri: window.location.origin }) // Keycloak logout
    }
    clearUser()
    clearPermissions()
    localStorage.removeItem('jwt_token')
    localStorage.removeItem('refreshToken')
  }

  return { keycloak: keycloakValue, logout }
}
