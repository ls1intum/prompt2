import * as z from 'zod'
import { ApplicationQuestionText } from '@/interfaces/application_question_text'

export const createValidationSchema = (question: ApplicationQuestionText) =>
  z.object({
    answer: z
      .string()
      .min(question.is_required ? 1 : 0, 'This field is required')
      .max(
        question.allowed_length || 255,
        `Answer must be less than ${question.allowed_length || 255} characters`,
      )
      .regex(
        new RegExp(question.validation_regex || '.*'),
        question.error_message || 'Invalid format',
      ),
  })
