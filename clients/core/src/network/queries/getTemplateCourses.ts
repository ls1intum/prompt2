import { axiosInstance } from '@/network/configService'
import type { CourseWithTemplateInfo } from '../../interfaces/courseWithTemplateInfo'

export const getTemplateCourses = async (): Promise<CourseWithTemplateInfo[]> => {
  try {
    return (await axiosInstance.get(`/api/courses/template`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
