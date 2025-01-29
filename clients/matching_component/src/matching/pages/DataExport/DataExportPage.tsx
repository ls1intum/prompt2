import { Button } from '@/components/ui/button'
import { ChevronLeft, X } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMatchingStore } from '../../zustand/useMatchingStore'
import { useStudentMatching } from './hooks/useStudentMatching'
import MatchingResults from './components/MatchingResults'
import { ManagementPageHeader } from '@/components/ManagementPageHeader'

export const DataExportPage = (): JSX.Element => {
  const path = useLocation().pathname
  const navigate = useNavigate()
  const { uploadedData } = useMatchingStore()
  const { matchedByMatriculation, matchedByName, unmatchedApplications, unmatchedStudents } =
    useStudentMatching()

  if (uploadedData?.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-[calc(100vh-4rem)]'>
        <p className='text-2xl font-semibold'>No data uploaded</p>
        <Button onClick={() => navigate(path.replace('/export', ''))} className='mt-4'>
          <ChevronLeft />
          Go back
        </Button>
      </div>
    )
  }

  return (
    <div>
      <ManagementPageHeader>Data Export</ManagementPageHeader>
      <MatchingResults
        matchedByMatriculation={matchedByMatriculation}
        matchedByName={matchedByName}
        unmatchedApplications={unmatchedApplications}
        unmatchedStudents={unmatchedStudents}
      />
      <Button onClick={() => navigate(-1)} className='mt-4'>
        <X />
        Close
      </Button>
    </div>
  )
}
