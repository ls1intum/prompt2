import { axiosInstance } from '@/network/configService'

export const deleteCourse = async (courseID: string): Promise<void> => {
  try {
    return await axiosInstance.delete(`/api/courses/${courseID}`, {
      headers: {
        'Content-Type': 'application/json-path+json',
      },
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}
