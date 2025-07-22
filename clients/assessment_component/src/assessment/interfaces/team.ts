export type Team = {
  id: string
  name: string
  tutors: Person[]
  members: Person[]
}

export type Person = {
  courseParticipationID: string
  firstName: string
  lastName: string
}
