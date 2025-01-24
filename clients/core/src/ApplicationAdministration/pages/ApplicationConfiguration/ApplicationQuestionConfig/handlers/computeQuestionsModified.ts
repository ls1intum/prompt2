import { ApplicationForm } from '../../../../interfaces/form/applicationForm'
import { ApplicationQuestionMultiSelect } from '../../../../../interfaces/application/applicationQuestion/applicationQuestionMultiSelect'
import { ApplicationQuestionText } from '../../../../../interfaces/application/applicationQuestion/applicationQuestionText'

export const computeQuestionsModified = (
  fetchedForm: ApplicationForm | undefined,
  storedApplicationQuestions: (ApplicationQuestionText | ApplicationQuestionMultiSelect)[],
) => {
  const combinedQuestions: (ApplicationQuestionText | ApplicationQuestionMultiSelect)[] = [
    ...(fetchedForm?.questionsMultiSelect ?? []),
    ...(fetchedForm?.questionsText ?? []),
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
    question1.coursePhaseID === question2.coursePhaseID &&
    question1.title === question2.title &&
    question1.description === question2.description &&
    question1.placeholder === question2.placeholder &&
    question1.errorMessage === question2.errorMessage &&
    question1.isRequired === question2.isRequired &&
    question1.orderNum === question2.orderNum &&
    question1.accessibleForOtherPhases === question2.accessibleForOtherPhases &&
    // key will be ignored if accessibleForOtherPhases is false
    (question1.accessibleForOtherPhases ? question1.accessKey === question2.accessKey : true)

  if (!basicEqual) return false

  if (question1IsMultiSelect && question2IsMultiSelect) {
    return (
      question1.minSelect === question2.minSelect &&
      question1.maxSelect === question2.maxSelect &&
      JSON.stringify(question1.options) === JSON.stringify(question2.options)
    )
  }
  if (!question1IsMultiSelect && !question2IsMultiSelect) {
    return (
      question1.id === question2.id &&
      question1.allowedLength === question2.allowedLength &&
      question1.validationRegex === question2.validationRegex
    )
  }
  return false
}
