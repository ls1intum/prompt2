import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Book, Calendar, GraduationCap, Lock, Unlock } from 'lucide-react'
import AssessmentStatusBadge from './AssessmentStatusBadge'
import StudentScoreBadge from '../../components/StudentScoreBadge'
import type { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { useAuthStore } from '@tumaet/prompt-shared-state'

import {
  Alert,
  AlertDescription,
  Card,
  CardContent,
  CardHeader,
  Button,
} from '@tumaet/prompt-ui-components'

import type { StudentAssessment } from '../../../interfaces/studentAssessment'
import { useCreateAssessmentCompletion } from '../hooks/useCreateAssessmentCompletion'
import { useDeleteAssessmentCompletion } from '../hooks/useDeleteAssessmentCompletion'
import { AssessmentCompletionDialog } from './AssessmentCompletionDialog'

interface AssessmentProfileProps {
  participant: CoursePhaseParticipationWithStudent
  studentAssessment: StudentAssessment
  remainingAssessments: number
}

export const AssessmentProfile = ({
  participant,
  studentAssessment,
  remainingAssessments,
}: AssessmentProfileProps): JSX.Element => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { phaseId } = useParams<{ phaseId: string }>()

  const { mutate: createCompletion, isPending: isCreatePending } =
    useCreateAssessmentCompletion(setError)
  const { mutate: deleteCompletion, isPending: isDeletePending } =
    useDeleteAssessmentCompletion(setError)

  const isPending = isCreatePending || isDeletePending

  const handleButtonClick = () => {
    setError(null)
    setDialogOpen(true)
  }

  const { user } = useAuthStore()
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User'
  const handleConfirm = () => {
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
        }
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
        <CardHeader>
          <div className='flex flex-col sm:flex-row items-center gap-3'>
            <div className='flex-1 text-left'>
              <div className='flex flex-col sm:flex-row items-center gap-1'>
                <h1 className='text-2xl font-bold mr-2'>
                  {participant.student.firstName} {participant.student.lastName}
                </h1>

                <div className='flex items-center gap-1'>
                  <AssessmentStatusBadge
                    remainingAssessments={remainingAssessments}
                    isFinalized={studentAssessment.assessmentCompletion.completed}
                  />
                  {studentAssessment.assessments.length > 0 && (
                    <StudentScoreBadge scoreLevel={studentAssessment.studentScore.scoreLevel} />
                  )}
                </div>
              </div>
            </div>
            <div className='flex flex-col items-end'>
              <Button
                size='sm'
                disabled={
                  !studentAssessment.assessmentCompletion.completed && remainingAssessments > 0
                }
                onClick={handleButtonClick}
              >
                {studentAssessment.assessmentCompletion.completed ? (
                  <span className='flex items-center gap-1'>
                    <Unlock className='h-3.5 w-3.5' />
                    Edit Assessment
                  </span>
                ) : (
                  <span className='flex items-center gap-1'>
                    <Lock className='h-3.5 w-3.5' />
                    Mark Assessment as Final
                  </span>
                )}
              </Button>
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

      <AssessmentCompletionDialog
        studentAssessment={studentAssessment}
        isPending={isPending}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        error={error}
        setError={setError}
        handleConfirm={handleConfirm}
      />
    </>
  )
}
