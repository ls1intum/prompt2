import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

import { useMyParticipationStore } from '../../../zustand/useMyParticipationStore'

import { CategoryWithCompetencies } from '../../../interfaces/category'
import { Evaluation } from '../../../interfaces/evaluation'

import { EvaluationForm } from './EvaluationForm/EvaluationForm'

interface CategoryEvaluationProps {
  courseParticipationID: string
  category: CategoryWithCompetencies
  evaluations: Evaluation[]
  completed: boolean
}

export const CategoryEvaluation = ({
  courseParticipationID,
  category,
  evaluations,
  completed,
}: CategoryEvaluationProps) => {
  const { myParticipation } = useMyParticipationStore()

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
                const evaluation = evaluations.find((ass) => ass.competencyID === competency.id)

                return (
                  <div key={competency.id}>
                    <EvaluationForm
                      courseParticipationID={courseParticipationID}
                      authorCourseParticipationID={myParticipation?.courseParticipationID ?? ''}
                      competency={competency}
                      evaluation={evaluation}
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
