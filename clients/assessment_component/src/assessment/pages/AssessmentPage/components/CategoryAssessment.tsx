import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'

import type { CategoryWithCompetencies } from '../../../interfaces/category'
import type { Assessment } from '../../../interfaces/assessment'

import { AssessmentStatusBadge } from '../../components/AssessmentStatusBadge'

import { AssessmentForm } from './AssessmentForm/AssessmentForm'

interface CategoryAssessmentProps {
  category: CategoryWithCompetencies
  assessments: Assessment[]
  completed: boolean
}

export const CategoryAssessment = ({
  category,
  assessments,
  completed,
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
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>
        <h2 className='text-xl font-semibold tracking-tight flex-grow'>{category.name}</h2>
        <AssessmentStatusBadge
          remainingAssessments={category.competencies.length - assessments.length}
          isFinalized={completed}
        />
      </div>

      {isExpanded && (
        <div id={`content-${category.id}`} className='pt-4 pb-2 space-y-5 border-t mt-2'>
          {category.competencies.length === 0 ? (
            <p className='text-sm text-muted-foreground italic'>
              No competencies available in this category.
            </p>
          ) : (
            <div className='grid gap-4'>
              {category.competencies.map((competency) => {
                const assessment = assessments.find((ass) => ass.competencyID === competency.id)

                return (
                  <div key={competency.id}>
                    <AssessmentForm
                      courseParticipationID={courseParticipationID ?? ''}
                      competency={competency}
                      assessment={assessment}
                      completed={completed}
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
