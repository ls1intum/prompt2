export interface PostCourse {
  name: string
  start_date: Date
  end_date: Date
  course_type: string
  ects: number
  semester_tag: string
  meta_data: { [key: string]: any }
}

// Helper function to format Date as YYYY-MM-DD
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Serialize the PostCourse object
export function serializePostCourse(course: PostCourse): Record<string, any> {
  return {
    ...course,
    start_date: formatDate(course.start_date),
    end_date: formatDate(course.end_date),
  }
}
