import { useState } from 'react'
import { AlertCircle, UserCheck, X, CheckSquare, ChevronDown, ChevronUp } from 'lucide-react'
import type { Seat } from '../../../../interfaces/Seat'
import type { Tutor } from '../../../../interfaces/Tutor'
import { SeatTutorTable } from './SeatTutorTable'
import { useUpdateSeats } from '../../hooks/useUpdateSeats'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Alert,
  AlertDescription,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Button,
} from '@tumaet/prompt-ui-components'

interface SeatTutorAssignerProps {
  seats: Seat[]
  tutors: Tutor[]
  numberOfStudents: number
}

export const SeatTutorAssigner = ({ seats, tutors, numberOfStudents }: SeatTutorAssignerProps) => {
  const [error, setError] = useState<string | null>(null)
  const [selectedSeatNames, setSelectedSeatNames] = useState<string[]>([])
  const [isCollapsed, setIsCollapsed] = useState(seats.some((seat) => seat.assignedTutor))

  const mutation = useUpdateSeats(setError)

  const handleTutorAssignment = (seatName: string, tutorId: string | null) => {
    const updatedSeat = seats.find((seat) => seat.seatName === seatName)
    if (!updatedSeat) return
    updatedSeat.assignedTutor = tutorId
    mutation.mutate([updatedSeat])
  }

  const handleBatchTutorAssignment = (tutorId: string | null) => {
    const updatedSeats: Seat[] = []
    selectedSeatNames.forEach((seatName) => {
      const toBeUpdatedSeat = seats.find((seat) => seat.seatName === seatName)
      if (!toBeUpdatedSeat) return
      toBeUpdatedSeat.assignedTutor = tutorId
      updatedSeats.push(toBeUpdatedSeat)
    })

    mutation.mutate(updatedSeats)
    setSelectedSeatNames([])
  }

  const clearSelection = () => {
    setSelectedSeatNames([])
  }

  // Calculate assignment statistics
  const assignedSeatsCount = seats.filter((seat) => seat.assignedTutor).length
  const totalRequiredSeats = Math.min(numberOfStudents, seats.length)

  // Group tutors by assignment count
  const tutorAssignmentCounts = tutors
    .map((tutor) => {
      const count = seats.filter((seat) => seat.assignedTutor === tutor.id).length
      return { tutor, count }
    })
    .sort((a, b) => a.count - b.count)

  return (
    <Card>
      <CardHeader className='cursor-pointer' onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>Step 3: Tutor Assignment</CardTitle>
            <CardDescription>Assign tutors to seats for student supervision</CardDescription>
          </div>
          <div className='flex items-center gap-2'>
            <div className='flex items-center text-purple-600 px-3 py-1.5 rounded-md'>
              <UserCheck className='h-5 w-5 mr-2' />
              <span className='text-sm font-medium'>
                {assignedSeatsCount} of {totalRequiredSeats} Required Seats Assigned
              </span>
            </div>
            {isCollapsed ? <ChevronDown className='h-4 w-4' /> : <ChevronUp className='h-4 w-4' />}
          </div>
        </div>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className='space-y-4'>
          {error && (
            <Alert variant='destructive' className='mb-4'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className='w-full md:w-64'>
            <div className='text-sm font-medium'>Tutor Assignment Distribution</div>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {tutorAssignmentCounts.map(({ tutor, count }) => (
                <div
                  key={tutor.id}
                  className='flex justify-between items-center text-sm border rounded-md p-3'
                >
                  <div className='truncate' title={`${tutor.firstName} ${tutor.lastName}`}>
                    {tutor.firstName} {tutor.lastName}
                  </div>
                  <Badge variant={count > 0 ? 'default' : 'outline'}>{count} seats</Badge>
                </div>
              ))}
              {tutors.length === 0 && (
                <div className='text-center text-muted-foreground text-sm py-2'>
                  No tutors available
                </div>
              )}
            </div>
          </div>

          {selectedSeatNames.length > 0 && (
            <div className='bg-muted p-4 rounded-md space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                  <CheckSquare className='h-5 w-5 mr-2 text-primary' />
                  <span className='font-medium'>{selectedSeatNames.length} seats selected</span>
                </div>
                <Button variant='ghost' size='sm' onClick={clearSelection}>
                  <X className='h-4 w-4 mr-1' />
                  Clear
                </Button>
              </div>

              <div className='flex flex-col sm:flex-row gap-2 items-start sm:items-center'>
                <span className='text-sm'>Assign selected seats to:</span>
                <div className='flex-1 max-w-xs'>
                  <Select
                    onValueChange={(value) =>
                      handleBatchTutorAssignment(value === 'none' ? null : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select a tutor' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='none'>None (Clear assignment)</SelectItem>
                      {tutors.map((tutor) => (
                        <SelectItem key={tutor.id} value={tutor.id}>
                          {tutor.firstName} {tutor.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <div className='flex flex-col md:flex-row gap-4'>
            <SeatTutorTable
              allSeats={seats}
              tutors={tutors}
              selectedSeatNames={selectedSeatNames}
              setSelectedSeatNames={setSelectedSeatNames}
              handleTutorAssignment={handleTutorAssignment}
            />
          </div>
        </CardContent>
      )}
    </Card>
  )
}
