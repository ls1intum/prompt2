import * as z from 'zod'

export const courseAppearanceFormSchema = z.object({
  color: z.string().min(1, 'Color is required'),
  icon: z.string().min(1, 'Icon is required'),
})

export type CourseAppearanceFormValues = z.infer<typeof courseAppearanceFormSchema>
