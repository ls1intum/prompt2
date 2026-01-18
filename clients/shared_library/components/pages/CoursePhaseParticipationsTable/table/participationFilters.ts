import { getStatusBadge } from '@/utils/getStatusBadge'
import { PassStatus } from '@tumaet/prompt-shared-state'
import { TableFilter } from '@tumaet/prompt-ui-components'

export function getParticipantFilters(extraFilters: TableFilter[] = []): TableFilter[] {
  return [
    {
      type: 'select',
      id: 'passStatus',
      label: 'Status',
      options: Object.values(PassStatus),
      getDisplay: (v) => getStatusBadge(v as PassStatus),
    },
    ...extraFilters,
  ]
}
