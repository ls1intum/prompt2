// these are just the defaults, which are overwritten via env.template.js at production
window.env = {
    CORE_HOST: 'http://localhost:8080',
    INTRO_COURSE_HOST: 'http://localhost:8082',
    DEVOPS_CHALLENGE_HOST: 'http://localhost:9000',
    KEYCLOAK_HOST: 'http://localhost:8081',
    KEYCLOAK_REALM_NAME: 'prompt',
    CHAIR_NAME_LONG: 'TUM Research Group for Applied Education Technologies',
    CHAIR_NAME_SHORT: 'Applied Education Technologies',
    GITHUB_SHA: 'GITHUB_SHA - Will be here in Production',
    GITHUB_REF: '$GITHUB_REF - Will be here in Production',
    SERVER_IMAGE_TAG: '$SERVER_IMAGE_TAG - Image Tag',
}
