// validations/questionConfig.ts
import * as z from 'zod'

// Base schema containing common fields and the discriminant 'type'
const baseQuestionSchema = z.object({
  type: z.enum(['text', 'multi-select']), // Discriminant field
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  error_message: z.string().optional(),
  is_required: z.boolean(),
})

// Schema for text questions
export const textQuestionSchema = baseQuestionSchema.extend({
  type: z.literal('text'), // Ensure the type is 'text'
  validation_regex: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true // If empty, consider it valid
        try {
          new RegExp(val)
          return true
        } catch {
          return false
        }
      },
      {
        message: 'Invalid regex pattern',
      },
    ),
  allowed_length: z.number().min(1, 'Allowed length must be at least 1'),
})

// Schema for multi-select questions
export const multiSelectQuestionSchema = baseQuestionSchema.extend({
  type: z.literal('multi-select'), // Ensure the type is 'multi-select'
  min_select: z.number().min(0, 'Minimum selection must be at least 0').optional(),
  max_select: z.number().min(1, 'Maximum selection must be at least 1').optional(),
  options: z
    .array(z.string().min(1, 'Option cannot be an empty string'))
    .min(1, 'Options cannot be empty'),
})

// Combine schemas using discriminated union
export const questionConfigSchema = z.discriminatedUnion('type', [
  multiSelectQuestionSchema,
  textQuestionSchema,
])

// Export TypeScript types
export type QuestionConfigFormData = z.infer<typeof questionConfigSchema>
export type QuestionConfigFormDataMultiSelect = z.infer<typeof multiSelectQuestionSchema>
export type QuestionConfigFormDataText = z.infer<typeof textQuestionSchema>
