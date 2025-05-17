import { axiosInstance } from '@/network/configService'
import { CopyCourse } from '@core/managementConsole/courseOverview/interfaces/copyCourse'

export const copyCourse = async (
  courseID: string,
  courseVariables: CopyCourse,
): Promise<string | undefined> => {
  try {
    return (
      await axiosInstance.post(`/api/courses/${courseID}/copy`, courseVariables, {
        headers: {
          'Content-Type': 'application/json-path+json',
        },
      })
    ).data.id // try to get the id of the copied course
  } catch (err) {
    console.error(err)
    throw err
  }
}
