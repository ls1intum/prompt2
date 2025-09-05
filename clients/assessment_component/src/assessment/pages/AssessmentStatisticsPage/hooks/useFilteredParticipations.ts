import { useMemo } from 'react'
import { AssessmentCompletion } from '../../../interfaces/assessmentCompletion'
import { ParticipationWithAssessment } from '../../components/diagrams/interfaces/ParticipationWithAssessment'
import { StatisticsFilter } from '../components/FilterMenu'
import { AssessmentParticipationWithStudent } from '../../../interfaces/assessmentParticipationWithStudent'

interface UseFilteredParticipationsProps {
  participations: AssessmentParticipationWithStudent[] | null
  assessmentCompletions: AssessmentCompletion[] | null
  participationsWithAssessments: ParticipationWithAssessment[] | null
  filters: StatisticsFilter
}

interface UseFilteredParticipationsReturn {
  filteredParticipations: AssessmentParticipationWithStudent[]
  filteredParticipationWithAssessments: ParticipationWithAssessment[]
}

export const useFilteredParticipations = ({
  participations,
  assessmentCompletions,
  participationsWithAssessments,
  filters,
}: UseFilteredParticipationsProps): UseFilteredParticipationsReturn => {
  return useMemo(() => {
    if (!participations || !assessmentCompletions || !participationsWithAssessments) {
      return {
        filteredParticipations: [],
        filteredParticipationWithAssessments: [],
      }
    }

    let parts = participations
    let partsWithAssessments = participationsWithAssessments

    if (filters.genders && filters.genders.length > 0) {
      parts = parts.filter((p) => p.student.gender && filters.genders!.includes(p.student.gender))
      partsWithAssessments = partsWithAssessments.filter(
        (p) =>
          p.participation.student.gender &&
          filters.genders!.includes(p.participation.student.gender),
      )
    }

    if (filters.teams && filters.teams.length > 0) {
      parts = parts.filter((p) => filters.teams!.includes(p.teamID))
      partsWithAssessments = partsWithAssessments.filter((p) =>
        filters.teams!.includes(p.participation.teamID),
      )
    }

    if (filters.semester && (filters.semester.min || filters.semester.max)) {
      const { min, max } = filters.semester

      parts = parts.filter((p) => {
        const semester = p.student.currentSemester || 0
        const meetsMin = !min || semester >= min
        const meetsMax = !max || semester <= max
        return meetsMin && meetsMax
      })

      partsWithAssessments = partsWithAssessments.filter((p) => {
        const semester = p.participation.student.currentSemester || 0
        const meetsMin = !min || semester >= min
        const meetsMax = !max || semester <= max
        return meetsMin && meetsMax
      })
    }

    return {
      filteredParticipations: parts,
      filteredParticipationWithAssessments: partsWithAssessments,
    }
  }, [participations, assessmentCompletions, participationsWithAssessments, filters])
}
