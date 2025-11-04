import { Loader2 } from 'lucide-react'

import { ManagementPageHeader, ErrorPage } from '@tumaet/prompt-ui-components'
import { useAuthStore, Role, getPermissionString } from '@tumaet/prompt-shared-state'

import { useParticipationStore } from '../../zustand/useParticipationStore'
import { useCoursePhaseConfigStore } from '../../zustand/useCoursePhaseConfigStore'
import { useCategoryStore } from '../../zustand/useCategoryStore'
import { useScoreLevelStore } from '../../zustand/useScoreLevelStore'
import { useGetAllAssessments } from '../hooks/useGetAllAssessments'

import { AssessmentType } from '../../interfaces/assessmentType'

import { CategoryDiagram } from '../components/diagrams/CategoryDiagram'
import { ScoreLevelDistributionDiagram } from '../components/diagrams/ScoreLevelDistributionDiagram'

import { CoursePhaseConfigSelection } from './components/CoursePhaseConfigSelection/CoursePhaseConfigSelection'
import { CategoryList } from './components/CategoryList/CategoryList'

export const SettingsPage = (): JSX.Element => {
  const { participations } = useParticipationStore()
  const { coursePhaseConfig: config } = useCoursePhaseConfigStore()
  const { categories } = useCategoryStore()
  const { scoreLevels } = useScoreLevelStore()
  const { permissions } = useAuthStore()

  const isPromptAdmin = permissions.includes(getPermissionString(Role.PROMPT_ADMIN))

  const {
    data: assessments,
    isPending: isAssessmentsPending,
    isError: isAssessmentsError,
    refetch: refetchAssessments,
  } = useGetAllAssessments()

  return (
    <div className='space-y-4'>
      <ManagementPageHeader>Assessment Settings</ManagementPageHeader>

      {isAssessmentsError ? (
        <div>
          <ErrorPage onRetry={refetchAssessments} description='Could not fetch assessments' />
        </div>
      ) : isAssessmentsPending ? (
        <div className='flex justify-center items-center h-64'>
          <Loader2 className='h-12 w-12 animate-spin text-primary' />
        </div>
      ) : (
        <div className='grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:col-span-4 mb-4'>
          <ScoreLevelDistributionDiagram
            participations={participations}
            scoreLevels={scoreLevels}
          />
          <CategoryDiagram categories={categories} assessments={assessments} />
        </div>
      )}

      <CoursePhaseConfigSelection />

      {isPromptAdmin && (
        <>
          {config?.assessmentTemplateID && (
            <CategoryList
              assessmentTemplateID={config?.assessmentTemplateID}
              assessmentType={AssessmentType.ASSESSMENT}
            />
          )}

          {config?.selfEvaluationEnabled && config.selfEvaluationTemplate && (
            <CategoryList
              assessmentTemplateID={config?.selfEvaluationTemplate}
              assessmentType={AssessmentType.SELF}
            />
          )}

          {config?.peerEvaluationEnabled && config.peerEvaluationTemplate && (
            <CategoryList
              assessmentTemplateID={config?.peerEvaluationTemplate}
              assessmentType={AssessmentType.PEER}
            />
          )}

          {config?.tutorEvaluationEnabled && config.tutorEvaluationTemplate && (
            <CategoryList
              assessmentTemplateID={config?.tutorEvaluationTemplate}
              assessmentType={AssessmentType.TUTOR}
            />
          )}
        </>
      )}
    </div>
  )
}
