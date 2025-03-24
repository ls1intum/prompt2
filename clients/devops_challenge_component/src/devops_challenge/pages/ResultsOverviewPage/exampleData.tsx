import { CoursePhaseParticipationWithStudent, PassStatus } from '@tumaet/prompt-shared-state'
import { DeveloperWithInfo } from '../../interfaces/DeveloperWithInfo'

const john: CoursePhaseParticipationWithStudent = {
  coursePhaseID: '1',
  courseParticipationID: '1',
  passStatus: PassStatus.NOT_ASSESSED,
  restrictedData: {},
  studentReadableData: {},
  prevData: {
    challenge_passed: false,
    attempts: 2,
  },
  student: {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    hasUniversityAccount: false,
  },
}
const mike: CoursePhaseParticipationWithStudent = {
  coursePhaseID: '1',
  courseParticipationID: '2',
  passStatus: PassStatus.PASSED,
  restrictedData: {},
  studentReadableData: {},
  prevData: {
    challenge_passed: true,
    attempts: 3,
  },
  student: {
    id: '1',
    firstName: 'Mike',
    lastName: 'Master',
    email: 'mike.master@gmail.com',
    hasUniversityAccount: false,
  },
}
const exampleParticipantsWithResolution = {
  participations: [john, mike],
  resolution: [],
}
const exampleProfiles: DeveloperWithInfo[] = [
  {
    courseParticipationID: '1',
    githubUsername: 'john_doe',
    repositoryURL: '123',
    attempts: 2,
    hasPassed: true,
  },
  {
    courseParticipationID: '2',
    repositoryURL: '123',
    githubUsername: 'mike_master',
    attempts: 3,
    hasPassed: false,
  },
]
