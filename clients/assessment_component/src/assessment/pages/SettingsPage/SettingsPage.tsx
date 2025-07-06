import { Loader2 } from 'lucide-react'

import {
  ManagementPageHeader,
  ErrorPage,
  Card,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@tumaet/prompt-ui-components'

import { useCategoryStore } from '../../zustand/useCategoryStore'
import { useParticipationStore } from '../../zustand/useParticipationStore'
import { useScoreLevelStore } from '../../zustand/useScoreLevelStore'
import { useCoursePhaseConfigStore } from '../../zustand/useCoursePhaseConfigStore'

import { useGetAllAssessments } from '../hooks/useGetAllAssessments'

import { CategoryDiagram } from '../components/diagrams/CategoryDiagram'
import { AssessmentScoreLevelDiagram } from '../components/diagrams/AssessmentScoreLevelDiagram'

import { CoursePhaseConfigSelection } from './components/CoursePhaseConfigSelection/CoursePhaseConfigSelection'
import { CategoryList } from './components/CategoryList/CategoryList'

export const SettingsPage = (): JSX.Element => {
  const { participations } = useParticipationStore()
  const { categories } = useCategoryStore()
  const { scoreLevels } = useScoreLevelStore()
  const { coursePhaseConfig: config } = useCoursePhaseConfigStore()

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
          <AssessmentScoreLevelDiagram participations={participations} scoreLevels={scoreLevels} />
          <CategoryDiagram categories={categories} assessments={assessments} />
        </div>
      )}

      <CoursePhaseConfigSelection />

      {config?.assessmentTemplateID && (
        <Card className='p-6 overflow-hidden'>
          <Accordion type='single' collapsible className='w-full'>
            <AccordionItem value='competencies' className='border-none'>
              <div className='flex justify-between items-center'>
                <div>
                  <h2 className='text-xl font-semibold tracking-tight'>Assessment Template</h2>

                  <p className='text-muted-foreground text-sm mt-1'>
                    Define the Assessment Categories and Competencies here
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <AccordionTrigger className='py-3 hover:no-underline'>
                    <span className='text-sm font-medium'>Show Assessment Competencies</span>
                  </AccordionTrigger>
                </div>
              </div>
              <AccordionContent className='pt-4 pb-2 space-y-5 border-t mt-2'>
                <CategoryList assessmentTemplateID={config?.assessmentTemplateID ?? ''} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      )}
    </div>
  )
}
