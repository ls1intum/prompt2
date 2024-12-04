import { Course } from '@/interfaces/course'
import { notAuthenticatedAxiosInstance } from '../configService'

export const getAllCourses = async (): Promise<Course[]> => {
  try {
    return (await notAuthenticatedAxiosInstance.get(`/api/courses/`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
