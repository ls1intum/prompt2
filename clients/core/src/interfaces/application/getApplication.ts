import { Student } from '@tumaet/prompt-shared-state'
import { ApplicationAnswerMultiSelect } from './applicationAnswer/multiSelect/applicationAnswerMultiSelect'
import { ApplicationAnswerText } from './applicationAnswer/text/applicationAnswerText'
import { ApplicationStatus } from './applicationStatus'

export interface GetApplication {
  status: ApplicationStatus
  student?: Student
  answersText: ApplicationAnswerText[]
  answersMultiSelect: ApplicationAnswerMultiSelect[]
}
