import { getStatusBadge } from '@/utils/getStatusBadge'
import { getChallengeStatusBadge } from './utils/getChallengeStatusBadge'

export const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) =>
      `${row.original.participation.student.firstName} ${row.original.participation.student.lastName}`,
  },
  {
    accessorKey: 'email',
    header: 'Mail',
    cell: ({ row }) => row.original.participation.student.email,
  },
  {
    accessorKey: 'passStatus',
    header: 'Pass Status',
    cell: ({ row }) => getStatusBadge(row.original.participation.passStatus),
  },
  {
    accessorKey: 'challengeStatus',
    header: 'Challenge Status',
    cell: ({ row }) => getChallengeStatusBadge(row.original.profile),
  },
  {
    accessorKey: 'attempts',
    header: 'Attempts',
    cell: ({ row }) => row.original.profile?.attempts,
  },
]
