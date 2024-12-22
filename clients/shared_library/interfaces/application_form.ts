import { ApplicationQuestionMultiSelect } from './application_question_multi_select'
import { ApplicationQuestionText } from './application_question_text'

export interface ApplicationForm {
  questions_text: ApplicationQuestionText[]
  questions_multi_select: ApplicationQuestionMultiSelect[]
}

export interface UpdateApplicationForm {
  delete_questions_text: string[]
  delete_questions_multi_select: string[]
  create_questions_text: ApplicationQuestionText[]
  create_questions_multi_select: ApplicationQuestionMultiSelect[]
  update_questions_text: ApplicationQuestionText[]
  update_questions_multi_select: ApplicationQuestionMultiSelect[]
}
