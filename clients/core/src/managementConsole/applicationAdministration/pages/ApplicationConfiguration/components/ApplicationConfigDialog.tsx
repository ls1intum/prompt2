import { useEffect, useState } from 'react'
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
import type { ApplicationMetaData } from '../../../interfaces/applicationMetaData'
import { DatePicker } from '@/components/DatePicker'
import { format, set, parse, formatISO } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UpdateCoursePhase } from '@tumaet/prompt-shared-state'
import { updateCoursePhase } from '@core/network/mutations/updateCoursePhase'
import { useParams } from 'react-router-dom'
import { DialogLoadingDisplay } from '@/components/dialog/DialogLoadingDisplay'
import { AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ApplicationConfigDialogError } from './ApplicationConfigDialogError'

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

  // States for form fields
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [startTime, setStartTime] = useState('00:00')
  const [endTime, setEndTime] = useState('23:59')
  const [externalStudentsAllowed, setExternalStudentsAllowed] = useState(false)
  const [universityLoginAvailable, setUniversityLoginAvailable] = useState(false)
  const [dateError, setDateError] = useState<string | null>(null)

  const timeZone = 'Europe/Berlin'

  // Effect to reinitialize form values on dialog open (or when initialData changes)
  useEffect(() => {
    if (isOpen) {
      setStartDate(
        initialData.applicationStartDate ? new Date(initialData.applicationStartDate) : undefined,
      )
      setEndDate(
        initialData.applicationEndDate ? new Date(initialData.applicationEndDate) : undefined,
      )
      setStartTime(
        initialData.applicationStartDate
          ? getTimeString(new Date(initialData.applicationStartDate))
          : '00:00',
      )
      setEndTime(
        initialData.applicationEndDate
          ? getTimeString(new Date(initialData.applicationEndDate))
          : '23:59',
      )
      setExternalStudentsAllowed(initialData?.externalStudentsAllowed ?? false)
      setUniversityLoginAvailable(initialData?.universityLoginAvailable ?? false)
      setDateError(null)
    }
  }, [isOpen, initialData])

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
    // Build full Date objects by combining the date and time values
    let startDateTime: Date | null = null
    let endDateTime: Date | null = null

    if (startDate) {
      const parsedStartTime = parse(startTime, 'HH:mm', new Date())
      startDateTime = set(startDate, {
        hours: parsedStartTime.getHours(),
        minutes: parsedStartTime.getMinutes(),
      })
    }
    if (endDate) {
      const parsedEndTime = parse(endTime, 'HH:mm', new Date())
      endDateTime = set(endDate, {
        hours: parsedEndTime.getHours(),
        minutes: parsedEndTime.getMinutes(),
      })
    }

    // Validate that the start date/time comes before the end date/time
    if (startDateTime && endDateTime && startDateTime.getTime() >= endDateTime.getTime()) {
      setDateError('Start date and time must be before end date and time.')
      return
    }
    // Clear any previous error
    setDateError(null)

    const updatedPhase: UpdateCoursePhase = {
      id: phaseId ?? '',
      restrictedData: {
        applicationStartDate: startDateTime
          ? formatISO(toZonedTime(startDateTime, timeZone))
          : undefined,
        applicationEndDate: endDateTime ? formatISO(toZonedTime(endDateTime, timeZone)) : undefined,
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
          <div className='space-y-4'>
            <ApplicationConfigDialogError error={error} />
            <Button onClick={onClose}>Close</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Configure Application Phase</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Note: All times are in German time (Europe/Berlin).
            </DialogDescription>

            {/* Display validation error if present */}
            {dateError && (
              <div
                className={`flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg
                    bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800`}
                role='alert'
              >
                <AlertCircle className='flex-shrink-0 inline w-4 h-4 mr-3' />
                <span className='sr-only'>Error</span>
                <div>
                  <span className='font-medium'>Validation error:</span> {dateError}
                </div>
              </div>
            )}

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
