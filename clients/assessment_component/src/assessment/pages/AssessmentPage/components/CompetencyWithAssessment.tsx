import { useState } from 'react'

import { format, set } from 'date-fns'
import { ClipboardCheck, Pencil, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { Competency } from '../../../interfaces/competency'
import { Assessment } from '../../../interfaces/assessment'

import { getLevelConfig } from '../../utils/getLevelConfig'
import { AssessmentForm } from './AssessmentForm'
import { useUpdateAssessment } from '../hooks/useUpdateAssessment'

interface CompetencyAssessmentItemProps {
  competency: Competency
  assessment: Assessment
}

export function CompetencyWithAssessmentItem({
  competency,
  assessment,
}: CompetencyAssessmentItemProps) {
  const [edit, setEdit] = useState(false)

  const config = getLevelConfig(assessment.score)
  const scoreText = competency[assessment.score]
  const formattedDate = format(new Date(assessment.assessedAt), 'MMM d, yyyy')

  const handleEdit = () => {
    setEdit(true)
  }

  return (
    <div>
      {edit ? (
        <AssessmentForm
          competency={competency}
          score={assessment.score}
          comment={assessment.comment}
          courseParticipationID={assessment.courseParticipationID}
          useMutation={useUpdateAssessment}
          onClose={() => setEdit(false)}
          submitButtonText='Update'
        />
      ) : (
        <Card className='shadow-sm hover:shadow-md transition-all relative'>
          <div className='absolute top-2 right-2 flex space-x-1'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={handleEdit}
              aria-label='Edit assessment'
            >
              <Pencil className='h-4 w-4' />
            </Button>
          </div>

          <div className='p-4'>
            <div className='flex justify-between items-start mb-3 pr-8'>
              <div className='flex items-center gap-2'>
                <ClipboardCheck className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                <h3 className='text-base font-medium'>{competency.name}</h3>
              </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2'>
              <div className='text-xs text-muted-foreground line-clamp-2'>
                {competency.description}
              </div>
              <div
                className={cn(
                  'text-sm border-2 rounded-lg p-3 line-clamp-3 ml-auto w-full',
                  config.color,
                  config.selectedBg,
                  config.textColor,
                )}
              >
                <div className='flex justify-between mb-1'>
                  <span className='font-semibold'>{config.title}</span>
                  <span>{config.icon}</span>
                </div>
                {scoreText}
              </div>
            </div>

            <div className='flex justify-between items-center text-xs text-muted-foreground pt-2 border-t border-muted'>
              <span>Assessed by: {assessment.author}</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
