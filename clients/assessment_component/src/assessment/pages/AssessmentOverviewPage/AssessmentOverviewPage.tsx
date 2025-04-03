import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import { useQuery } from '@tanstack/react-query'

import { CoursePhaseParticipationsWithResolution } from '@tumaet/prompt-shared-state'

import { ErrorPage } from '@/components/ErrorPage'
import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { CoursePhaseParticipationsTablePage } from '@/components/pages/CoursePhaseParticpationsTable/CoursePhaseParticipationsTablePage'
import { getCoursePhaseParticipations } from '@/network/queries/getCoursePhaseParticipations'

import { AssessmentDialog } from './components/AssessmentDialog'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'

export const AssessmentOverviewPage = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const [isAssessmentDialogOpen, setAssessmentDialogOpen] = useState(false)
  const [courseParticipationID, setCourseParticipationID] = useState<string | undefined>(undefined)

  const handleDialogOpen = (student: CoursePhaseParticipationWithStudent) => {
    setAssessmentDialogOpen(true)
    setCourseParticipationID(student.courseParticipationID)
  }

  const handleDialogClose = () => {
    setAssessmentDialogOpen(false)
    setCourseParticipationID(undefined)
  }

  const {
    data: coursePhaseParticipations,
    isPending: isCoursePhaseParticipationsPending,
    isError: isParticipationsError,
    refetch: refetchCoursePhaseParticipations,
  } = useQuery<CoursePhaseParticipationsWithResolution>({
    queryKey: ['participants', phaseId],
    queryFn: () => getCoursePhaseParticipations(phaseId ?? ''),
  })

  return (
    <div>
      {isParticipationsError ? (
        <ErrorPage onRetry={refetchCoursePhaseParticipations} />
      ) : isCoursePhaseParticipationsPending ? (
        <div className='flex justify-center items-center h-64'>
          <Loader2 className='h-12 w-12 animate-spin text-primary' />
        </div>
      ) : (
        <>
          <ManagementPageHeader>Course Phase Participants</ManagementPageHeader>
          <CoursePhaseParticipationsTablePage
            participants={coursePhaseParticipations?.participations ?? []}
            prevDataKeys={['score']}
            restrictedDataKeys={[]}
            studentReadableDataKeys={[]}
            onClickRowAction={handleDialogOpen}
          />
        </>
      )}

      {isAssessmentDialogOpen && (
        <AssessmentDialog
          isOpen={isAssessmentDialogOpen}
          onClose={handleDialogClose}
          courseParticipationID={courseParticipationID ?? ''}
        />
      )}
    </div>
  )
}
