export type Team = {
  id: string
  name: string
  members: TeamMember[]
}

export type TeamMember = {
  courseParticipationID: string
  studentName: string
}
