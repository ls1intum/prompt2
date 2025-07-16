import { StudentAssessment } from '../interfaces/studentAssessment'

import { Assessment } from '../interfaces/assessment'
import { AssessmentCompletion } from '../interfaces/assessmentCompletion'
import { StudentScore } from '../interfaces/studentScore'
import { Evaluation } from '../interfaces/evaluation'
import { FeedbackItem } from '../interfaces/feedbackItem'

import { create } from 'zustand'

export interface StudentAssessmentStore {
  courseParticipationID: string | undefined
  assessments: Assessment[]
  assessmentCompletion: AssessmentCompletion | undefined
  studentScore: StudentScore | undefined
  selfEvaluations: Evaluation[]
  peerEvaluations: Evaluation[]
  positiveFeedbackItems: FeedbackItem[]
  negativeFeedbackItems: FeedbackItem[]
  setStudentAssessment: (assessment: StudentAssessment) => void
}

export const useStudentAssessmentStore = create<StudentAssessmentStore>((set) => ({
  courseParticipationID: undefined,
  assessments: [],
  assessmentCompletion: undefined,
  studentScore: undefined,
  selfEvaluations: [],
  peerEvaluations: [],
  positiveFeedbackItems: [],
  negativeFeedbackItems: [],

  setStudentAssessment: (assessment) =>
    set({
      courseParticipationID: assessment.courseParticipationID,
      assessments: assessment.assessments,
      assessmentCompletion: assessment.assessmentCompletion,
      studentScore: assessment.studentScore,
      selfEvaluations: assessment.selfEvaluations,
      peerEvaluations: assessment.peerEvaluations,
      positiveFeedbackItems: assessment.positiveFeedbackItems,
      negativeFeedbackItems: assessment.negativeFeedbackItems,
    }),
}))
