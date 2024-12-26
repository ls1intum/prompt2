export interface ApplicationAnswerText {
  id: string
  applicationQuestionId: string
  coursePhaseParticipationId: string
  answer: string
}

export interface CreateApplicationAnswerText {
  applicationQuestionId: string
  answer: string
}
