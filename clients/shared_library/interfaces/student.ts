import { Gender } from './gender'

export interface Student {
  id?: string
  first_name: string
  last_name: string
  email: string
  matriculation_number?: string
  university_login?: string
  has_university_account: boolean
  gender?: Gender
}
