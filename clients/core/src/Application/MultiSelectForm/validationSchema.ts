import * as z from 'zod'
import { ApplicationQuestionMultiSelect } from '@/interfaces/application_question_multi_select'

export const createValidationSchema = (
  question: ApplicationQuestionMultiSelect,
  isCheckboxQuestion: boolean,
) =>
  z.object({
    answers: z
      .array(z.string())
      .min(
        isCheckboxQuestion ? (question.is_required ? 1 : 0) : question.min_select,
        isCheckboxQuestion
          ? question.error_message || 'This checkbox is required'
          : `Select at least ${question.min_select} option${question.min_select > 1 ? 's' : ''}.`,
      )
      .max(
        question.max_select,
        `Select no more than ${question.max_select} option${question.max_select > 1 ? 's' : ''}.`,
      ),
  })
