import * as z from 'zod'
import { courseAppearanceFormSchema } from './courseAppearance'

const editCourseBaseSchema = z.object({
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  courseType: z.string().min(1, 'Course type is required'),
  ects: z.number().min(0, 'ECTS must be a positive number'),
})

export const editCourseSchema = editCourseBaseSchema.merge(courseAppearanceFormSchema)

export type EditCourseFormValues = z.infer<typeof editCourseSchema>
