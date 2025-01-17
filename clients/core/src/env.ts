declare global {
  interface Window {
    env: any
  }
}

type EnvType = {
  CORE_HOST: string
  KEYCLOAK_HOST: string
  KEYCLOAK_REALM_NAME: string
}
export const env: EnvType = { ...window.env }
