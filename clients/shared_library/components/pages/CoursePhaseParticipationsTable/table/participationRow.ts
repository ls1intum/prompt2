import { ColumnDef } from '@tanstack/react-table'
import type { AccessorFn, SortingFn, FilterFn } from '@tanstack/react-table'
import {
  CoursePhaseParticipationWithStudent,
  PassStatus,
  Student,
} from '@tumaet/prompt-shared-state'

export interface ParticipantRow {
  id: string

  coursePhaseID: string
  courseParticipationID: string
  passStatus: PassStatus

  restrictedData: Record<string, any>
  studentReadableData?: Record<string, any>
  prevData?: Record<string, any>

  student: Student

  firstName: string
  lastName: string
  email?: string
  matriculationNumber?: string
  universityLogin?: string

  [key: string]: unknown
}

export interface ExtraParticipantColumn {
  id: string
  header: string

  accessorFn?: AccessorFn<ParticipantRow>
  cell?: ColumnDef<ParticipantRow>['cell']

  enableSorting?: boolean
  sortingFn?: SortingFn<ParticipantRow>

  enableColumnFilter?: boolean
  filterFn?: FilterFn<ParticipantRow>

  extraData: {
    courseParticipationID: string
    value: React.ReactNode
    stringValue?: string
  }[]
}

export function buildParticipantRows(
  participants: CoursePhaseParticipationWithStudent[],
  extraColumns: ExtraParticipantColumn[],
): ParticipantRow[] {
  return participants.map((p) => ({
    id: p.courseParticipationID,

    coursePhaseID: p.coursePhaseID,
    courseParticipationID: p.courseParticipationID,
    passStatus: p.passStatus,

    restrictedData: p.restrictedData,
    studentReadableData: p.studentReadableData,
    prevData: p.prevData,

    student: p.student,

    firstName: p.student.firstName,
    lastName: p.student.lastName,
    email: p.student.email,
    matriculationNumber: p.student.matriculationNumber,
    universityLogin: p.student.universityLogin,

    ...Object.fromEntries(
      extraColumns.map((col) => [
        col.id,
        col.extraData.find((d) => d.courseParticipationID === p.courseParticipationID)?.value ??
          null,
      ]),
    ),
  }))
}
