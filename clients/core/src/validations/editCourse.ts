import * as z from 'zod'

export const editCourseSchema = z.object({
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  courseType: z.string().min(1, 'Course type is required'),
  ects: z.number().min(0, 'ECTS must be a positive number'),
})

export type EditCourseFormValues = z.infer<typeof editCourseSchema>
