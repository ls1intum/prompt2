import { Student } from '@/interfaces/student'
import { axiosInstance } from '@/network/configService'

export const updateStudent = async (student: Student): Promise<string | undefined> => {
  try {
    return (
      await axiosInstance.put(`/api/students/${student.id}`, student, {
        headers: {
          'Content-Type': 'application/json-path+json',
        },
      })
    ).data.id // try to get the id of the created course
  } catch (err) {
    console.error(err)
    throw err
  }
}
