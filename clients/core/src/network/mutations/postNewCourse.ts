import { PostCourse, serializePostCourse } from '@/interfaces/post_course'
import { axiosInstance } from '@/network/configService'

export const postNewCourse = async (course: PostCourse): Promise<string | undefined> => {
  try {
    const serializedCourse = serializePostCourse(course)
    return (
      await axiosInstance.post(`/api/courses/`, serializedCourse, {
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
