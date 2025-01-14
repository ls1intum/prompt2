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
    return questionsEqual(q, originalQuestion)
  })
  const deletedQuestion = !combinedQuestions.every((q) =>
    storedApplicationQuestions.some((aq) => aq.id === q.id),
  )

  return modified || deletedQuestion
}

export const questionsEqual = (
  question1: ApplicationQuestionText | ApplicationQuestionMultiSelect,
  question2: ApplicationQuestionText | ApplicationQuestionMultiSelect,
): boolean => {
  const question1IsMultiSelect = 'options' in question1
  const question2IsMultiSelect = 'options' in question2

  if (question1IsMultiSelect !== question2IsMultiSelect) return false
  const basicEqual =
    question1.id === question2.id &&
    question1.course_phase_id === question2.course_phase_id &&
    question1.title === question2.title &&
    question1.description === question2.description &&
    question1.placeholder === question2.placeholder &&
    question1.error_message === question2.error_message &&
    question1.is_required === question2.is_required &&
    question1.order_num === question2.order_num &&
    question1.accessible_for_other_phases === question2.accessible_for_other_phases &&
    // key will be ignored if accessible_for_other_phases is false
    (question1.accessible_for_other_phases ? question1.access_key === question2.access_key : true)

  if (!basicEqual) return false

  if (question1IsMultiSelect && question2IsMultiSelect) {
    return (
      question1.min_select === question2.min_select &&
      question1.max_select === question2.max_select &&
      JSON.stringify(question1.options) === JSON.stringify(question2.options)
    )
  }
  if (!question1IsMultiSelect && !question2IsMultiSelect) {
    return (
      question1.id === question2.id &&
      question1.allowed_length === question2.allowed_length &&
      question1.validation_regex === question2.validation_regex
    )
  }
  return false
}
