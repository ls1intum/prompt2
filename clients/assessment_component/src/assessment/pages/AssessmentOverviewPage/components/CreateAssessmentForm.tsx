import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ClipboardCheck } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { useCreateAssessment } from '../hooks/useCreateAssessment'
import type { CreateOrUpdateAssessmentRequest, ScoreLevel } from '../../../interfaces/assessment'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface CreateAssessmentFormProps {
  competency: string
  description: string
  courseParticipationID: string
  competencyID: string
  noviceText: string
  intermediateText: string
  advancedText: string
  expertText: string
}

export const CreateAssessmentForm = ({
  competency,
  description,
  courseParticipationID,
  competencyID,
  noviceText,
  intermediateText,
  advancedText,
  expertText,
}: CreateAssessmentFormProps) => {
  const [error, setError] = useState<string | null>(null)
  const [date, setDate] = useState<Date | undefined>(new Date())

  const { register, handleSubmit, reset, setValue, watch } =
    useForm<CreateOrUpdateAssessmentRequest>({
      defaultValues: {
        courseParticipationID,
        competencyID,
        score: 'novice' as ScoreLevel,
        comment: '',
        assessedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      },
    })

  const { mutate, isPending } = useCreateAssessment(setError)
  const selectedScore = watch('score')

  const onSubmit = (data: CreateOrUpdateAssessmentRequest) => {
    if (date) {
      data.assessedAt = format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'")
    }

    mutate(data, {
      onSuccess: () => {
        reset()
        setDate(new Date())
        window.location.reload()
      },
    })
  }

  const handleScoreChange = (value: ScoreLevel) => {
    setValue('score', value)
  }

  const getLevelConfig = (level: ScoreLevel) => {
    switch (level) {
      case 'novice':
        return {
          title: 'Novice',
          description: noviceText,
          color: 'border-blue-500',
          bgColor: 'bg-blue-50',
          selectedBg: 'bg-blue-100',
          icon: '🔵',
        }
      case 'intermediate':
        return {
          title: 'Intermediate',
          description: intermediateText,
          color: 'border-green-500',
          bgColor: 'bg-green-50',
          selectedBg: 'bg-green-100',
          icon: '🟢',
        }
      case 'advanced':
        return {
          title: 'Advanced',
          description: advancedText,
          color: 'border-orange-600',
          bgColor: 'bg-orange-50',
          selectedBg: 'bg-orange-100',
          icon: '🟠',
        }
      case 'expert':
        return {
          title: 'Expert',
          description: expertText,
          color: 'border-purple-500',
          bgColor: 'bg-purple-50',
          selectedBg: 'bg-purple-100',
          icon: '🟣',
        }
    }
  }

  return (
    <Card className='shadow-sm transition-all hover:shadow-md'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg font-medium flex items-center gap-2'>
          <ClipboardCheck className='h-4 w-4 text-muted-foreground' />
          Assess {competency}
        </CardTitle>
        <CardDescription>
          <p className='text-sm text-muted-foreground'>{description}</p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div>
            <Label className='text-sm font-medium mb-3 block'>Select Competency Level</Label>
            <div className='grid grid-cols-4 sm:grid-cols-4 gap-1'>
              {(['novice', 'intermediate', 'advanced', 'expert'] as ScoreLevel[]).map((level) => {
                const config = getLevelConfig(level)
                const isSelected = selectedScore === level

                return (
                  <button
                    key={level}
                    type='button'
                    onClick={() => handleScoreChange(level)}
                    className={cn(
                      'h-full text-left p-4 rounded-lg border-2 transition-all',
                      config.color,
                      isSelected ? config.selectedBg : config.bgColor,
                      'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400',
                    )}
                  >
                    <div className='flex justify-between mb-2'>
                      <span className='font-semibold'>{config.title}</span>
                      <span>{config.icon}</span>
                    </div>
                    <p className='text-sm text-gray-700 line-clamp-4'>{config.description}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='comment' className='text-sm font-medium'>
              Assessment Comments
            </Label>
            <Textarea
              id='comment'
              placeholder='Enter notable information about the assessment, e.g. remarkable strengths'
              className='resize-none min-h-[120px] focus-visible:ring-1'
              {...register('comment', { required: true })}
            />
          </div>

          {error && (
            <div className='flex items-center gap-2 text-destructive text-sm p-2 bg-destructive/10 rounded-md'>
              <AlertCircle className='h-4 w-4' />
              <p>{error}</p>
            </div>
          )}

          <div className='flex justify-end'>
            <Button type='submit' disabled={isPending} className='w-full sm:w-auto'>
              {isPending ? 'Creating...' : 'Submit Assessment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
