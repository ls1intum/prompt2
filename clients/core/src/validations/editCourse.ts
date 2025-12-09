import * as z from 'zod'
import { courseAppearanceFormSchema } from './courseAppearance'

const editCourseBaseSchema = z.object({
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  courseType: z.string().min(1, 'Course type is required'),
  ects: z.number().min(0, 'ECTS must be a positive number'),
  shortDescription: z
    .string()
    .max(255, 'Short description cannot exceed 255 characters')
    .optional()
    .or(z.literal('')),
  longDescription: z
    .string()
    .max(5000, 'Long description cannot exceed 5000 characters')
    .optional()
    .or(z.literal('')),
})

export const editCourseSchema = editCourseBaseSchema.merge(courseAppearanceFormSchema)

export type EditCourseFormValues = z.infer<typeof editCourseSchema>
