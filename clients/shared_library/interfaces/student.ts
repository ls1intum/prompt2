import { Gender } from './gender'
import { StudyDegree } from './study_degree'

export interface Student {
  id?: string
  first_name: string
  last_name: string
  email: string
  matriculation_number?: string
  university_login?: string
  has_university_account: boolean
  gender?: Gender
  nationality?: string
  study_degree?: StudyDegree
  current_semester?: number
  study_program?: string
}
