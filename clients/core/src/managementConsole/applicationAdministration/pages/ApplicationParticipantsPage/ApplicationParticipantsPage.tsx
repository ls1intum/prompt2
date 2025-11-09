import { useState, useMemo } from 'react'
import { FileUser, Trash2 } from 'lucide-react'
import { PassStatus } from '@tumaet/prompt-shared-state'
import { GroupAction } from '@/components/pages/CoursePhaseParticpationsTable/interfaces/GroupAction'
import { ManagementPageHeader } from '@tumaet/prompt-ui-components'
import { ColumnFiltersState } from '@tanstack/react-table'
import { FilterMenu as ApplicationFilterMenu } from './components/table/filtering/FilterMenu'
import AssessmentScoreUpload from './components/ScoreUpload/ScoreUpload'
import { ApplicationManualAddingDialog } from './components/ApplicationManualAddingDialog/ApplicationManualAddingDialog'
import { ApplicationDetailsDialog } from './components/ApplicationDetailsDialog/ApplicationDetailsDialog'
import { useApplicationStore } from '../../zustand/useApplicationStore'
import { useDeleteApplications } from './hooks/useDeleteApplications'
import { convertApplicationToCoursePhaseParticipation } from './utils/convertApplicationToCoursePhaseParticipation'
import { CoursePhaseParticipationsTablePage } from '@/components/pages/CoursePhaseParticpationsTable/CoursePhaseParticipationsTablePage'
import { getApplicationExtraColumns } from './components/table/extraColumns'

export const ApplicationParticipantsPage = (): JSX.Element => {
  const { additionalScores, participations, coursePhase } = useApplicationStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCourseParticipationID, setSelectedCourseParticipationID] = useState<
    string | undefined
  >(undefined)

  const { mutate: mutateDeleteApplications } = useDeleteApplications()

  const viewApplication = (courseParticipationID: string) => {
    setSelectedCourseParticipationID(courseParticipationID)
    setDialogOpen(true)
  }

  const selectedApplication = participations?.find(
    (participation) => participation.courseParticipationID === selectedCourseParticipationID,
  )

  const convertedParticipations = useMemo(
    () => (participations ?? []).map(convertApplicationToCoursePhaseParticipation),
    [participations],
  )

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const customActions: GroupAction[] = useMemo(() => {
    return [
      {
        label: 'View Application',
        icon: <FileUser className='h-4 w-4' />,
        onAction: (ids: string[]) => {
          if (ids.length > 0) viewApplication(ids[0])
        },
        singleRecordOnly: true,
      },
      {
        label: 'Delete Application',
        icon: <Trash2 className='h-4 w-4 text-red-600' />,
        onAction: (ids: string[]) => {
          mutateDeleteApplications(ids)
        },
        confirm: {
          title: 'Confirm Deletion',
          description: `Are you sure you want to delete the selected application(s)? This action cannot be undone.`,
          confirmLabel: 'Delete',
        },
      },
    ]
  }, [mutateDeleteApplications])

  const extraColumns = useMemo(
    () => getApplicationExtraColumns(participations, additionalScores),
    [participations, additionalScores],
  )

  const toolbarActions = useMemo(() => {
    const customScoresEnabled = Boolean(coursePhase?.restrictedData?.['useCustomScores'])
    return (
      <>
        {participations && customScoresEnabled && (
          <AssessmentScoreUpload applications={participations} />
        )}
        <ApplicationManualAddingDialog existingApplications={participations ?? []} />
      </>
    )
  }, [participations, coursePhase])

  return (
    <div className='relative flex flex-col min-w-0'>
      <ManagementPageHeader>Application Participants</ManagementPageHeader>
      <CoursePhaseParticipationsTablePage
        participants={convertedParticipations}
        prevDataKeys={[]}
        restrictedDataKeys={[]}
        studentReadableDataKeys={[]}
        extraColumns={extraColumns}
        onClickRowAction={(student) => viewApplication(student.courseParticipationID)}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        customFilterMenu={() => (
          <ApplicationFilterMenu
            columnFilters={columnFilters}
            setColumnFilters={setColumnFilters}
          />
        )}
        customActions={customActions}
        toolbarActions={toolbarActions}
      />
      {dialogOpen && (
        <ApplicationDetailsDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          courseParticipationID={selectedCourseParticipationID ?? ''}
          status={selectedApplication?.passStatus ?? PassStatus.NOT_ASSESSED}
          score={selectedApplication?.score ?? null}
          restrictedData={selectedApplication?.restrictedData ?? {}}
        />
      )}
    </div>
  )
}
