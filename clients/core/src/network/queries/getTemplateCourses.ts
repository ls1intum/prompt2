import { axiosInstance } from '@/network/configService'
import type { Course } from '../../interfaces/course'

export const getTemplateCourses = async (): Promise<Course[]> => {
  try {
    return (await axiosInstance.get(`/api/courses/template`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
