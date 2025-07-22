export type Team = {
  id: string
  name: string
  members: TeamMember[]
}

export type TeamMember = {
  id: string
  firstName: string
  lastName: string
}
