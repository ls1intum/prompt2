import { CreateApplicationAnswerMultiSelect } from '@/interfaces/application_answer_multi_select'

export interface QuestionMultiSelectFormRef {
  validate: () => Promise<boolean>
  getValues: () => CreateApplicationAnswerMultiSelect
}
