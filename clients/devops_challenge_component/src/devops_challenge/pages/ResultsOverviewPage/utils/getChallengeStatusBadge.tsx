import { Badge } from '@/components/ui/badge'
import { ChallengeStatus } from '../interfaces/challengeStatus'

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

export function getChallengeStatusBadge(challengeStatus: ChallengeStatus | undefined): JSX.Element {
  if (challengeStatus == ChallengeStatus.PASSED) {
    return getChallengeStatusBadgeFromString('passed')
  } else if (challengeStatus == ChallengeStatus.NOT_COMPLETED) {
    return getChallengeStatusBadgeFromString('notCompleted')
  } else {
    return getChallengeStatusBadgeFromString('')
  }
}
