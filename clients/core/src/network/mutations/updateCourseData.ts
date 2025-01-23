import { UpdateCourseData } from '@/interfaces/course'
import { axiosInstance } from '../configService'

export const updateCourseData = async (
  courseID: string,
  courseData: UpdateCourseData,
): Promise<void> => {
  try {
    await axiosInstance.put(`/api/courses/${courseID}`, courseData, {
      headers: {
        'Content-Type': 'application/json-path+json',
      },
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}
