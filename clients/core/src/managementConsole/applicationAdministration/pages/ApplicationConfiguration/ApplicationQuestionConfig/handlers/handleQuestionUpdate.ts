import { ApplicationQuestionMultiSelect } from '@core/interfaces/application/applicationQuestion/applicationQuestionMultiSelect'
import { ApplicationQuestionText } from '@core/interfaces/application/applicationQuestion/applicationQuestionText'

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
