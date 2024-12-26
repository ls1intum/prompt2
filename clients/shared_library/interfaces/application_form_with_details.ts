import { ApplicationQuestionMultiSelect } from './application_question_multi_select'
import { ApplicationQuestionText } from './application_question_text'
import { OpenApplicationDetails } from './open_application_details'

export interface ApplicationFormWithDetails {
  application_phase: OpenApplicationDetails
  questions_text: ApplicationQuestionText[]
  questions_multi_select: ApplicationQuestionMultiSelect[]
}
