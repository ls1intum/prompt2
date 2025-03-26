import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useTriggerAssessment } from '../pages/hooks/useTriggerAssessment'
import { useGetDeveloperProfile } from '../pages/hooks/useGetDeveloperProfile'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Github, ExternalLink, RefreshCw, CheckCircle, AlertCircle, Hourglass, Trophy } from 'lucide-react'
import { RepositoryInformation } from './RepositoryInformation'
import { Assessment } from './Assessment'

export const AssessmentPanel = (): JSX.Element => {
  const [error, setError] = useState<string | null>(null)
  const [confirmedOwnWork, setConfirmedOwnWork] = useState(false)

  const assessmentMutation = useTriggerAssessment(setError)
  const developerQuery = useGetDeveloperProfile()

  const remainingAttempts = Math.max(
    (developerQuery.data?.maxAttempts ?? 0) - (developerQuery.data?.attempts ?? 0),
    0,
  )

  const maxAttempts = developerQuery.data?.maxAttempts ?? 0

  const handleTriggerAssessment = () => {
    assessmentMutation.mutate()
    developerQuery.refetch()
  }

  return (
    <div className='grid gap-6 mt-4'>
      <RepositoryInformation />
      <Assessment />
    </div>
  )
}
