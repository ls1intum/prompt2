import { UpdateCourseData } from '@tumaet/prompt-shared-state'
import { axiosInstance } from '@/network/configService'
import { serializeUpdateCourse } from '@core/managementConsole/courseOverview/interfaces/postCourse'

export const updateCourseData = async (
  courseID: string,
  courseData: UpdateCourseData,
): Promise<void> => {
  const serializedCourse = serializeUpdateCourse(courseData)
  try {
    await axiosInstance.put(`/api/courses/${courseID}`, serializedCourse, {
      headers: {
        'Content-Type': 'application/json-path+json',
      },
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}
