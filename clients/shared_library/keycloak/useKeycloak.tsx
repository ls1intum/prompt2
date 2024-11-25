import { useContext, useEffect } from 'react'
import Keycloak from 'keycloak-js'
import { KeycloakContext } from './KeycloakProvider' // Path to your provider

export const keycloakUrl = `${process.env.REACT_APP_KEYCLOAK_HOST ?? 'http://localhost:8081'}`
export const keycloakRealmName = `${process.env.REACT_APP_KEYCLOAK_REALM_NAME ?? 'prompt'}`

export const useKeycloak = (): Keycloak | undefined => {
  const context = useContext(KeycloakContext)
  if (!context) {
    throw new Error('useKeycloak must be used within a KeycloakProvider')
  }

  const { keycloakValue } = context

  useEffect(() => {
    if (!keycloakValue) {
      const keycloak = new Keycloak({
        realm: keycloakRealmName,
        url: keycloakUrl,
        clientId: 'prompt-client',
      })

      keycloak.onTokenExpired = () => {
        keycloak.updateToken(5).then(() => {
          localStorage.setItem('jwt_token', keycloak.token ?? '')
          localStorage.setItem('refreshToken', keycloak.refreshToken ?? '')
        })
      }

      void keycloak
        .init({ onLoad: 'login-required' })
        .then(() => {
          localStorage.setItem('jwt_token', keycloak.token ?? '')
          localStorage.setItem('refreshToken', keycloak.refreshToken ?? '')
          context.keycloakValue = keycloak // Update context dynamically
        })
        .catch((err) => {
          alert(err)
        })
    }
  }, [keycloakValue, context])

  return keycloakValue
}
