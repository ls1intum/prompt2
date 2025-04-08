import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

import { AssessmentForm } from './AssessmentForm'
import { CompetencyWithAssessmentItem } from './CompetencyWithAssessment'
import { useCreateAssessment } from '../hooks/useCreateAssessment'
import type { CategoryWithCompetencies } from '../../../interfaces/category'
import type { Assessment } from '../../../interfaces/assessment'
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

  const [isExpanded, setIsExpanded] = useState(true)

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div key={category.id} className='mb-6'>
      <div className='flex items-center mb-4'>
        <button
          onClick={toggleExpand}
          className='p-1 mr-2 hover:bg-gray-100 rounded-sm focus:outline-none'
          aria-expanded={isExpanded}
          aria-controls={`content-${category.id}`}
        >
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        <h2 className='text-xl font-semibold tracking-tight flex-grow'>{category.name}</h2>
        <AssessmentStatusBadge remainingAssessments={remainingAssessments} />
      </div>

      {isExpanded && (
        <div id={`content-${category.id}`} className='pt-4 pb-2 space-y-5 border-t mt-2'>
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
        </div>
      )}
    </div>
  )
}
