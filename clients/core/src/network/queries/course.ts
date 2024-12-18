import { Course } from '@/interfaces/course'
import { axiosInstance } from '../configService'

export const getAllCourses = async (): Promise<Course[]> => {
  try {
    return (await axiosInstance.get(`/api/courses/`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
