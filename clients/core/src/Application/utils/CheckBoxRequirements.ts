import { ApplicationQuestionMultiSelect } from '@/interfaces/application_question_multi_select'

export const isCheckboxQuestion = (question: ApplicationQuestionMultiSelect): boolean => {
  return (
    question.max_select === 1 &&
    question.options.length === 1 &&
    question.options[0] === 'Yes' &&
    question.placeholder === 'CheckBoxQuestion'
  )
}
