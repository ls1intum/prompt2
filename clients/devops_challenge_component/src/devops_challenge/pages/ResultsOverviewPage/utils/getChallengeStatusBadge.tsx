import { Badge } from '@/components/ui/badge'
import { DeveloperProfile } from '../../../interfaces/DeveloperProfile'

export function getChallengeStatusBadgeFromString(status: string): JSX.Element {
  switch (status) {
    case 'passed':
      return <Badge className='border border-green-500 text-green-500'>Passed</Badge>
    case 'notCompleted':
      return <Badge className='border border-yellow-500 text-yellow-500'>Not Completed</Badge>
    case 'failed':
      return <Badge className='border border-red-500 text-red-500'>Failed</Badge>
    default:
      return <Badge className='border border-gray-500 text-gray-500'>Unknown</Badge>
  }
}

export function getChallengeStatusBadge(profile: DeveloperProfile | undefined): JSX.Element {
  if (profile?.hasPassed) {
    return getChallengeStatusBadgeFromString('passed')
  } else if (!profile?.hasPassed && (profile?.attempts ?? 0) < (profile?.maxAttempts ?? 1)) {
    return getChallengeStatusBadgeFromString('notCompleted')
  } else {
    return getChallengeStatusBadgeFromString('failed')
  }
}
