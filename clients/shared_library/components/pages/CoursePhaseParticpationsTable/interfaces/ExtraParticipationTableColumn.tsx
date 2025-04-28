import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'

import { ExtraParticipationTableData } from './ExtraParticipationTableData'

export interface ExtraParticipationTableColumn {
  id: string
  header: string
  extraData: ExtraParticipationTableData[]
  accessorFn?: (row: CoursePhaseParticipationWithStudent) => React.ReactNode
  enableSorting?: boolean
  sortingFn?: (
    rowA: CoursePhaseParticipationWithStudent,
    rowB: CoursePhaseParticipationWithStudent,
  ) => number
  enableColumnFilter?: boolean
  filterFn?: (row: CoursePhaseParticipationWithStudent, filterValue: string) => boolean
}
