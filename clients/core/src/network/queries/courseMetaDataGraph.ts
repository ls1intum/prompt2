import { axiosInstance } from '@/network/configService'
import { MetaDataGraphItem } from '../../CourseConfigurator/interfaces/courseMetaGraphItem'

export const getMetaDataGraph = async (course_id: string): Promise<MetaDataGraphItem[]> => {
  try {
    return (await axiosInstance.get(`/api/courses/${course_id}/meta_graph`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
