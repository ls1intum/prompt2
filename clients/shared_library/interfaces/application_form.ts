import { ApplicationQuestionMultiSelect } from './application_question_multi_select'
import { ApplicationQuestionText } from './application_question_text'

export interface ApplicationForm {
  questions_text: ApplicationQuestionText[]
  questions_multi_select: ApplicationQuestionMultiSelect[]
}
