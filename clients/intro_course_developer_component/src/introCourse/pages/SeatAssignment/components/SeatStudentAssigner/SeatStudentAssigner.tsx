import { useState, useEffect, useCallback } from 'react'
import { Seat } from '../../../../interfaces/Seat'
import { useUpdateSeats } from '../../hooks/useUpdateSeats'
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
import { useAssignStudents } from '../../hooks/useAssignStudents'
import { useDownloadAssignment } from '../../hooks/useDownloadAssignment'
import { DeveloperWithProfile } from '../../interfaces/DeveloperWithProfile'
import { Tutor } from '../../../../interfaces/Tutor'

interface SeatStudentAssignerProps {
  seats: Seat[]
  developerWithProfiles: DeveloperWithProfile[]
  tutors: Tutor[]
}

export const SeatStudentAssigner = ({
  seats,
  developerWithProfiles,
  tutors,
}: SeatStudentAssignerProps): JSX.Element => {
  const [error, setError] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [assignmentStatus, setAssignmentStatus] = useState<'none' | 'partial' | 'complete'>('none')
  const totalStudents = developerWithProfiles.length
  const assignedStudents = seats.filter((seat) => seat.assignedStudent).length

  const mutation = useUpdateSeats(setError)

  // Assign function
  const assignStudents = useAssignStudents(seats, developerWithProfiles, setError)

  // Updates assignment status based on number of assigned students
  useEffect(() => {
    const assignedCount = seats.filter((seat) => seat.assignedStudent).length
    if (assignedCount === 0) setAssignmentStatus('none')
    else if (assignedCount < developerWithProfiles.length) setAssignmentStatus('partial')
    else setAssignmentStatus('complete')
  }, [developerWithProfiles.length, seats])

  // Reset student assignments
  const resetAssignments = useCallback(() => {
    const updatedSeats = seats
      .filter((seat) => seat.assignedStudent != null)
      .map((seat) => ({ ...seat, assignedStudent: null }))
    mutation.mutate(updatedSeats)
    setAssignmentStatus('none')
  }, [seats, mutation])

  // Download assignments as CSV
  const downloadAssignments = useDownloadAssignment(seats, developerWithProfiles, tutors)

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
                {assignedStudents} of {totalStudents} Students Assigned
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
                    Partially Assigned ({assignedStudents}/{totalStudents})
                  </Badge>
                )}
                {assignmentStatus === 'complete' && (
                  <Badge variant='outline' className='bg-green-500 text-green-600'>
                    Fully Assigned ({assignedStudents}/{totalStudents})
                  </Badge>
                )}
              </div>
            </div>
            <div className='flex flex-col sm:flex-row gap-2'>
              <Button
                variant='outline'
                onClick={downloadAssignments}
                disabled={assignedStudents === 0}
              >
                <Download className='mr-2 h-4 w-4' />
                Download Assignments
              </Button>
              <ResetSeatAssignmentDialog
                disabled={assignedStudents === 0}
                onSuccess={resetAssignments}
              />
              <Button
                onClick={assignStudents}
                disabled={mutation.isPending || assignedStudents > 0}
              >
                <UserCheck className='mr-2 h-4 w-4' />
                {mutation.isPending ? 'Assigning...' : 'Assign Students'}
              </Button>
            </div>
          </div>
          {assignedStudents > 0 && (
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
                        (dev) => dev.participation.courseParticipationID === seat.assignedStudent,
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
                              <Badge variant='outline' className='bg-green-500'>
                                <Laptop className='h-3 w-3 mr-1' />
                                Yes
                              </Badge>
                            )}
                            {student?.profile?.hasMacBook === false && (
                              <Badge variant='outline' className='bg-red-500'>
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
