import { CreateApplicationAnswerMultiSelect } from './application_answer_multi_select'
import { CreateApplicationAnswerText } from './application_answer_text'
import { Student } from './student'

export interface PostApplication {
  student: Student
  answers_text: CreateApplicationAnswerText[]
  answers_multi_select: CreateApplicationAnswerMultiSelect[]
}
