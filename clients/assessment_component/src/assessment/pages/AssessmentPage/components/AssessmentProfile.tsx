import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Book, Calendar, GraduationCap } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import AssessmentStatusBadge from './AssessmentStatusBadge'
import ScoreLevelBadge from './ScoreLevelBadge'
import type { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { PassStatus, useAuthStore } from '@tumaet/prompt-shared-state'

import type { StudentAssessment } from '../../../interfaces/studentAssessment'
import { mapScoreLevelToNumber } from '../../../interfaces/scoreLevel'
import { useCreateAssessmentCompletion } from '../hooks/useCreateAssessmentCompletion'
import { useDeleteAssessmentCompletion } from '../hooks/useDeleteAssessmentCompletion'
import { useUpdateCoursePhaseParticipation } from '@/hooks/useUpdateCoursePhaseParticipation'
import { format } from 'date-fns'

interface AssessmentProfileProps {
  participant: CoursePhaseParticipationWithStudent
  studentAssessment: StudentAssessment
}

export const AssessmentProfile = ({
  participant,
  studentAssessment,
}: AssessmentProfileProps): JSX.Element => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { phaseId } = useParams<{ phaseId: string }>()

  const { mutate: createCompletion } = useCreateAssessmentCompletion(setError)
  const { mutate: deleteCompletion } = useDeleteAssessmentCompletion(setError)
  const { mutate: updateParticipation } = useUpdateCoursePhaseParticipation()

  const averageScore =
    studentAssessment.assessments.length === 0
      ? 0
      : studentAssessment.assessments
          .map((assessment) => mapScoreLevelToNumber({ score: assessment.score }))
          .reduce<number>((a, b) => a + b, 0) / studentAssessment.assessments.length

  const handleButtonClick = () => {
    setError(null)
    setDialogOpen(true)
  }

  const { user } = useAuthStore()
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User'
  const handleConfirm = () => {
    let passStatus = PassStatus.NOT_ASSESSED
    const handleCompletion = async () => {
      try {
        if (studentAssessment.assessmentCompletion.completed) {
          await deleteCompletion(studentAssessment.courseParticipationID)
        } else {
          await createCompletion({
            courseParticipationID: studentAssessment.courseParticipationID,
            coursePhaseID: phaseId ?? '',
            author: userName,
            completedAt: new Date().toISOString(),
            completed: true,
          })
          passStatus = PassStatus.PASSED
        }
        await updateParticipation({
          coursePhaseID: participant.coursePhaseID,
          courseParticipationID: participant.courseParticipationID,
          passStatus: passStatus,
          restrictedData: participant.restrictedData,
          studentReadableData: participant.studentReadableData,
        })
        setDialogOpen(false)
      } catch (err) {
        setError('An error occurred while updating the assessment completion status.')
      }
    }

    handleCompletion()
  }

  return (
    <>
      <Card className='relative overflow-hidden'>
        <CardHeader className='relative'>
          <div className='absolute top-4 right-4'>
            <Button variant='outline' size='sm' onClick={handleButtonClick}>
              {studentAssessment.assessmentCompletion.completed
                ? 'Edit Assessment'
                : 'Mark Assessment as Final'}
            </Button>
          </div>
          <div className='flex flex-col sm:flex-row items-center'>
            <div className='flex-1 text-center sm:text-left'>
              <div className='flex flex-col sm:flex-row sm:items-center gap-1'>
                <h1 className='text-2xl font-bold mr-2'>
                  {participant.student.firstName} {participant.student.lastName}
                </h1>
                <AssessmentStatusBadge
                  remainingAssessments={studentAssessment.remainingAssessments.remainingAssessments}
                />
                <ScoreLevelBadge score={averageScore} />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm'>
            <div className='flex items-center'>
              <Book className='w-5 h-5 mr-2 text-primary' />
              <strong className='mr-2'>Program:</strong>
              <span className='text-muted-foreground'>
                {participant.student.studyProgram || 'N/A'}
              </span>
            </div>
            <div className='flex items-center'>
              <GraduationCap className='w-5 h-5 mr-2 text-primary' />
              <strong className='mr-2'>Degree:</strong>
              <span className='text-muted-foreground'>
                {participant.student.studyDegree
                  ? participant.student.studyDegree.charAt(0).toUpperCase() +
                    participant.student.studyDegree.slice(1)
                  : 'N/A'}
              </span>
            </div>
            <div className='flex items-center'>
              <Calendar className='w-5 h-5 mr-2 text-primary' />
              <strong className='mr-2'>Semester:</strong>
              <span className='text-muted-foreground'>
                {participant.student.currentSemester || 'N/A'}
              </span>
            </div>
          </div>

          {error && !dialogOpen && (
            <Alert variant='destructive' className='mt-4'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) setError(null) // Clear error when closing dialog
          setDialogOpen(open)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {studentAssessment.assessmentCompletion.completed
                ? 'Reopen Assessment for Editing'
                : 'Mark Assessment as Final'}
            </DialogTitle>
            <DialogDescription>
              {studentAssessment.assessmentCompletion.completed ? (
                <>
                  Marked as final by {studentAssessment.assessmentCompletion.author} at{' '}
                  {format(
                    new Date(studentAssessment.assessmentCompletion.completedAt),
                    'MMM d, yyyy',
                  )}
                  <br />
                  Are you sure you want to reopen this assessment for editing? This will allow you
                  to make changes to the assessment.
                </>
              ) : (
                'Are you sure you want to mark this assessment as final? This will lock the assessment and prevent further changes.'
              )}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant='outline' onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              variant={studentAssessment.assessmentCompletion.completed ? 'destructive' : 'default'}
            >
              {studentAssessment.assessmentCompletion.completed
                ? 'Yes, Reopen for Editing'
                : 'Yes, Mark as Final'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
