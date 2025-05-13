import { Alert, AlertDescription, AlertTitle } from '@tumaet/prompt-ui-components'
import { AlertCircle } from 'lucide-react'

interface LoadingErrorProps {
  phaseTitle: string
}

export const LoadingError = ({ phaseTitle }: LoadingErrorProps) => {
  return (
    <Alert variant='destructive'>
      <AlertCircle className='h-4 w-4' />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        We&apos;re sorry, but we couldn&apos;t load the {phaseTitle} routes. Please try refreshing
        or contact support if the problem persists.
      </AlertDescription>
    </Alert>
  )
}
