import { Course } from '@/interfaces/course'
import { notAuthenticatedAxiosInstance } from '@/network/configService'

export const getAllCourses = async (): Promise<Course[]> => {
  try {
    console.log('getCourses')
    return (await notAuthenticatedAxiosInstance.get(`/api/courses/`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
