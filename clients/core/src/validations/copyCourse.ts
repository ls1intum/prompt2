import * as z from 'zod'

export const copyCourseSchema = z.object({
  name: z.string().min(1, 'Course name is required'),
  semesterTag: z.string().min(1, 'Semester tag is required'),
})

export type CopyCourseFormValues = z.infer<typeof copyCourseSchema>
