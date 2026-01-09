import { useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import { ManagementPageHeader } from '@tumaet/prompt-ui-components'
import { CoursePhaseParticipationsTablePage } from '@/components/pages/CoursePhaseParticipationsTable/CoursePhaseParticipationsTablePage'
import {
  CoursePhaseParticipationWithStudent,
  PassStatus,
  Gender,
} from '@tumaet/prompt-shared-state'

import { useTeamStore } from '../../zustand/useTeamStore'
import { useCoursePhaseConfigStore } from '../../zustand/useCoursePhaseConfigStore'

export const TutorOverviewPage = () => {
  const navigate = useNavigate()
  const path = useLocation().pathname

  const { teams } = useTeamStore()
  const { coursePhaseConfig } = useCoursePhaseConfigStore()

  // Extract tutors from teams
  const tutors = useMemo(() => {
    return teams.flatMap((team) =>
      team.tutors
        .filter((tutor) => tutor.id !== undefined)
        .map((tutor) => ({
          id: tutor.id!,
          firstName: tutor.firstName,
          lastName: tutor.lastName,
          teamName: team.name,
          teamId: team.id,
        })),
    )
  }, [teams])

  // Transform tutors into participation-like format for the table
  const tutorParticipations: CoursePhaseParticipationWithStudent[] = useMemo(() => {
    return tutors.map((tutor) => ({
      courseParticipationID: tutor.id,
      coursePhaseID: '', // Not applicable for tutors in this context
      student: {
        id: tutor.id,
        firstName: tutor.firstName,
        lastName: tutor.lastName,
        email: '', // Not available for tutors
        matriculationNumber: '', // Not available for tutors
        hasUniversityAccount: false, // Not applicable for tutors
        gender: Gender.PREFER_NOT_TO_SAY, // Default value
        course: {
          id: '',
          name: '',
          semesterTag: '',
          description: '',
          studentReadableData: {},
          restrictedData: {},
        },
      },
      score: 0, // Not applicable for tutors
      passStatus: PassStatus.NOT_ASSESSED,
      studentReadableData: {},
      restrictedData: {},
      prevData: {},
      teamID: tutor.teamId,
      teamName: tutor.teamName,
    }))
  }, [tutors])

  const extraColumns = useMemo(
    () => [
      {
        id: 'team',
        header: 'Team',
        extraData: tutors.map((tutor) => ({
          courseParticipationID: tutor.id,
          value: tutor.teamName,
          stringValue: tutor.teamName,
        })),
        enableSorting: true,
        enableColumnFilter: true,
      },
    ],
    [tutors],
  )

  const handleRowClick = (tutor: CoursePhaseParticipationWithStudent) => {
    {
      coursePhaseConfig?.tutorEvaluationEnabled
        ? navigate(`${path}/${tutor.courseParticipationID}`)
        : undefined
    }
  }

  return (
    <div className='space-y-4'>
      <ManagementPageHeader>Tutor Overview</ManagementPageHeader>

      <p className='text-sm text-muted-foreground mb-4'>
        {coursePhaseConfig?.tutorEvaluationEnabled
          ? 'Click on a tutor to view their evaluation results from students.'
          : undefined}
      </p>

      <div className='w-full'>
        <CoursePhaseParticipationsTablePage
          participants={tutorParticipations}
          prevDataKeys={[]}
          restrictedDataKeys={[]}
          studentReadableDataKeys={[]}
          hideActions={true}
          extraColumns={extraColumns}
          onClickRowAction={handleRowClick}
        />
      </div>
    </div>
  )
}
