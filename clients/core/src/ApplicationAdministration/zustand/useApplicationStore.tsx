import { AdditionalScore } from '@/interfaces/additional_score'
import { ApplicationParticipation } from '@/interfaces/application_participations'
import { CoursePhaseWithMetaData } from '@/interfaces/course_phase'
import { create } from 'zustand'

interface ApplicationStoreState {
  additionalScores: AdditionalScore[]
  participations: ApplicationParticipation[]
  coursePhase: CoursePhaseWithMetaData
}

interface ApplicationStoreAction {
  setAdditionalScores: (additionalScores: AdditionalScore[]) => void
  setParticipations: (participations: ApplicationParticipation[]) => void
  setCoursePhase: (coursePhase: CoursePhaseWithMetaData) => void
}

export const useApplicationStore = create<ApplicationStoreState & ApplicationStoreAction>(
  (set) => ({
    additionalScores: [],
    participations: [],
    coursePhase: {} as CoursePhaseWithMetaData,
    setAdditionalScores: (additionalScores) => set({ additionalScores }),
    setParticipations: (participations) => set({ participations }),
    setCoursePhase: (coursePhase) => set({ coursePhase }),
  }),
)
