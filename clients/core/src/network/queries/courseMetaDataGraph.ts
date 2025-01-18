import { axiosInstance } from '../configService'
import { MetaDataGraphItem } from '@/interfaces/course_meta_graph'

export const getMetaDataGraph = async (course_id: string): Promise<MetaDataGraphItem[]> => {
  try {
    return (await axiosInstance.get(`/api/courses/${course_id}/meta_graph`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
