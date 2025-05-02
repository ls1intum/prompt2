import { AddDeviceRequest } from '../../interfaces/AddDeviceRequest'
import { introCourseAxiosInstance } from '../introCourseServerConfig'

export const registerDevices = async (
  coursePhaseID: string,
  courseParticipationID: string,
  addDeviceRequest: AddDeviceRequest,
): Promise<any> => {
  try {
    const response = await introCourseAxiosInstance.post(
      `intro-course/api/course_phase/${coursePhaseID}/developer_account/register-devices/${courseParticipationID}`,
      addDeviceRequest,
      {
        headers: {
          'Content-Type': 'application/json-path+json',
        },
      },
    )
    return response.data
  } catch (err: any) {
    console.error(err)
    if (err.response && err.response.data && err.response.data.error) {
      throw err.response.data.error
    }
    throw err
  }
}
