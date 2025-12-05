import type {
  Course as SharedCourse,
  UpdateCourseData as SharedUpdateCourseData,
} from '@tumaet/prompt-shared-state'

/** Temporary extension until @tumaet/prompt-shared-state ships description fields. */
export interface CourseWithDescriptions extends SharedCourse {
  shortDescription?: string | null
  longDescription?: string | null
}

/** Temporary extension until @tumaet/prompt-shared-state ships description fields. */
export interface UpdateCourseDataWithDescriptions extends SharedUpdateCourseData {
  shortDescription?: string | null
  longDescription?: string | null
}
