import { CreateApplicationAnswerText } from '@/interfaces/application_answer_text'

export interface QuestionTextFormRef {
  validate: () => Promise<boolean>
  getValues: () => CreateApplicationAnswerText
}
