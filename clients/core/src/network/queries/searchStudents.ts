import { Student } from '@tumaet/prompt-shared-state'
import { axiosInstance } from '@/network/configService'

export const searchStudents = async (searchString: string): Promise<Student[]> => {
  try {
    return (await axiosInstance.get(`/api/students/search/${searchString}`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
