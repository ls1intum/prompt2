import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { interviewAxiosInstance } from '../../network/interviewServerConfig'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Alert,
  AlertDescription,
  cn,
} from '@tumaet/prompt-ui-components'
import { Calendar, Clock, MapPin, Users, CheckCircle2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

interface InterviewSlot {
  id: string
  course_phase_id: string
  start_time: string
  end_time: string
  location: string | null
  capacity: number
  assigned_count: number
  created_at: string
  updated_at: string
}

interface InterviewAssignment {
  id: string
  interview_slot_id: string
  course_participation_id: string
  assigned_at: string
  slot_details?: InterviewSlot
}

export const StudentInterviewPage = () => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  // Fetch all available slots
  const { data: slots, isLoading: slotsLoading } = useQuery<InterviewSlot[]>({
    queryKey: ['interviewSlots', phaseId],
    queryFn: async () => {
      const response = await interviewAxiosInstance.get(
        `interview-service/api/course_phase/${phaseId}/interview-slots`,
      )
      return response.data
    },
    enabled: !!phaseId,
  })

  // Fetch user's current assignment
  const { data: myAssignment, isLoading: assignmentLoading } = useQuery<InterviewAssignment>({
    queryKey: ['myInterviewAssignment', phaseId],
    queryFn: async () => {
      const response = await interviewAxiosInstance.get(
        `interview-service/api/course_phase/${phaseId}/interview-assignments/my-assignment`,
      )
      return response.data
    },
    enabled: !!phaseId,
    retry: false,
  })

  // Book interview slot mutation
  const bookSlotMutation = useMutation({
    mutationFn: async (slotId: string) => {
      const response = await interviewAxiosInstance.post(
        `interview-service/api/course_phase/${phaseId}/interview-assignments`,
        { interview_slot_id: slotId },
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myInterviewAssignment', phaseId] })
      queryClient.invalidateQueries({ queryKey: ['interviewSlots', phaseId] })
      setSelectedSlotId(null)
    },
  })

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      await interviewAxiosInstance.delete(
        `interview-service/api/course_phase/${phaseId}/interview-assignments/${assignmentId}`,
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myInterviewAssignment', phaseId] })
      queryClient.invalidateQueries({ queryKey: ['interviewSlots', phaseId] })
    },
  })

  const handleBookSlot = () => {
    if (selectedSlotId) {
      bookSlotMutation.mutate(selectedSlotId)
    }
  }

  const handleCancelBooking = () => {
    if (myAssignment?.id) {
      cancelBookingMutation.mutate(myAssignment.id)
    }
  }

  const isSlotFull = (slot: InterviewSlot) => slot.assigned_count >= slot.capacity
  const isSlotPast = (slot: InterviewSlot) => new Date(slot.start_time) < new Date()

  if (slotsLoading || assignmentLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-muted-foreground'>Loading interview slots...</div>
      </div>
    )
  }

  return (
    <div className='container mx-auto py-8 px-4 max-w-6xl'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Interview Scheduling</h1>
        <p className='text-muted-foreground'>Select an available time slot for your interview</p>
      </div>

      {/* Current Booking Status */}
      {myAssignment && myAssignment.slot_details && (
        <Alert className='mb-6 border-green-500 bg-green-50 dark:bg-green-950'>
          <CheckCircle2 className='h-4 w-4 text-green-600' />
          <AlertDescription className='ml-2'>
            <div className='font-semibold text-green-900 dark:text-green-100 mb-2'>
              You have successfully booked your interview slot
            </div>
            <div className='text-sm text-green-800 dark:text-green-200 space-y-1'>
              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                <span>
                  {format(new Date(myAssignment.slot_details.start_time), 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Clock className='h-4 w-4' />
                <span>
                  {format(new Date(myAssignment.slot_details.start_time), 'HH:mm')} -{' '}
                  {format(new Date(myAssignment.slot_details.end_time), 'HH:mm')}
                </span>
              </div>
              {myAssignment.slot_details.location && (
                <div className='flex items-center gap-2'>
                  <MapPin className='h-4 w-4' />
                  <span>{myAssignment.slot_details.location}</span>
                </div>
              )}
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={handleCancelBooking}
              disabled={cancelBookingMutation.isPending}
              className='mt-3 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950'
            >
              {cancelBookingMutation.isPending ? 'Canceling...' : 'Cancel Booking'}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Available Slots */}
      {!myAssignment && (
        <>
          {slots && slots.length > 0 ? (
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {slots.map((slot) => {
                const isFull = isSlotFull(slot)
                const isPast = isSlotPast(slot)
                const isDisabled = isFull || isPast
                const isSelected = selectedSlotId === slot.id

                return (
                  <Card
                    key={slot.id}
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-md',
                      isSelected && 'ring-2 ring-primary',
                      isDisabled && 'opacity-50 cursor-not-allowed',
                    )}
                    onClick={() => !isDisabled && setSelectedSlotId(slot.id)}
                  >
                    <CardHeader>
                      <div className='flex justify-between items-start'>
                        <CardTitle className='text-lg'>
                          {format(new Date(slot.start_time), 'EEE, MMM d')}
                        </CardTitle>
                        {isFull ? (
                          <Badge variant='destructive'>Full</Badge>
                        ) : isPast ? (
                          <Badge variant='secondary'>Past</Badge>
                        ) : (
                          <Badge variant='secondary' className='bg-green-100 text-green-800'>
                            Available
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        <div className='flex items-center gap-1 mt-1'>
                          <Clock className='h-3 w-3' />
                          <span className='text-sm'>
                            {format(new Date(slot.start_time), 'HH:mm')} -{' '}
                            {format(new Date(slot.end_time), 'HH:mm')}
                          </span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {slot.location && (
                        <div className='flex items-center gap-2 text-sm text-muted-foreground mb-2'>
                          <MapPin className='h-4 w-4' />
                          <span>{slot.location}</span>
                        </div>
                      )}
                      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <Users className='h-4 w-4' />
                        <span>
                          {slot.assigned_count} / {slot.capacity} booked
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Alert>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription className='ml-2'>
                No interview slots are currently available. Please check back later.
              </AlertDescription>
            </Alert>
          )}

          {selectedSlotId && (
            <div className='mt-6 flex justify-center'>
              <Button size='lg' onClick={handleBookSlot} disabled={bookSlotMutation.isPending}>
                {bookSlotMutation.isPending ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
