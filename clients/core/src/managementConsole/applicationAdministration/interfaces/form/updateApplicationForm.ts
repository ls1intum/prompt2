import { ApplicationQuestionMultiSelect } from '@core/interfaces/application/applicationQuestion/applicationQuestionMultiSelect'
import { ApplicationQuestionText } from '@core/interfaces/application/applicationQuestion/applicationQuestionText'

export interface UpdateApplicationForm {
  deleteQuestionsText: string[]
  deleteQuestionsMultiSelect: string[]
  createQuestionsText: ApplicationQuestionText[]
  createQuestionsMultiSelect: ApplicationQuestionMultiSelect[]
  updateQuestionsText: ApplicationQuestionText[]
  updateQuestionsMultiSelect: ApplicationQuestionMultiSelect[]
}
