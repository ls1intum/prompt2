import { axiosInstance } from '@/network/configService'
import type { CourseArchiveStatus } from '@core/interfaces/courseArchiveStatus'
import { useCourseStore } from '@tumaet/prompt-shared-state'

const updateCourseArchiveStatus = async (
  courseId: string,
  payload: CourseArchiveStatus,
): Promise<void> => {
  try {
    await axiosInstance.put(`/api/courses/${courseId}/archive`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const { updateCourse } = useCourseStore.getState()

    updateCourse(courseId, {
      archived: payload.archived,
      archivedOn: payload.archived ? new Date().toISOString() : null,
    })
  } catch (err) {
    console.error('Failed to update course archive status', err)
    throw err
  }
}

export const archiveCourse = async (courseId: string): Promise<void> => {
  await updateCourseArchiveStatus(courseId, { archived: true })
}

export const unarchiveCourse = async (courseId: string): Promise<void> => {
  await updateCourseArchiveStatus(courseId, { archived: false })
}
