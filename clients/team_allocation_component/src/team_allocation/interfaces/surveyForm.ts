import { Skill } from './skill'
import { Team } from './team'

export type SurveyForm = {
  teams: Team[]
  skills: Skill[]
  deadline: Date
}
