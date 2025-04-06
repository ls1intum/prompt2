import { Loader2 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { useState } from 'react'

import { Card } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import { useGetAllCategoriesWithCompetencies } from '../hooks/useGetAllCategoriesWithCompetencies'
import { useGetAllStudentAssessmentsInPhase } from '../AssessmentOverviewPage/hooks/useGetAllStudentAssessmentsInPhase'
import { CreateAssessmentForm } from '../AssessmentOverviewPage/components/CreateAssessmentForm'
import { ErrorPage } from '@/components/ErrorPage'
import { CompetencyWithAssessmentItem } from '../AssessmentOverviewPage/components/CompetencyWithAssessment'

export const AssessmentPage = (): JSX.Element => {
  const { courseParticipationID } = useParams<{
    courseParticipationID: string
  }>()

  const {
    data: categories,
    isPending: isCategoriesPending,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useGetAllCategoriesWithCompetencies()

  const {
    data: assessments,
    isPending: isAssessmentsPending,
    isError: isAssessmentsError,
    refetch: refetchAssessments,
  } = useGetAllStudentAssessmentsInPhase()

  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const handleAccordionChange = (value: string) => {
    setExpandedItems((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    )
  }

  const handleRefresh = () => {
    refetchCategories()
    refetchAssessments()
  }

  const isError = isCategoriesError || isAssessmentsError
  const isPending = isCategoriesPending || isAssessmentsPending

  if (isError) return <ErrorPage onRetry={handleRefresh} />
  if (isPending)
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )

  if (!categories || categories.length === 0)
    return (
      <Card className='p-6 text-center text-muted-foreground'>
        <p>No categories found. Create your first category to get started.</p>
      </Card>
    )

  return (
    <div>
      {categories.map((category) => (
        <Card key={category.id} className='p-6 overflow-hidden'>
          <Accordion
            type='single'
            collapsible
            className='w-full'
            value={expandedItems.includes(category.id) ? 'competencies' : ''}
            onValueChange={() => handleAccordionChange(category.id)}
          >
            <AccordionItem value='competencies' className='border-none'>
              <div className='flex justify-between items-center'>
                <div>
                  <h2 className='text-xl font-semibold tracking-tight'>{category.name}</h2>
                  {category.description && (
                    <p className='text-muted-foreground text-sm mt-1'>{category.description}</p>
                  )}
                </div>
                <AccordionTrigger className='py-3 hover:no-underline'>
                  <span className='text-sm font-medium'>Show Competencies</span>
                </AccordionTrigger>
              </div>
              <AccordionContent className='pt-4 pb-2 space-y-5 border-t mt-2'>
                {category.competencies.length === 0 ? (
                  <p className='text-sm text-muted-foreground italic'>
                    No competencies available yet.
                  </p>
                ) : (
                  <div className='grid gap-4'>
                    {category.competencies.map((competency) => {
                      const assessment = assessments.find(
                        (assessment) => assessment.competencyID === competency.id,
                      )

                      if (assessment) {
                        return (
                          <div>
                            <CompetencyWithAssessmentItem
                              competency={competency}
                              assessment={assessment}
                            />
                          </div>
                        )
                      }

                      return (
                        <div>
                          <CreateAssessmentForm
                            competency={competency.name}
                            description={competency.description}
                            courseParticipationID={courseParticipationID ?? ''}
                            competencyID={competency.id}
                            noviceText={competency.novice}
                            intermediateText={competency.intermediate}
                            advancedText={competency.advanced}
                            expertText={competency.expert}
                          />
                        </div>
                      )
                    })}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      ))}
    </div>
  )
}
