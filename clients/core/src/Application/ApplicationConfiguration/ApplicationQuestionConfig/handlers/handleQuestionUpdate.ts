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
    let updatedSanitizedQuestion: ApplicationQuestionText | ApplicationQuestionMultiSelect
    if ('options' in updatedQuestion) {
      updatedSanitizedQuestion = {
        id: updatedQuestion.id,
        course_phase_id: updatedQuestion.course_phase_id,
        title: updatedQuestion.title,
        description: updatedQuestion.description,
        placeholder: updatedQuestion.placeholder,
        error_message: updatedQuestion.error_message,
        is_required: updatedQuestion.is_required,
        min_select: updatedQuestion.min_select,
        max_select: updatedQuestion.max_select,
        options: updatedQuestion.options,
        order_num: updatedQuestion.order_num,
      }
    } else {
      updatedSanitizedQuestion = {
        id: updatedQuestion.id,
        course_phase_id: updatedQuestion.course_phase_id,
        title: updatedQuestion.title,
        description: updatedQuestion.description,
        placeholder: updatedQuestion.placeholder,
        validation_regex: updatedQuestion.validation_regex,
        error_message: updatedQuestion.error_message,
        is_required: updatedQuestion.is_required,
        allowed_length: updatedQuestion.allowed_length,
        order_num: updatedQuestion.order_num,
      }
    }
    return prev.map((q) => (q.id === updatedSanitizedQuestion.id ? updatedSanitizedQuestion : q))
  })
}
