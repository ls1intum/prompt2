import { axiosInstance } from '@/network/configService'
import { MetaDataGraphItem } from '../../CourseConfigurator/interfaces/courseMetaGraphItem'

export const getMetaDataGraph = async (courseID: string): Promise<MetaDataGraphItem[]> => {
  try {
    return (await axiosInstance.get(`/api/courses/${courseID}/meta_graph`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
