import { ApplicationQuestionMultiSelect } from './application_question_multi_select'
import { ApplicationQuestionText } from './application_question_text'
import { OpenApplication } from './open_application'

export interface ApplicationFormWithDetails {
  application_phase: OpenApplication
  questions_text: ApplicationQuestionText[]
  questions_multi_select: ApplicationQuestionMultiSelect[]
}
