import { format } from 'date-fns'
import { ClipboardCheck, Pencil, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { Competency } from '../../../interfaces/competency'
import { Assessment, ScoreLevel } from '../../../interfaces/assessment'

interface CompetencyAssessmentItemProps {
  competency: Competency
  assessment: Assessment
  onEdit?: (assessmentId: string) => void
  onDelete?: (assessmentId: string) => void
}

export function CompetencyWithAssessmentItem({
  competency,
  assessment,
  onEdit,
  onDelete,
}: CompetencyAssessmentItemProps) {
  const getLevelConfig = (level: ScoreLevel) => {
    switch (level) {
      case 'novice':
        return {
          title: 'Novice',
          color: 'border-blue-500',
          textColor: 'text-blue-700',
          bgColor: 'bg-blue-50',
          selectedBg: 'bg-blue-100',
          icon: '🔵',
        }
      case 'intermediate':
        return {
          title: 'Intermediate',
          color: 'border-green-500',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          selectedBg: 'bg-green-100',
          icon: '🟢',
        }
      case 'advanced':
        return {
          title: 'Advanced',
          color: 'border-orange-600',
          textColor: 'text-orange-700',
          bgColor: 'bg-orange-50',
          selectedBg: 'bg-orange-100',
          icon: '🟠',
        }
      case 'expert':
        return {
          title: 'Expert',
          color: 'border-purple-500',
          textColor: 'text-purple-700',
          bgColor: 'bg-purple-50',
          selectedBg: 'bg-purple-100',
          icon: '🟣',
        }
    }
  }

  const config = getLevelConfig(assessment.score)
  const scoreText = competency[assessment.score]
  const formattedDate = format(new Date(assessment.assessedAt), 'MMM d, yyyy')

  const handleEdit = () => {
    if (onEdit) {
      onEdit(assessment.id)
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(assessment.id)
    }
  }

  return (
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
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 text-destructive'
          onClick={handleDelete}
          aria-label='Delete assessment'
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>

      <div className='p-4'>
        <div className='flex justify-between items-start mb-3 pr-8'>
          <div className='flex items-center gap-2'>
            <ClipboardCheck className='h-4 w-4 text-muted-foreground flex-shrink-0' />
            <h3 className='text-base font-medium'>{competency.name}</h3>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-2'>
          <div className='text-xs text-muted-foreground line-clamp-2'>{competency.description}</div>
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
          <span>Assessed by: Maximilian Rapp</span>
          <span>{formattedDate}</span>
        </div>
      </div>
    </Card>
  )
}
