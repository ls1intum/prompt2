import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
