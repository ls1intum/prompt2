export interface ApplicationAnswerMultiSelect {
  id: string
  applicationQuestionId: string
  coursePhaseParticipationId: string
  answer: string[]
}

export interface CreateApplicationAnswerMultiSelect {
  applicationQuestionId: string
  answer: string
}
