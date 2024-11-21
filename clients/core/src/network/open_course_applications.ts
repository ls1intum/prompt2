import { Course } from '../interfaces/open_course_applications'
import { notAuthenticatedAxiosInstance } from '@/network/configService'

export const getOpenCourses = async (): Promise<Course[]> => {
  try {
    console.log('getCourses')
    return (await notAuthenticatedAxiosInstance.get(`/api/courses/`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
