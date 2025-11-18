import { ExtraParticipationTableColumn } from '@/components/pages/CoursePhaseParticipationsTable/interfaces/ExtraParticipationTableColumn'
import { ApplicationParticipation } from '../../../../interfaces/applicationParticipation'

// define filter function for extra columns - use lowercase to avoid mismatch of f.e. 'Male' and 'male'
const genderFilterFn = (row: any, columnId: string, filterValue: any) => {
  const cell = String(row.getValue(columnId) ?? '')
  if (Array.isArray(filterValue)) {
    return filterValue.includes(cell)
  }
  return (
    String(filterValue) === cell || cell.toLowerCase().includes(String(filterValue).toLowerCase())
  )
}

// extra columns definition
export const baseApplicationExtraColumns = [
  {
    id: 'score',
    header: 'Score',
    enableSorting: true,
    filterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId)
      const score = value === '-' ? null : Number(value)

      const { min, max, noScore } = filterValue || {}

      if (!min && !max && !noScore) return true

      if (noScore) {
        return score === null || Number.isNaN(score)
      }

      if (score === null || Number.isNaN(score)) return false

      if (min && score < Number(min)) return false
      if (max && score > Number(max)) return false

      return true
    },
  },
  { id: 'email', header: 'Email', enableSorting: true },
  { id: 'studyProgram', header: 'Study Program', enableSorting: true },
  { id: 'studyDegree', header: 'Study Degree', enableSorting: true },
  {
    id: 'gender',
    header: 'Gender',
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: genderFilterFn,
  },
] as const

// populate extra columns with student data
export const getApplicationExtraColumns = (
  participations: ApplicationParticipation[] | undefined,
  additionalScores: { key: string; name: string }[] | undefined,
): ExtraParticipationTableColumn[] => {
  if (!participations || participations.length === 0) return []

  const columns: ExtraParticipationTableColumn[] = []

  for (const baseCol of baseApplicationExtraColumns) {
    const extraData = participations.map((app) => {
      switch (baseCol.id) {
        case 'score':
          return {
            courseParticipationID: app.courseParticipationID,
            value: app.score ?? '-',
            stringValue: app.score?.toString() ?? '',
          }
        case 'email':
          return {
            courseParticipationID: app.courseParticipationID,
            value: app.student.email ?? '',
            stringValue: app.student.email ?? '',
          }
        case 'studyProgram':
          return {
            courseParticipationID: app.courseParticipationID,
            value: app.student.studyProgram ?? '',
            stringValue: app.student.studyProgram ?? '',
          }
        case 'studyDegree':
          return {
            courseParticipationID: app.courseParticipationID,
            value: app.student.studyDegree ?? '',
            stringValue: app.student.studyDegree ?? '',
          }
        case 'gender':
          return {
            courseParticipationID: app.courseParticipationID,
            value: app.student.gender ?? '',
            stringValue: app.student.gender ?? '',
          }
        default:
          return {
            courseParticipationID: app.courseParticipationID,
            value: '',
            stringValue: '',
          }
      }
    })

    columns.push({ ...baseCol, extraData })
  }

  // handle dynamic additional scores
  for (const additionalScore of additionalScores ?? []) {
    const extraData = participations.map((app) => ({
      courseParticipationID: app.courseParticipationID,
      value: app.restrictedData?.[additionalScore.key] ?? null,
      stringValue: app.restrictedData?.[additionalScore.key]?.toString() ?? '',
    }))
    columns.push({
      id: additionalScore.key,
      header: additionalScore.name,
      extraData,
    })
  }

  return columns
}
