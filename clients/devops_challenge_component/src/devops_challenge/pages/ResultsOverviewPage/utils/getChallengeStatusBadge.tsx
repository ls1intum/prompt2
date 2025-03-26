import { Badge } from '@/components/ui/badge'
import { ChallengeStatus } from '../interfaces/challengeStatus'

export function getChallengeStatusBadgeFromString(status: string): JSX.Element {
  switch (status) {
    case 'passed':
      return <Badge className='bg-green-100 border border-green-500 text-green-700'>Passed</Badge>
    case 'notCompleted':
      return <Badge className='bg-red-100 border border-red-500 text-red-700'>Not Completed</Badge>
    default:
      return <Badge className='bg-gray-100 border border-gray-500 text-gray-700'>Not Started</Badge>
  }
}

export function getChallengeStatusBadge(challengeStatus: ChallengeStatus | undefined): JSX.Element {
  if (challengeStatus == ChallengeStatus.PASSED) {
    return getChallengeStatusBadgeFromString('passed')
  } else if (challengeStatus == ChallengeStatus.NOT_COMPLETED) {
    return getChallengeStatusBadgeFromString('notCompleted')
  } else {
    return getChallengeStatusBadgeFromString('')
  }
}
