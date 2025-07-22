export type StudentNameUpdateRequest = {
  coursePhaseID: string
  studentNamesPerID: { [courseParticipationID: string]: StudentName } // key: UUID string, value: full name
}

export type StudentName = {
  firstName: string
  lastName: string
}
