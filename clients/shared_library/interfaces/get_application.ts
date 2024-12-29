import { ApplicationAnswerMultiSelect } from './application_answer_multi_select'
import { ApplicationAnswerText } from './application_answer_text'
import { Student } from './student'

export enum ApplicationStatus {
  STATUS_NOT_APPLIED = 'not_applied',
  STATUS_APPLIED = 'applied',
  STATUS_NEW_USER = 'new_user',
}

export interface GetApplication {
  status: ApplicationStatus
  student?: Student
  answers_text: ApplicationAnswerText[]
  answers_multi_select: ApplicationAnswerMultiSelect[]
}
