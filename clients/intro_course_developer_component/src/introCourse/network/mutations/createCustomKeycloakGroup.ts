import { axiosInstance } from '@/network/configService'
import { CreateKeycloakGroup } from 'src/introCourse/interfaces/CreateKeycloakGroup'

export const createCustomKeycloakGroup = async (
  courseID: string,
  group: CreateKeycloakGroup,
): Promise<void> => {
  try {
    await axiosInstance.put(`/api/keycloak/${courseID}/group`, group, {
      headers: {
        'Content-Type': 'application/json-path+json',
      },
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}
