import { axiosInstance } from '@/network/configService'

export const getOwnCourseIDs = async (): Promise<string[]> => {
  try {
    return (await axiosInstance.get(`/api/courses/self`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
