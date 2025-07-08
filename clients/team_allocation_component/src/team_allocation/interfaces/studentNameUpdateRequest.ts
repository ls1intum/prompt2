export type StudentNameUpdateRequest = {
  coursePhaseID: string
  studentNames: { [courseParticipationID: string]: string } // key: UUID string, value: full name
}
