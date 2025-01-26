import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ApplicationMetaData } from '../../../interfaces/applicationMetaData'
import { DatePicker } from '@/components/DatePicker'
import { format, set, parse, formatISO } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UpdateCoursePhase } from '@tumaet/prompt-shared-state'
import { updateCoursePhase } from '@core/network/mutations/updateCoursePhase'
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

  const [endTime, setEndTime] = useState(() => {
    if (initialData.applicationEndDate) {
      const date = new Date(initialData.applicationEndDate)
      return getTimeString(date)
    }
    return '23:59'
  })

  const timeZone = 'Europe/Berlin'

  const [externalStudentsAllowed, setExternalStudentsAllowed] = useState(
    initialData.externalStudentsAllowed,
  )

  const [universityLoginAvailable, setUniversityLoginAvailable] = useState(
    initialData.universityLoginAvailable,
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
      metaData: {
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
        universityLoginAvailable,
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
            <DialogDescription>
              Note: All times are in German time (Europe/Berlin).
            </DialogDescription>

            <form onSubmit={handleSubmit}>
              <div className='grid gap-4 py-4'>
                {/* Start Date/Time */}
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

                {/* End Date/Time */}
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='endDate' className='text-right'>
                    End Date
                  </Label>
                  <div className='col-span-3 flex items-center gap-2'>
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
                </div>

                {/* University Login Available */}
                <div className='grid grid-cols-4 items-start gap-4'>
                  <Label htmlFor='universityLoginAvailable' className='text-right pt-2'>
                    Enforce Student Login
                  </Label>
                  <div className='col-span-3 flex flex-col gap-2'>
                    <Switch
                      id='universityLoginAvailable'
                      checked={universityLoginAvailable}
                      onCheckedChange={setUniversityLoginAvailable}
                    />
                    <p className='text-sm text-muted-foreground'>
                      This option is highly recommended. But, it requires a Keycloak Login for
                      Students which provides Matriculation number and University Login in the token
                      data.
                    </p>
                  </div>
                </div>

                {/* External Students Allowed */}
                <div className='grid grid-cols-4 items-start gap-4'>
                  <Label htmlFor='externalStudentsAllowed' className='text-right pt-2'>
                    Allow External Students
                  </Label>
                  <div className='col-span-3 flex flex-col gap-2'>
                    <Switch
                      id='externalStudentsAllowed'
                      checked={externalStudentsAllowed}
                      onCheckedChange={setExternalStudentsAllowed}
                    />
                    <p className='text-sm text-muted-foreground'>
                      This option is to allow external students to apply without login and
                      matriculation number.
                    </p>
                  </div>
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
