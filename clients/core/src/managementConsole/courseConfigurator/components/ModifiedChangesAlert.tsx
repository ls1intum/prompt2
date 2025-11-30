import { Alert, AlertDescription, AlertTitle } from '@tumaet/prompt-ui-components'
import { AlertCircle } from 'lucide-react'

import { Button } from '@tumaet/prompt-ui-components'

interface ModifiedChangesAlertProps {
  handleRevert: () => void
  saveChanges: () => void
}

export function ModifiedChangesAlert({ handleRevert, saveChanges }: ModifiedChangesAlertProps) {
  return (
    <Alert variant='destructive' className='shadow-lg bg-white'>
      <AlertCircle className='h-4 w-4' />
      <AlertTitle>Unsaved Changes</AlertTitle>
      <AlertDescription className='flex items-center justify-between'>
        <span>This board has been modified. Would you like to save your changes?</span>
        <div className='space-y-1'>
          <Button variant='outline' size='sm' onClick={handleRevert} className='w-full'>
            Revert
          </Button>
          <Button variant='default' size='sm' onClick={saveChanges} className='w-full'>
            Save
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
