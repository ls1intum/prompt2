import { Person } from './person'

export type Team = {
  id: string
  name: string
  members: Person[]
  tutors: Person[]
}
