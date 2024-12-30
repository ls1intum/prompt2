import { Dialog, DialogContent } from '@/components/ui/dialog'
import { GetApplication } from '@/interfaces/get_application'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getApplicationAssessment } from '../../network/queries/applicationAssessment'
import { ApplicationForm } from '@/interfaces/application_form'

interface ApplicationDetailsViewProps {
  coursePhaseParticipationID: string
  open: boolean
  onClose: () => void
}

export const ApplicationDetailsView = ({
  coursePhaseParticipationID,
  open,
  onClose,
}: ApplicationDetailsViewProps): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const {
    data: fetchedApplication,
    isPending: isFetchingApplication,
    isError: isApplicationError,
    refetch,
  } = useQuery<GetApplication>({
    queryKey: ['application', coursePhaseParticipationID],
    queryFn: () => getApplicationAssessment(phaseId ?? '', coursePhaseParticipationID),
  })

  useEffect(() => {
    if (fetchedApplication) {
      console.log(fetchedApplication)
    }
  }, [fetchedApplication])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <div>Some fancy detail view here</div>
        {coursePhaseParticipationID}
      </DialogContent>
    </Dialog>
  )
}
