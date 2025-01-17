declare global {
  interface Window {
    env: any
  }
}

type EnvType = {
  REACT_APP_CORE_HOST: string
  REACT_APP_KEYCLOAK_HOST: string
  REACT_APP_KEYCLOAK_REALM_NAME: string
}
export const env: EnvType = { ...window.env }
