import { Student } from '@/interfaces/student'
import { axiosInstance } from '../configService'

export const searchStudents = async (searchString: string): Promise<Student[]> => {
  try {
    return (await axiosInstance.get(`/api/students/search/${searchString}`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
