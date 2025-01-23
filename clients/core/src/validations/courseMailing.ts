import * as z from 'zod'

export const emailWithNameSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().optional(),
})

export const courseMailingSchema = z.object({
  replyToName: z.string().optional(),
  replyToEmail: z.string().email('Invalid email format').optional(),
  ccAddresses: z.array(emailWithNameSchema).optional(),
  bccAddresses: z.array(emailWithNameSchema).optional(),
})

export type CourseMailingFormValues = z.infer<typeof courseMailingSchema>
