import { ManagementPageHeader } from '@tumaet/prompt-ui-components'
import { ApplicationParticipantsTable } from './components/table/ApplicationParticipantsTable'
import { ReactNode, useState } from 'react'
import { ApplicationDetailsDialog } from './components/ApplicationDetailsDialog/ApplicationDetailsDialog'
import { ApplicationRow } from './components/table/applicationRow'
import { useApplicationStore } from '../../zustand/useApplicationStore'
import AssessmentScoreUpload from './components/ScoreUpload/ScoreUpload'
import { ApplicationManualAddingDialog } from './components/ApplicationManualAddingDialog/ApplicationManualAddingDialog'
import { useParams } from 'react-router-dom'

export const ApplicationParticipantsPage = (): ReactNode => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<ApplicationRow | null>(null)
  const { participations, coursePhase } = useApplicationStore()
  const customScoresEnabled = Boolean(coursePhase?.restrictedData?.['useCustomScores'])

  const openDialog = (applicationRow: ApplicationRow) => {
    setSelectedApplication(applicationRow)
    setDialogOpen(true)
  }
  const closeDialog = () => {
    setSelectedApplication(null)
    setDialogOpen(false)
  }

  return (
    <div className='relative flex flex-col min-w-0'>
      <div className='flex justify-between'>
        <ManagementPageHeader>Application Participants</ManagementPageHeader>
        <div className='flex gap-3'>
          {participations && customScoresEnabled && (
            <AssessmentScoreUpload applications={participations} />
          )}
          <ApplicationManualAddingDialog existingApplications={participations ?? []} />
        </div>
      </div>
      <ApplicationParticipantsTable phaseId={phaseId!} openDialog={openDialog} />
      {dialogOpen && selectedApplication && (
        <ApplicationDetailsDialog
          open={dialogOpen}
          onClose={closeDialog}
          courseParticipationID={selectedApplication.courseParticipationID}
          status={selectedApplication.passStatus}
          score={selectedApplication.score}
          restrictedData={selectedApplication.restrictedData}
        />
      )}
    </div>
  )
}
