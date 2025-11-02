import { TeamMember } from './teamMember'
import { Person } from './person'

export type Team = {
  id: string
  name: string
  members: TeamMember[]
  tutors: Person[]
}
