import * as z from 'zod'

export const questionConfigSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  error_message: z.string().optional(),
  is_required: z.boolean(),
  min_select: z.number().min(0).optional(),
  max_select: z.number().min(1).optional(),
  options: z.array(z.string()).default([]),
  validation_regex: z.string().optional(),
  allowed_length: z.number().min(1).optional(),
})

export type QuestionConfigFormData = z.infer<typeof questionConfigSchema>
