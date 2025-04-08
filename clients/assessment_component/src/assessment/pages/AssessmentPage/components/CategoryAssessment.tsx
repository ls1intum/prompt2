import { useParams } from 'react-router-dom'
import { useState } from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card } from '@/components/ui/card'

import { AssessmentForm } from './AssessmentForm'
import { CompetencyWithAssessmentItem } from './CompetencyWithAssessment'
import { useCreateAssessment } from '../hooks/useCreateAssessment'
import { CategoryWithCompetencies } from '../../../interfaces/category'
import { Assessment } from '../../../interfaces/assessment'
import AssessmentStatusBadge from './AssessmentStatusBadge'

interface CategoryAssessmentProps {
  category: CategoryWithCompetencies
  remainingAssessments: number
  assessments: Assessment[]
}

export const CategoryAssessment = ({
  category,
  remainingAssessments,
  assessments,
}: CategoryAssessmentProps): JSX.Element => {
  const { courseParticipationID } = useParams<{
    courseParticipationID: string
  }>()

  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const handleAccordionChange = (value: string) => {
    setExpandedItems((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    )
  }

  return (
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
            <div className='flex items-center space-x-4'>
              <AssessmentStatusBadge remainingAssessments={remainingAssessments} />
              <AccordionTrigger className='py-3 hover:no-underline' />
            </div>
          </div>
          <AccordionContent className='pt-4 pb-2 space-y-5 border-t mt-2'>
            {category.competencies.length === 0 ? (
              <p className='text-sm text-muted-foreground italic'>No competencies available yet.</p>
            ) : (
              <div className='grid gap-4'>
                {category.competencies.map((competency) => {
                  const assessment = assessments.find(
                    (assessment) => assessment.competencyID === competency.id,
                  )

                  if (assessment) {
                    return (
                      <div key={competency.id}>
                        <CompetencyWithAssessmentItem
                          competency={competency}
                          assessment={assessment}
                        />
                      </div>
                    )
                  }

                  return (
                    <div key={competency.id}>
                      <AssessmentForm
                        competency={competency}
                        courseParticipationID={courseParticipationID ?? ''}
                        useMutation={useCreateAssessment}
                        submitButtonText='Create'
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
  )
}
