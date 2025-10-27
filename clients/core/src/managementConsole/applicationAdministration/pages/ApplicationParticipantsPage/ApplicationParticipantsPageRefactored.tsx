import { useState, useMemo } from 'react'
import { PassStatus } from '@tumaet/prompt-shared-state'
import { GroupAction } from '@/components/pages/CoursePhaseParticpationsTable/interfaces/GroupAction'
import { ManagementPageHeader, useCustomElementWidth } from '@tumaet/prompt-ui-components'
import AssessmentScoreUpload from './components/ScoreUpload/ScoreUpload'
import { ApplicationManualAddingDialog } from './components/ApplicationManualAddingDialog/ApplicationManualAddingDialog'
import { ApplicationDetailsDialog } from './components/ApplicationDetailsDialog/ApplicationDetailsDialog'
import { useApplicationStore } from '../../zustand/useApplicationStore'
import { useDeleteApplications } from './hooks/useDeleteApplications'
import { convertApplicationToCoursePhaseParticipation } from './utils/convertApplicationToCoursePhaseParticipation'
import { CoursePhaseParticipationsTablePage } from '@/components/pages/CoursePhaseParticpationsTable/CoursePhaseParticipationsTablePage'
import { ExtraParticipationTableColumn } from '@/components/pages/CoursePhaseParticpationsTable/interfaces/ExtraParticipationTableColumn'

export const ApplicationParticipantsPage = (): JSX.Element => {
  const { additionalScores, participations } = useApplicationStore()
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

  const tableWidth = useCustomElementWidth('table-view')

  const customActions: GroupAction[] = useMemo(() => {
    return [
      {
        label: 'View Application',
        onAction: (ids: string[]) => {
          if (ids.length > 0) viewApplication(ids[0])
        },
      },
      {
        label: 'Delete Application',
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

  const extraColumns: ExtraParticipationTableColumn[] = useMemo(() => {
    const columns: ExtraParticipationTableColumn[] = []

    if (participations && participations.length > 0) {
      const scoreColumnData = participations.map((app) => ({
        courseParticipationID: app.courseParticipationID,
        value: app.score ?? '-',
        stringValue: app.score?.toString() ?? '',
      }))
      columns.push({
        id: 'score',
        header: 'Score',
        extraData: scoreColumnData,
        enableSorting: true,
      })

      const emailColumnData = participations.map((app) => ({
        courseParticipationID: app.courseParticipationID,
        value: app.student.email ?? '',
        stringValue: app.student.email ?? '',
      }))
      columns.push({
        id: 'email',
        header: 'Email',
        extraData: emailColumnData,
        enableSorting: true,
      })

      const studyProgramColumnData = participations.map((app) => ({
        courseParticipationID: app.courseParticipationID,
        value: app.student.studyProgram ?? '',
        stringValue: app.student.studyProgram ?? '',
      }))
      columns.push({
        id: 'studyProgram',
        header: 'Study Program',
        extraData: studyProgramColumnData,
        enableSorting: true,
      })

      const studyDegreeColumnData = participations.map((app) => ({
        courseParticipationID: app.courseParticipationID,
        value: app.student.studyDegree ?? '',
        stringValue: app.student.studyDegree ?? '',
      }))
      columns.push({
        id: 'studyDegree',
        header: 'Study Degree',
        extraData: studyDegreeColumnData,
        enableSorting: true,
      })

      const genderColumnData = participations.map((app) => ({
        courseParticipationID: app.courseParticipationID,
        value: app.student.gender ?? '',
        stringValue: app.student.gender ?? '',
      }))
      columns.push({
        id: 'gender',
        header: 'Gender',
        extraData: genderColumnData,
        enableSorting: true,
      })
      ;(additionalScores ?? []).forEach((additionalScore) => {
        const additionalScoreData = participations.map((app) => ({
          courseParticipationID: app.courseParticipationID,
          value: app.restrictedData?.[additionalScore.key] ?? null,
          stringValue: app.restrictedData?.[additionalScore.key]?.toString() ?? '',
        }))
        columns.push({
          id: additionalScore.key,
          header: additionalScore.name,
          extraData: additionalScoreData,
        })
      })
    }

    return columns
  }, [participations, additionalScores])

  const toolbarActions = useMemo(
    () => (
      <>
        {participations && <AssessmentScoreUpload applications={participations} />}
        <ApplicationManualAddingDialog existingApplications={participations ?? []} />
      </>
    ),
    [participations],
  )

  return (
    <div id='table-view' className='relative flex flex-col min-w-0'>
      <ManagementPageHeader>Application Participants</ManagementPageHeader>
      <CoursePhaseParticipationsTablePage
        tableWidth={tableWidth}
        participants={convertedParticipations}
        prevDataKeys={[]}
        restrictedDataKeys={[]}
        studentReadableDataKeys={[]}
        extraColumns={extraColumns}
        onClickRowAction={(student) => viewApplication(student.courseParticipationID)}
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
