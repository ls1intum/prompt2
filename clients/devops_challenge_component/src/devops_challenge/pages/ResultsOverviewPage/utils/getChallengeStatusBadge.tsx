import { Badge } from '@/components/ui/badge'
import { DeveloperWithInfo } from '../../../interfaces/DeveloperWithInfo'

export function getChallengeStatusBadgeFromString(status: string): JSX.Element {
  switch (status) {
    case 'passed':
      return <Badge className='border border-green-500 text-green-500'>Passed</Badge>
    case 'notCompleted':
      return <Badge className='border border-red-500 text-red-500'>Not Completed</Badge>
    default:
      return <Badge className='border border-gray-500 text-gray-500'>Not Started</Badge>
  }
}

export function getChallengeStatusBadge(profile: DeveloperWithInfo | undefined): JSX.Element {
  if (profile?.hasPassed) {
    return getChallengeStatusBadgeFromString('passed')
  } else if (profile?.hasPassed === false) {
    return getChallengeStatusBadgeFromString('notCompleted')
  } else {
    return getChallengeStatusBadgeFromString('')
  }
}
