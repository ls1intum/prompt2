import * as z from 'zod'

export const makeTemplateCourseSchema = z.object({
  name: z
    .string()
    .min(1, 'Course name is required')
    .refine((val) => !val.includes('-'), 'Course name cannot contain a "-" character'),
  semesterTag: z
    .string()
    .min(1, 'Semester tag is required')
    .refine((val) => !val.includes('-'), 'Semester tag cannot contain a "-" character'),
})

export type MakeTemplateCourseFormValues = z.infer<typeof makeTemplateCourseSchema>
