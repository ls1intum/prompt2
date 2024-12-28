export interface ApplicationAnswerText {
  id: string
  application_question_id: string
  course_phase_participation_id: string
  answer: string
}

export interface CreateApplicationAnswerText {
  application_question_id: string
  answer: string
}
