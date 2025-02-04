import { AlertCircle } from 'lucide-react'
import { Button } from './ui/button'
import { useState } from 'react'
import { useSidebar } from './ui/sidebar'

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
  const { state } = useSidebar()

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
    <div
      className='fixed bottom-0 right-0 bg-background border-t border-border p-4 z-50 transition-all duration-300 ease-in-out'
      style={{
        width:
          state === 'expanded'
            ? 'calc(100% - var(--sidebar-width))'
            : 'calc(100% - var(--sidebar-width-icon))',
        left: state === 'expanded' ? 'var(--sidebar-width)' : 'var(--sidebar-width-icon)',
      }}
    >
      <div className='max-w-7xl mx-auto flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <AlertCircle className='h-4 w-4 text-yellow-500' />
          <p className='text-sm font-medium'>{message}</p>
        </div>
        <div className='flex space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRevert}
            disabled={isSaving}
            aria-label='Revert changes'
          >
            Revert
          </Button>
          <Button
            variant='default'
            size='sm'
            onClick={handleSave}
            disabled={isSaving}
            aria-label='Save changes'
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
      {error && (
        <p className='mt-2 text-sm text-destructive text-center' role='alert'>
          {error}
        </p>
      )}
    </div>
  )
}
