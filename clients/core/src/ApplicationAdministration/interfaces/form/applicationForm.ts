import { ApplicationQuestionMultiSelect } from '../../../interfaces/application/applicationQuestion/applicationQuestionMultiSelect'
import { ApplicationQuestionText } from '../../../interfaces/application/applicationQuestion/applicationQuestionText'

export interface ApplicationForm {
  questionsText: ApplicationQuestionText[]
  questionsMultiSelect: ApplicationQuestionMultiSelect[]
}
