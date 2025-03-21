import { create } from 'zustand'
import { DeveloperProfile } from '../interfaces/DeveloperProfile'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { SeatAssignment } from '../pages/SeatAssignment/interfaces/SeatAssignment'

interface IntroCourseStoreState {
  developerProfile?: DeveloperProfile
  coursePhaseParticipation?: CoursePhaseParticipationWithStudent
  seatAssignment?: SeatAssignment
}

interface IntroCourseStoreAction {
  setDeveloperProfile: (developerProfile?: DeveloperProfile) => void
  setCoursePhaseParticipation: (
    coursePhaseParticipation: CoursePhaseParticipationWithStudent,
  ) => void
  setSeatAssignment: (seatAssignment?: SeatAssignment) => void
}

export const useIntroCourseStore = create<IntroCourseStoreState & IntroCourseStoreAction>(
  (set) => ({
    developerProfile: undefined,
    coursePhaseParticipation: undefined,
    seatAssignment: undefined,
    setDeveloperProfile: (developerProfile) => set({ developerProfile }),
    setCoursePhaseParticipation: (coursePhaseParticipation) => set({ coursePhaseParticipation }),
    setSeatAssignment: (seatAssignment) => set({ seatAssignment }),
  }),
)
