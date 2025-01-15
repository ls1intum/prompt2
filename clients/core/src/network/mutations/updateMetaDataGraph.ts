import { MetaDataGraphItem } from '@/interfaces/course_meta_graph'
import { axiosInstance } from '../configService'

export const updateMetaDataGraph = async (
  courseID: string,
  metaDataGraph: MetaDataGraphItem[],
): Promise<void> => {
  try {
    return await axiosInstance.put(`/api/courses/${courseID}/meta_graph`, metaDataGraph, {
      headers: {
        'Content-Type': 'application/json-path+json',
      },
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}
