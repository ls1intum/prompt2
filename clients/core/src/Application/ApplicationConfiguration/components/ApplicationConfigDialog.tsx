import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ApplicationMetaData } from '../interfaces/ApplicationMetaData'
import { DatePicker } from '@/components/DatePicker'
import { format } from 'date-fns'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UpdateCoursePhase } from '@/interfaces/course_phase'
import { updateCoursePhase } from '../../../network/mutations/updateCoursePhase'
import { useParams } from 'react-router-dom'
import { AlertCircle, Loader2 } from 'lucide-react'

interface ApplicationConfigDialogProps {
  isOpen: boolean
  onClose: () => void
  initialData: ApplicationMetaData
}

export function ApplicationConfigDialog({
  isOpen,
  onClose,
  initialData,
}: ApplicationConfigDialogProps) {
  const queryClient = useQueryClient()
  const { phaseId } = useParams<{ phaseId: string }>()
  const [startDate, setStartDate] = useState(initialData.applicationStartDate ?? undefined)
  const [endDate, setEndDate] = useState(initialData.applicationEndDate ?? undefined)
  const [externalStudentsAllowed, setExternalStudentsAllowed] = useState(
    initialData.externalStudentsAllowed,
  )

  const {
    mutate: mutatePhase,
    isError: isMutateError,
    error,
    isPending,
  } = useMutation({
    mutationFn: (coursePhase: UpdateCoursePhase) => {
      return updateCoursePhase(coursePhase)
    },
    onSuccess: () => {
      // invalidate query
      queryClient.invalidateQueries({ queryKey: ['course_phase', phaseId] })
      // close this window
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updatedPhase: UpdateCoursePhase = {
      id: phaseId ?? '',
      meta_data: {
        applicationStartDate: startDate,
        applicationEndDate: endDate,
        externalStudentsAllowed,
      },
    }
    mutatePhase(updatedPhase)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        {isPending ? (
          <div className='flex flex-col items-center justify-center h-48'>
            <Loader2 className='h-10 w-10 text-primary animate-spin' />
            <p className='mt-4 text-lg font-medium text-muted-foreground'>
              Saving application config...
            </p>
          </div>
        ) : isMutateError ? (
          <div className='flex flex-col items-center justify-center h-48'>
            <AlertCircle className='h-10 w-10 text-destructive' />
            <p className='mt-4 text-lg font-medium text-destructive'>Error: {error.message}</p>
            <p className='mt-2 text-sm text-muted-foreground'>
              Please try again or contact support if the problem persists.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Configure Application Phase</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className='grid gap-4 py-4'>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='startDate' className='text-right'>
                    Start Date
                  </Label>
                  <DatePicker
                    date={startDate ? new Date(startDate) : undefined}
                    //Force format of date to be yyyy-MM-dd to avoid timezone issues
                    onSelect={(date) =>
                      setStartDate(date ? new Date(format(date, 'yyyy-MM-dd')) : undefined)
                    }
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='endDate' className='text-right'>
                    End Date
                  </Label>
                  <DatePicker
                    date={endDate ? new Date(endDate) : undefined}
                    //Force format of date to be yyyy-MM-dd to avoid timezone issues
                    onSelect={(date) =>
                      setEndDate(date ? new Date(format(date, 'yyyy-MM-dd')) : undefined)
                    }
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='externalStudents' className='text-right'>
                    External Students Allowed
                  </Label>
                  <Switch
                    id='externalStudents'
                    checked={externalStudentsAllowed}
                    onCheckedChange={setExternalStudentsAllowed}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type='submit'>Save changes</Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
