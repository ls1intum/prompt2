import { useState, useEffect, useMemo, useCallback } from 'react'
import { Seat } from '../../../../interfaces/Seat'
import { useUpdateSeats } from '../../hooks/useUpdateSeats'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { DeveloperProfile } from '../../../../interfaces/DeveloperProfile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChevronDown,
  ChevronUp,
  Download,
  AlertCircle,
  UserCheck,
  Users,
  Laptop,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { JSX } from 'react/jsx-runtime'
import { ResetSeatAssignmentDialog } from './ResetSeatAssignmentDialog'

interface SeatStudentAssignerProps {
  existingSeats: Seat[]
  developerWithProfiles: {
    participation: CoursePhaseParticipationWithStudent
    profile: DeveloperProfile | undefined
  }[]
}

// Helper function to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => array.slice().sort(() => Math.random() - 0.5)

export const SeatStudentAssigner = ({
  existingSeats,
  developerWithProfiles,
}: SeatStudentAssignerProps): JSX.Element => {
  const [error, setError] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [seats, setSeats] = useState<Seat[]>([])
  const [assignmentStatus, setAssignmentStatus] = useState<'none' | 'partial' | 'complete'>('none')

  const mutation = useUpdateSeats(setError)

  // Updates assignment status based on number of assigned students
  const updateAssignmentStatus = useCallback(
    (seatsToCheck: Seat[]) => {
      const assignedCount = seatsToCheck.filter((seat) => seat.assignedStudent).length
      if (assignedCount === 0) setAssignmentStatus('none')
      else if (assignedCount < developerWithProfiles.length) setAssignmentStatus('partial')
      else setAssignmentStatus('complete')
    },
    [developerWithProfiles.length],
  )

  // Initialize seats and assignment status on mount and when props change
  useEffect(() => {
    setSeats(existingSeats)
    updateAssignmentStatus(existingSeats)
  }, [existingSeats, developerWithProfiles, updateAssignmentStatus])

  // Check if assignment is possible
  const canAssignStudents = useCallback(() => {
    const seatsWithTutors = seats.filter((seat) => seat.assignedTutor).length
    const studentsWithoutMacs = developerWithProfiles.filter(
      (dev) => dev.profile?.hasMacBook === false,
    ).length
    const seatsWithMacs = seats.filter((seat) => seat.hasMac).length

    if (seatsWithTutors < developerWithProfiles.length) {
      setError(
        `Not enough seats with tutors assigned. Need ${developerWithProfiles.length} seats with tutors, but only have ${seatsWithTutors}.`,
      )
      return false
    }
    if (seatsWithMacs < studentsWithoutMacs) {
      setError(
        `Not enough seats with Macs. Need ${studentsWithoutMacs} seats with Macs for students without Macs, but only have ${seatsWithMacs}.`,
      )
      return false
    }
    setError(null)
    return true
  }, [seats, developerWithProfiles])

  // Assign students to seats
  const assignStudents = useCallback(() => {
    if (!canAssignStudents()) return

    // Create a copy and clear any existing student assignments
    const updatedSeats: Seat[] = seats.map((seat) => ({ ...seat, assignedStudent: null }))
    const eligibleSeats = updatedSeats.filter((seat) => seat.assignedTutor)

    // Separate students by Mac ownership
    const studentsWithMacs = developerWithProfiles.filter((dev) => dev.profile?.hasMacBook === true)
    const studentsWithoutMacs = developerWithProfiles.filter(
      (dev) => dev.profile?.hasMacBook === false,
    )
    const studentsUnknownMac = developerWithProfiles.filter(
      (dev) => dev.profile?.hasMacBook === undefined,
    )

    // Separate eligible seats by Mac availability
    const seatsWithMacs = eligibleSeats.filter((seat) => seat.hasMac)
    const seatsWithoutMacs = eligibleSeats.filter((seat) => !seat.hasMac)

    // Randomize arrays
    const shuffledStudentsWithoutMacs = shuffleArray(studentsWithoutMacs)
    const shuffledStudentsWithMacs = shuffleArray(studentsWithMacs)
    const shuffledStudentsUnknownMac = shuffleArray(studentsUnknownMac)
    const shuffledSeatsWithMacs = shuffleArray(seatsWithMacs)
    const shuffledSeatsWithoutMacs = shuffleArray(seatsWithoutMacs)

    // Assign students without Macs first to seats with Macs
    shuffledStudentsWithoutMacs.forEach((student, index) => {
      if (index < shuffledSeatsWithMacs.length) {
        const seatName = shuffledSeatsWithMacs[index].seatName
        const seatIndex = updatedSeats.findIndex((s) => s.seatName === seatName)
        if (seatIndex !== -1) {
          updatedSeats[seatIndex].assignedStudent = student.participation.student.id ?? null
        }
      }
    })

    // Assign remaining students to remaining seats
    const remainingSeatsWithMacs = shuffledSeatsWithMacs.slice(shuffledStudentsWithoutMacs.length)
    const allRemainingSeats = [...remainingSeatsWithMacs, ...shuffledSeatsWithoutMacs]
    const allRemainingStudents = [...shuffledStudentsWithMacs, ...shuffledStudentsUnknownMac]

    allRemainingStudents.forEach((student, index) => {
      if (index < allRemainingSeats.length) {
        const seatName = allRemainingSeats[index].seatName
        const seatIndex = updatedSeats.findIndex((s) => s.seatName === seatName)
        if (seatIndex !== -1) {
          updatedSeats[seatIndex].assignedStudent = student.participation.student.id ?? null
        }
      }
    })

    setSeats(updatedSeats)
    mutation.mutate(updatedSeats)
    updateAssignmentStatus(updatedSeats)
  }, [seats, developerWithProfiles, canAssignStudents, mutation, updateAssignmentStatus])

  // Reset student assignments
  const resetAssignments = useCallback(() => {
    const updatedSeats = seats.map((seat) => ({ ...seat, assignedStudent: null }))
    setSeats(updatedSeats)
    mutation.mutate(updatedSeats)
    setAssignmentStatus('none')
  }, [seats, mutation])

  // Download assignments as CSV
  const downloadAssignments = useCallback(() => {
    const getStudentName = (studentId: string | null) => {
      if (!studentId) return 'Unassigned'
      const student = developerWithProfiles.find(
        (dev) => dev.participation.student.id === studentId,
      )
      return student
        ? `${student.participation.student.firstName} ${student.participation.student.lastName}`
        : 'Unknown'
    }
    const getTutorName = (tutorId: string | null) => (tutorId ? tutorId : 'Unassigned')

    const csvContent = [
      ['Seat', 'Has Mac', 'Device ID', 'Assigned Student', 'Assigned Tutor'].join(','),
      ...seats.map((seat) =>
        [
          seat.seatName,
          seat.hasMac ? 'Yes' : 'No',
          seat.deviceID || '',
          getStudentName(seat.assignedStudent),
          getTutorName(seat.assignedTutor),
        ].join(','),
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'seat_assignments.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [seats, developerWithProfiles])

  // Memoized stats for display
  const stats = useMemo(() => {
    const totalStudents = developerWithProfiles.length
    const assignedStudents = seats.filter((seat) => seat.assignedStudent).length
    const studentsWithoutMacs = developerWithProfiles.filter(
      (dev) => dev.profile?.hasMacBook === false,
    ).length
    const seatsWithMacs = seats.filter((seat) => seat.hasMac).length
    const seatsWithTutors = seats.filter((seat) => seat.assignedTutor).length
    return {
      totalStudents,
      assignedStudents,
      unassignedStudents: totalStudents - assignedStudents,
      studentsWithoutMacs,
      seatsWithMacs,
      seatsWithTutors,
    }
  }, [seats, developerWithProfiles])

  return (
    <Card>
      <CardHeader className='cursor-pointer' onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>Step 4: Student Assignment</CardTitle>
            <CardDescription>
              Randomly assign students to seats with tutors, prioritizing Mac seats for students
              without Macs
            </CardDescription>
          </div>
          <div className='flex items-center gap-2'>
            <div className='flex items-center text-purple-600 bg-purple-50 px-3 py-1.5 rounded-md'>
              <Users className='h-5 w-5 mr-2' />
              <span className='text-sm font-medium'>
                {stats.assignedStudents} of {stats.totalStudents} Students Assigned
              </span>
            </div>
            {isCollapsed ? <ChevronDown className='h-4 w-4' /> : <ChevronUp className='h-4 w-4' />}
          </div>
        </div>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className='space-y-4'>
          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className='flex flex-col sm:flex-row gap-2 justify-between'>
            <div className='space-y-1'>
              <div className='text-sm font-medium'>Assignment Status</div>
              <div className='flex items-center'>
                {assignmentStatus === 'none' && (
                  <Badge variant='outline' className='bg-gray-50 text-gray-600'>
                    Not Assigned
                  </Badge>
                )}
                {assignmentStatus === 'partial' && (
                  <Badge variant='outline' className='bg-yellow-50 text-yellow-600'>
                    Partially Assigned ({stats.assignedStudents}/{stats.totalStudents})
                  </Badge>
                )}
                {assignmentStatus === 'complete' && (
                  <Badge variant='outline' className='bg-green-50 text-green-600'>
                    Fully Assigned ({stats.assignedStudents}/{stats.totalStudents})
                  </Badge>
                )}
              </div>
            </div>
            <div className='flex flex-col sm:flex-row gap-2'>
              <Button
                variant='outline'
                onClick={downloadAssignments}
                disabled={stats.assignedStudents === 0}
              >
                <Download className='mr-2 h-4 w-4' />
                Download Assignments
              </Button>
              <ResetSeatAssignmentDialog
                disabled={stats.assignedStudents === 0}
                onSuccess={resetAssignments}
              />
              <Button
                onClick={assignStudents}
                disabled={mutation.isPending || stats.assignedStudents > 0}
              >
                <UserCheck className='mr-2 h-4 w-4' />
                {mutation.isPending ? 'Assigning...' : 'Assign Students'}
              </Button>
            </div>
          </div>
          {stats.assignedStudents > 0 && (
            <div className='border rounded-md overflow-hidden mt-4'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seat</TableHead>
                    <TableHead>Mac</TableHead>
                    <TableHead>Assigned Student</TableHead>
                    <TableHead>Student Has Mac</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seats
                    .filter((seat) => seat.assignedStudent)
                    .sort((a, b) => a.seatName.localeCompare(b.seatName))
                    .map((seat) => {
                      const student = developerWithProfiles.find(
                        (dev) => dev.participation.student.id === seat.assignedStudent,
                      )
                      return (
                        <TableRow key={seat.seatName}>
                          <TableCell className='font-medium'>{seat.seatName}</TableCell>
                          <TableCell>
                            {seat.hasMac ? (
                              <Badge variant='outline' className='bg-blue-50 text-blue-600'>
                                <Laptop className='h-3 w-3 mr-1' />
                                Mac
                              </Badge>
                            ) : (
                              <span className='text-muted-foreground text-xs'>No</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {student ? (
                              `${student.participation.student.firstName} ${student.participation.student.lastName}`
                            ) : (
                              <span className='text-muted-foreground'>Unknown</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {student?.profile?.hasMacBook === true && (
                              <Badge variant='outline' className='bg-green-50 text-green-600'>
                                <Laptop className='h-3 w-3 mr-1' />
                                Yes
                              </Badge>
                            )}
                            {student?.profile?.hasMacBook === false && (
                              <Badge variant='outline' className='bg-red-50 text-red-600'>
                                No
                              </Badge>
                            )}
                            {student?.profile?.hasMacBook === undefined && (
                              <span className='text-muted-foreground text-xs'>Unknown</span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
