import { Gender } from './gender'

export interface Student {
  id?: string
  firstName: string
  lastName: string
  email: string
  matriculationNumber?: string
  universityLogin?: string
  hasUniversityAccount: boolean
  gender?: Gender
}
