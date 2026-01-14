import { ColumnDef } from '@tanstack/react-table'
import { ExtraParticipantColumn, ParticipantRow } from './participationRow'
import { getStatusBadge } from '@/utils/getStatusBadge'
import { PassStatus } from '@tumaet/prompt-shared-state'

export function getParticipantColumns(
  extraColumns: ExtraParticipantColumn[],
): ColumnDef<ParticipantRow>[] {
  return [
    {
      accessorKey: 'firstName',
      header: 'First name',
    },
    {
      accessorKey: 'lastName',
      header: 'Last name',
    },
    {
      accessorKey: 'matriculationNumber',
      header: 'Matriculation #',
    },
    {
      accessorKey: 'universityLogin',
      header: 'Login',
    },
    {
      accessorKey: 'passStatus',
      header: 'Status',
      cell: (info) => getStatusBadge(info.getValue() as PassStatus),
    },
    ...extraColumns,
  ]
}
