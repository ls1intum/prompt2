import { Course } from '@tumaet/prompt-shared-state'
import { axiosInstance } from '@/network/configService'

export const getAllCourses = async (): Promise<Course[]> => {
  try {
    return (await axiosInstance.get(`/api/courses/`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
