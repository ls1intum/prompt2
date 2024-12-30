import { Badge } from '@/components/ui/badge'
import { PassStatus } from '@/interfaces/course_phase_participation'

export function getStatusBadge(status: PassStatus): JSX.Element {
  switch (status) {
    case 'passed':
      return <Badge className='bg-green-500 hover:bg-green-500'>Accepted</Badge>
    case 'failed':
      return <Badge className='bg-red-500 hover:bg-red-500'>Rejected</Badge>
    case 'not_assessed':
      return <Badge className='bg-gray-500 hover:bg-gray-500'>Not Assessed</Badge>
    default:
      return <Badge className='bg-gray-500 hover:bg-gray-500'>Unknown</Badge>
  }
}
