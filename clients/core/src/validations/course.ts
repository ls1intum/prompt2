import * as z from 'zod'

export const courseFormSchema = z.object({
  name: z.string().min(1, 'Course name is required'),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  courseType: z.string().min(1, 'Course type is required'),
  ects: z.number().min(0, 'ECTS must be a positive number'),
  semesterTag: z.string().min(1, 'Semester tag is required'),
})

export type CourseFormValues = z.infer<typeof courseFormSchema>
