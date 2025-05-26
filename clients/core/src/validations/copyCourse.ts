import * as z from 'zod'

export const copyCourseSchema = z.object({
  name: z
    .string()
    .min(1, 'Course name is required')
    .refine((val) => !val.includes('-'), 'Course name cannot contain a "-" character'),
  dateRange: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .refine((data) => data.to > data.from, {
      message: 'End date must be after start date',
      path: ['to'],
    }),
  semesterTag: z
    .string()
    .min(1, 'Semester tag is required')
    .refine((val) => !val.includes('-'), 'Semester tag cannot contain a "-" character'),
})

export type CopyCourseFormValues = z.infer<typeof copyCourseSchema>
