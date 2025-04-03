import { AlertCircle } from 'lucide-react'

import { useParams } from 'react-router-dom'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import { useGetAllCategoriesWithCompetencies } from '../hooks/useGetAllCategoriesWithCompetencies'
import { CreateAssessmentForm } from '../AssessmentOverviewPage/components/CreateAssessmentForm'

export const AssessmentPage = (): JSX.Element => {
  const { courseParticipationID } = useParams<{
    courseParticipationID: string
  }>()

  const { data: categories, isLoading, isError } = useGetAllCategoriesWithCompetencies()

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {[1, 2, 3].map((i) => (
          <Card key={i} className='p-6'>
            <Skeleton className='h-6 w-1/3 mb-2' />
            <Skeleton className='h-4 w-2/3' />
          </Card>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <Card className='p-6 flex items-center gap-3 text-destructive'>
        <AlertCircle className='h-5 w-5' />
        <p>Failed to load categories. Please try again later.</p>
      </Card>
    )
  }

  if (!categories || categories.length === 0) {
    return (
      <Card className='p-6 text-center text-muted-foreground'>
        <p>No categories found. Create your first category to get started.</p>
      </Card>
    )
  }

  return (
    <div>
      {categories.map((category) => (
        <Card key={category.id} className='p-6 overflow-hidden'>
          <Accordion type='single' collapsible className='w-full'>
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
                  <div className='grid gap-4 sm:grid-cols-2'>
                    {category.competencies.map((competency) => (
                      <div>
                        <CreateAssessmentForm
                          courseParticipationID={courseParticipationID ?? ''}
                          competencyID={competency.id}
                          noviceText={competency.novice}
                          intermediateText={competency.intermediate}
                          advancedText={competency.advanced}
                          expertText={competency.expert}
                        />
                      </div>
                    ))}
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
