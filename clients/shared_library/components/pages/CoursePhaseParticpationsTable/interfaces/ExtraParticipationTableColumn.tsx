import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { Row } from '@tanstack/react-table'

import { ExtraParticipationTableData } from './ExtraParticipationTableData'

export interface ExtraParticipationTableColumn {
  id: string
  header: string
  extraData: ExtraParticipationTableData[]
  accessorFn?: (row: CoursePhaseParticipationWithStudent) => React.ReactNode
  enableSorting?: boolean
  sortingFn?: (
    rowA: Row<CoursePhaseParticipationWithStudent>,
    rowB: Row<CoursePhaseParticipationWithStudent>,
  ) => number
  enableColumnFilter?: boolean
  filterFn?: (row: CoursePhaseParticipationWithStudent, filterValue: string) => boolean
}
