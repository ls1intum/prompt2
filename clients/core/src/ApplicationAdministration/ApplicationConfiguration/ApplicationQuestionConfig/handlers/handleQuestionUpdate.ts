import { ApplicationQuestionMultiSelect } from '@/interfaces/application_question_multi_select'
import { ApplicationQuestionText } from '@/interfaces/application_question_text'

export const handleQuestionUpdate = (
  updatedQuestion: ApplicationQuestionText | ApplicationQuestionMultiSelect,
  setApplicationQuestions: React.Dispatch<
    React.SetStateAction<(ApplicationQuestionText | ApplicationQuestionMultiSelect)[]>
  >,
) => {
  setApplicationQuestions((prev) => {
    // save it in the right order to be able to use stringify comparison

    return prev.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q))
  })
}
