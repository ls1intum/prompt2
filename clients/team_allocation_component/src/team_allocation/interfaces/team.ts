export type Team = {
  id: string
  name: string
  members: Person[]
  tutors: Person[]
}

export type Person = {
  courseParticipationID: string
  firstName: string
  lastName: string
}
