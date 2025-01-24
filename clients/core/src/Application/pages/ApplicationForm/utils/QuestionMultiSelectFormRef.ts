import { CreateApplicationAnswerMultiSelect } from '../../../../interfaces/application/applicationAnswer/multiSelect/createApplicationAnswerMultiSelect'

export interface QuestionMultiSelectFormRef {
  validate: () => Promise<boolean>
  getValues: () => CreateApplicationAnswerMultiSelect
}
