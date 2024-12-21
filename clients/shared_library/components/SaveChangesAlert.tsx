import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'
import { useState } from 'react'

interface SaveChangesAlertProps {
  message: string
  handleRevert: () => void
  saveChanges: () => Promise<void>
  onClose?: () => void
}

export const SaveChangesAlert = ({
  message,
  handleRevert,
  saveChanges,
  onClose,
}: SaveChangesAlertProps): JSX.Element => {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    try {
      await saveChanges()
      onClose?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Alert variant='default' className='mb-4 border-muted bg-muted/20'>
      <div className='flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
        <div className='flex items-center space-x-2'>
          <AlertCircle className='h-4 w-4 text-red-500' />
          <AlertTitle className='text-foreground'>{message}</AlertTitle>
        </div>
        <div className='flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRevert}
            disabled={isSaving}
            aria-label='Revert changes'
            className='w-full sm:w-auto'
          >
            Revert
          </Button>
          <Button
            variant='default'
            size='sm'
            onClick={handleSave}
            disabled={isSaving}
            aria-label='Save changes'
            className='w-full sm:w-auto'
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
      <AlertDescription className='mt-2'>
        {error && (
          <p className='text-sm text-destructive' role='alert'>
            {error}
          </p>
        )}
      </AlertDescription>
    </Alert>
  )
}
