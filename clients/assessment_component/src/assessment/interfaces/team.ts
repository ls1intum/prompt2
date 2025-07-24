export type Team = {
  id: string
  name: string
  tutors: Person[]
  members: Person[]
}

export type Person = {
  id: string
  firstName: string
  lastName: string
}
