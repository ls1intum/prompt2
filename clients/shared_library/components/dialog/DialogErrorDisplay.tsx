import { AlertCircle } from 'lucide-react'

interface DialogErrorDisplayProps {
  customMessage?: string
  error: Error
}

export const DialogErrorDisplay = ({
  customMessage,
  error,
}: DialogErrorDisplayProps): JSX.Element => {
  return (
    <div className='flex flex-col items-center justify-center h-48'>
      <AlertCircle className='h-10 w-10 text-destructive' />
      <p className='mt-4 text-lg font-medium text-destructive'>Error: {error.message}</p>
      <p className='mt-2 text-sm text-muted-foreground'>
        {customMessage ?? 'Please try again or contact the administrators if the problem persists.'}
      </p>
    </div>
  )
}
