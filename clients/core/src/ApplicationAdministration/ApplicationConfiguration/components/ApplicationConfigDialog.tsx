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
import { format, set, parse, formatISO } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UpdateCoursePhase } from '@/interfaces/course_phase'
import { updateCoursePhase } from '../../../network/mutations/updateCoursePhase'
import { useParams } from 'react-router-dom'
import { DialogLoadingDisplay } from '@/components/dialog/DialogLoadingDisplay'
import { DialogErrorDisplay } from '@/components/dialog/DialogErrorDisplay'
import { Input } from '@/components/ui/input'

interface ApplicationConfigDialogProps {
  isOpen: boolean
  onClose: () => void
  initialData: ApplicationMetaData
}

const getTimeString = (date: Date) => {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

export function ApplicationConfigDialog({
  isOpen,
  onClose,
  initialData,
}: ApplicationConfigDialogProps) {
  const queryClient = useQueryClient()
  const { phaseId } = useParams<{ phaseId: string }>()
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData.applicationStartDate ? new Date(initialData.applicationStartDate) : undefined,
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData.applicationEndDate ? new Date(initialData.applicationEndDate) : undefined,
  )
  const [startTime, setStartTime] = useState(() => {
    if (initialData.applicationStartDate) {
      const date = new Date(initialData.applicationStartDate)
      return getTimeString(date)
    }
    return '00:00'
  })

  const timeZone = 'Europe/Berlin'

  const [endTime, setEndTime] = useState(() => {
    if (initialData.applicationEndDate) {
      const date = new Date(initialData.applicationEndDate)
      return getTimeString(date)
    }
    return '23:59'
  })
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
      queryClient.invalidateQueries({ queryKey: ['course_phase', phaseId] })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updatedPhase: UpdateCoursePhase = {
      id: phaseId ?? '',
      meta_data: {
        applicationStartDate: startDate
          ? formatISO(
              toZonedTime(
                set(startDate, {
                  hours: parse(startTime, 'HH:mm', new Date()).getHours(),
                  minutes: parse(startTime, 'HH:mm', new Date()).getMinutes(),
                }),
                timeZone,
              ),
            )
          : undefined,
        applicationEndDate: endDate
          ? formatISO(
              toZonedTime(
                set(endDate, {
                  hours: parse(endTime, 'HH:mm', new Date()).getHours(),
                  minutes: parse(endTime, 'HH:mm', new Date()).getMinutes(),
                }),
                timeZone,
              ),
            )
          : undefined,
        externalStudentsAllowed,
      },
    }
    mutatePhase(updatedPhase)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        {isPending ? (
          <DialogLoadingDisplay customMessage='Saving application config...' />
        ) : isMutateError ? (
          <DialogErrorDisplay error={error} />
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
                  <div className='col-span-3 flex items-center gap-2'>
                    <DatePicker
                      date={startDate}
                      onSelect={(date) =>
                        setStartDate(date ? new Date(format(date, 'yyyy-MM-dd')) : undefined)
                      }
                    />
                    <Input
                      id='startTime'
                      type='time'
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className='w-24'
                    />
                  </div>
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='endDate' className='text-right'>
                    End Date
                  </Label>
                  <div className='col-span-3 flex flex-col gap-2'>
                    <div className='flex items-center gap-2'>
                      <DatePicker
                        date={endDate}
                        onSelect={(date) =>
                          setEndDate(date ? new Date(format(date, 'yyyy-MM-dd')) : undefined)
                        }
                      />
                      <Input
                        id='endTime'
                        type='time'
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className='w-24'
                      />
                    </div>
                    <p className='text-sm text-secondary-foreground'>
                      Note: All times are in German time (Europe/Berlin).
                    </p>
                  </div>
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
