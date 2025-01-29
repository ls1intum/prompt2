import { Button } from '@/components/ui/button'
import { AlertCircle, Check, ChevronLeft, X } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useMatchingStore } from '../../zustand/useMatchingStore'
import MatchingResults from './components/MatchingResults'
import { useStudentImportMatching } from './hooks/useStudentImportMatching'
import { PassStatus, UpdateCoursePhaseParticipation } from '@tumaet/prompt-shared-state'
import { useUpdateCoursePhaseParticipationBatch } from '@/hooks/useUpdateCoursePhaseParticipationBatch'
import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export const DataImportPage = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const path = useLocation().pathname
  const navigate = useNavigate()
  const { uploadedData } = useMatchingStore()

  const { matchedStudents, unmatchedStudents } = useStudentImportMatching()
  const {
    mutate: mutateCoursePhaseParticipations,
    isError,
    isSuccess,
  } = useUpdateCoursePhaseParticipationBatch()

  if (uploadedData?.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-[calc(100vh-4rem)]'>
        <p className='text-2xl font-semibold'>No data uploaded</p>
        <Button onClick={() => navigate(path.replace('/re-import', ''))} className='mt-4'>
          <ChevronLeft />
          Go back
        </Button>
      </div>
    )
  }

  const handleImport = () => {
    const updateData = matchedStudents.map((participation) => {
      const participationUpdate: UpdateCoursePhaseParticipation = {
        id: participation.id,
        courseParticipationID: participation.courseParticipationID,
        coursePhaseID: phaseId ?? '',
        passStatus: PassStatus.PASSED,
        metaData: {},
      }
      return participationUpdate
    })
    mutateCoursePhaseParticipations(updateData)
  }

  return (
    <div className=''>
      <ManagementPageHeader>Import Students</ManagementPageHeader>
      {isSuccess ? (
        <Alert variant='default'>
          <Check className='h-4 w-4' />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Students were successfully imported.</AlertDescription>
        </Alert>
      ) : isError ? (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to import students. Please try again later.</AlertDescription>
        </Alert>
      ) : (
        <MatchingResults matchedStudents={matchedStudents} unmatchedStudents={unmatchedStudents} />
      )}
      <div
        className={`flex flex-row items-center mt-4 ${
          isSuccess || isError ? 'justify-end' : 'justify-between'
        }`}
      >
        <Button
          onClick={() => navigate(path.replace('/re-import', ''))}
          variant={isSuccess ? 'default' : 'outline'}
        >
          {isSuccess ? (
            <>
              <Check className='mr-2 h-4 w-4 ml-auto' />
              Close
            </>
          ) : isError ? (
            <>
              <X className='mr-2 h-4 w-4' />
              Close
            </>
          ) : (
            <>
              <ChevronLeft className='mr-2 h-4 w-4' />
              Go Back
            </>
          )}
        </Button>
        {!isSuccess && !isError && (
          <Button onClick={handleImport} variant='default'>
            <Check className='mr-2 h-4 w-4' />
            Import Students
          </Button>
        )}
      </div>
    </div>
  )
}
