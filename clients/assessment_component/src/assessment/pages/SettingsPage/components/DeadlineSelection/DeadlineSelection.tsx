import { useState, useEffect } from 'react'
import { format } from 'date-fns'

import { Calendar } from 'lucide-react'

import {
  DatePicker,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
} from '@tumaet/prompt-ui-components'

import { useUpdateDeadline } from './hooks/useUpdateDeadline'
import { useDeadlineStore } from '../../../../zustand/useDeadlineStore'

export const DeadlineSelection = (): JSX.Element => {
  const [deadline, setDeadline] = useState<Date | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  const { deadline: currentDeadline } = useDeadlineStore()

  useEffect(() => {
    if (currentDeadline) {
      setDeadline(new Date(currentDeadline))
    }
  }, [currentDeadline])

  const updateDeadlineMutation = useUpdateDeadline(setError)
  const handleDeadlineUpdate = () => {
    if (deadline) {
      updateDeadlineMutation.mutate(deadline)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Calendar className='h-5 w-5' />
          Deadline
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <Label>Select Deadline Date</Label>

          <div className='flex items-center gap-2'>
            <DatePicker
              date={deadline}
              onSelect={(date) =>
                setDeadline(date ? new Date(format(date, 'yyyy-MM-dd')) : undefined)
              }
            />

            <Button
              onClick={handleDeadlineUpdate}
              disabled={!deadline || updateDeadlineMutation.isPending}
            >
              {updateDeadlineMutation.isPending ? 'Updating...' : 'Update Deadline'}
            </Button>
          </div>
        </div>

        {currentDeadline && (
          <div className='bg-blue-50 p-3 rounded-lg'>
            <p className='text-sm text-blue-800'>
              <strong>Current deadline:</strong>{' '}
              {currentDeadline
                ? format(new Date(currentDeadline), 'dd.MM.yyyy')
                : 'No deadline set'}
            </p>
          </div>
        )}

        {error && <div className='text-red-600 text-sm'>{error}</div>}

        {updateDeadlineMutation.isSuccess && (
          <div className='text-green-600 text-sm'>Deadline updated successfully!</div>
        )}
      </CardContent>
    </Card>
  )
}
