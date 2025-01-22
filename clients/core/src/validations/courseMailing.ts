import * as z from 'zod'

export const courseMailingSchema = z.object({
  replyToName: z.string().optional(),
  replyToEmail: z.string().email().optional(),
  ccName: z.string().optional(),
  ccEmail: z.string().email().optional().or(z.literal('')),
  bccName: z.string().optional(),
  bccEmail: z.string().email().optional().or(z.literal('')),
})

export type CourseMailingFormValues = z.infer<typeof courseMailingSchema>
