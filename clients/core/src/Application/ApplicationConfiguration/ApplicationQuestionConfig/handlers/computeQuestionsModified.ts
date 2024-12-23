import { ApplicationForm } from '@/interfaces/application_form'
import { ApplicationQuestionMultiSelect } from '@/interfaces/application_question_multi_select'
import { ApplicationQuestionText } from '@/interfaces/application_question_text'

export const computeQuestionsModified = (
  fetchedForm: ApplicationForm | undefined,
  storedApplicationQuestions: (ApplicationQuestionText | ApplicationQuestionMultiSelect)[],
) => {
  const combinedQuestions: (ApplicationQuestionText | ApplicationQuestionMultiSelect)[] = [
    ...(fetchedForm?.questions_multi_select ?? []),
    ...(fetchedForm?.questions_text ?? []),
  ]
  const modified = !storedApplicationQuestions.every((q) => {
    const originalQuestion = combinedQuestions.find((aq) => aq.id === q.id)
    if (!originalQuestion) return false
    return JSON.stringify(originalQuestion) === JSON.stringify(q)
  })
  const deletedQuestion = !combinedQuestions.every((q) =>
    storedApplicationQuestions.some((aq) => aq.id === q.id),
  )

  return modified || deletedQuestion
}
