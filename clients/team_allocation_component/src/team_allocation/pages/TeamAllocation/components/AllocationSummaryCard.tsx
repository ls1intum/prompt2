import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { CoursePhaseParticipationsWithResolution } from '@tumaet/prompt-shared-state'
import { AlertCircle, ArrowRight, CheckCircle2, Users } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Allocation } from '../../../interfaces/allocation'

interface AllocationSummaryCardProps {
  coursePhaseParticipations: CoursePhaseParticipationsWithResolution | null
  teamAllocations: Allocation[] | null
}

export const AllocationSummaryCard = ({
  coursePhaseParticipations,
  teamAllocations,
}: AllocationSummaryCardProps): JSX.Element => {
  const allocationStats = useMemo(() => {
    if (!coursePhaseParticipations || !teamAllocations) {
      return {
        totalStudents: 0,
        assignedStudents: 0,
        unassignedStudents: 0,
        isComplete: false,
        percentComplete: 0,
      }
    }

    const totalStudents = coursePhaseParticipations.participations.length

    // Get all assigned student IDs from all allocations
    const assignedStudentIds = new Set<string>()
    teamAllocations.forEach((allocation) => {
      allocation.students.forEach((studentId) => {
        assignedStudentIds.add(studentId)
      })
    })

    const assignedStudents = assignedStudentIds.size
    const unassignedStudents = totalStudents - assignedStudents
    const isComplete = unassignedStudents === 0 && totalStudents > 0
    const percentComplete = totalStudents > 0 ? (assignedStudents / totalStudents) * 100 : 0

    return {
      totalStudents,
      assignedStudents,
      unassignedStudents,
      isComplete,
      percentComplete,
    }
  }, [coursePhaseParticipations, teamAllocations])

  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-medium'>Allocation Status</h3>
          {allocationStats.isComplete ? (
            <Badge className='bg-green-500 hover:bg-green-600'>
              <CheckCircle2 className='h-3.5 w-3.5 mr-1' />
              Complete
            </Badge>
          ) : (
            <Badge variant='outline' className='border-amber-500 text-amber-500'>
              <AlertCircle className='h-3.5 w-3.5 mr-1' />
              In Progress
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className='pb-4'>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <div className='bg-muted/40 rounded-lg p-4 flex flex-col items-center justify-center text-center'>
            <div className='rounded-full bg-background p-2 mb-2'>
              <Users className='h-5 w-5 text-primary' />
            </div>
            <p className='text-2xl font-bold'>{allocationStats.totalStudents}</p>
            <p className='text-sm text-muted-foreground'>Total Students</p>
          </div>

          <div className='bg-green-50 dark:bg-green-950 rounded-lg p-4 flex flex-col items-center justify-center text-center'>
            <div className='rounded-full bg-green-100 dark:bg-green-900/30 p-2 mb-2'>
              <CheckCircle2 className='h-5 w-5 text-green-600 dark:text-green-400' />
            </div>
            <p className='text-2xl font-bold text-green-600 dark:text-green-400'>
              {allocationStats.assignedStudents}
            </p>
            <p className='text-sm text-green-600/80 dark:text-green-400/80'>Assigned</p>
          </div>

          <div className='bg-amber-50 dark:bg-amber-950 rounded-lg p-4 flex flex-col items-center justify-center text-center'>
            <div className='rounded-full bg-amber-100 dark:bg-amber-900/30 p-2 mb-2'>
              <AlertCircle className='h-5 w-5 text-amber-600 dark:text-amber-400' />
            </div>
            <p className='text-2xl font-bold text-amber-600 dark:text-amber-400'>
              {allocationStats.unassignedStudents}
            </p>
            <p className='text-sm text-amber-600/80 dark:text-amber-400/80'>Unassigned</p>
          </div>
        </div>
      </CardContent>
      <CardContent className='pt-0 pb-4 flex justify-end'>
        <Button asChild>
          <a href='/tease'>
            Go to Tease
            <ArrowRight className='ml-2 h-4 w-4' />
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
