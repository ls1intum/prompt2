declare global {
  interface Window {
    env: any
  }
}

type EnvType = {
  CORE_HOST: string
  INTRO_COURSE_HOST: string
  TEAM_ALLOCATION_HOST: string
  ASSESSMENT_HOST: string
  DEVOPS_CHALLENGE_HOST: string
  KEYCLOAK_HOST: string
  KEYCLOAK_REALM_NAME: string
  CHAIR_NAME_LONG: string
  CHAIR_NAME_SHORT: string
  GITHUB_SHA: string
  GITHUB_REF: string
  SERVER_IMAGE_TAG: string
}
export const env: EnvType = { ...window.env }
