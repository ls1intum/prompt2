import { CreateApplicationAnswerText } from '../../../../interfaces/application/applicationAnswer/text/createApplicationAnswerText'

export interface QuestionTextFormRef {
  validate: () => Promise<boolean>
  getValues: () => CreateApplicationAnswerText
}
