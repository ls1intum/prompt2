import React, { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DeletePhaseButtonProps {
  onDelete: () => void
}

export const DeletePhaseButton = ({ onDelete }: DeletePhaseButtonProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)

  const handleDelete = () => {
    onDelete()
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon'>
          <Trash2 className='h-4 w-4 text-red-500' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80'>
        <div className='grid gap-4'>
          <div className='space-y-2'>
            <h4 className='font-medium leading-none'>Delete Phase</h4>
            <p className='text-sm text-muted-foreground'>
              Are you sure you want to delete this phase? This action cannot be undone.
            </p>
          </div>
          <div className='flex justify-end space-x-2'>
            <Button variant='outline' onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
