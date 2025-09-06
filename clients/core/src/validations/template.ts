import * as z from 'zod'

export const templateFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Course name is required')
    .refine((val) => !val.includes('-'), 'Course name cannot contain a "-" character'),
  courseType: z.string().min(1, 'Course type is required'),
  ects: z.number().min(0, 'ECTS must be a positive number'),
  semesterTag: z
    .string()
    .min(1, 'Semester tag is required')
    .refine((val) => !val.includes('-'), 'Semester tag cannot contain a "-" character'),
})

export type TemplateFormValues = z.infer<typeof templateFormSchema>
