import { CreateApplicationAnswerMultiSelect } from '../application/applicationAnswer/multiSelect/createApplicationAnswerMultiSelect'
import { CreateApplicationAnswerText } from '../application/applicationAnswer/text/createApplicationAnswerText'
import { Student } from '@tumaet/prompt-shared-state'

export interface PostApplication {
  student: Student
  answersText: CreateApplicationAnswerText[]
  answersMultiSelect: CreateApplicationAnswerMultiSelect[]
}
