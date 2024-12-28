export interface ApplicationAnswerMultiSelect {
  id: string
  application_question_id: string
  course_phase_participation_id: string
  answer: string[]
}

export interface CreateApplicationAnswerMultiSelect {
  application_question_id: string
  answer: string[]
}
