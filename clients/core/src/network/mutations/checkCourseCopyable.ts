import { axiosInstance } from '@/network/configService'
import type { CheckCourseCopyableResponse } from '../../managementConsole/courseOverview/interfaces/checkCourseCopyableResponse'

export const checkCourseCopyable = async (
  courseID: string,
): Promise<CheckCourseCopyableResponse | undefined> => {
  try {
    return await axiosInstance.get(`/api/courses/${courseID}/copyable`, {
      headers: {
        'Content-Type': 'application/json-path+json',
      },
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}
