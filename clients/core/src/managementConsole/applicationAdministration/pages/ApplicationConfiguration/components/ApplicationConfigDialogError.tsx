import { Alert, AlertDescription, AlertTitle } from '@tumaet/prompt-ui-components'
import { AlertCircle } from 'lucide-react'

export const ApplicationConfigDialogError = ({ error }: { error: Error }) => (
  <Alert variant='destructive'>
    <AlertCircle className='h-4 w-4' />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>
      {error.message || 'An unexpected error occurred. Please try again.'}
    </AlertDescription>
  </Alert>
)
