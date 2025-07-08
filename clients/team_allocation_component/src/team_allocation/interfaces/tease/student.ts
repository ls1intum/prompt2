import { Comment } from './comment'
import { Device } from './device'
import { Gender } from './gender'
import { Language } from './language'
import { ProjectPreference } from './projectPreference'
import { SkillProficiency } from './skillProficiency'
import { StudentSkill } from './studentSkill'

export interface TeaseStudent {
  devices: Array<Device>
  email: string
  firstName: string
  gender: Gender
  id: string
  introCourseProficiency: SkillProficiency
  introSelfEvaluation: SkillProficiency
  languages: Array<Language>
  lastName: string
  nationality: string
  projectPreferences: Array<ProjectPreference>
  semester: number
  skills: Array<StudentSkill>
  studentComments: Array<Comment>
  studyDegree: string
  studyProgram: string
  tutorComments: Array<Comment>
}
