import * as React from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { CheckCircle, ChevronDown, ChevronUp, Lock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

interface CourseStepProps {
  number: number
  title: string
  description: string
  isCompleted: boolean
  isDisabled?: boolean
  isOpen?: boolean
  onToggle: () => void
  estimatedTime?: string
  children: React.ReactNode
}

export function IntroCourseStep({
  number,
  title,
  description,
  isCompleted,
  isDisabled = false,
  isOpen = false,
  onToggle,
  estimatedTime,
  children,
}: CourseStepProps) {
  const [isExpanded, setIsExpanded] = React.useState(isOpen)

  const handleToggle = () => {
    if (!isDisabled) {
      setIsExpanded(!isExpanded)
      onToggle()
    }
  }

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={handleToggle}
      className={cn('transition-all duration-300', isDisabled && 'opacity-50')}
    >
      <Card className='overflow-hidden'>
        <CardContent className='p-6'>
          <CollapsibleTrigger className='w-full text-left' disabled={isDisabled}>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <span
                  className={cn(
                    'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium',
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isDisabled
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-primary text-primary-foreground',
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className='w-5 h-5' />
                  ) : isDisabled ? (
                    <Lock className='w-5 h-5' />
                  ) : (
                    number
                  )}
                </span>
                <div>
                  <h2 className='text-xl font-semibold'>{title}</h2>
                  <p className='text-sm text-muted-foreground mt-1'>{description}</p>
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                {estimatedTime && (
                  <Badge variant='outline' className='text-xs'>
                    {estimatedTime}
                  </Badge>
                )}
                {isExpanded ? (
                  <ChevronUp className='w-5 h-5 text-muted-foreground' />
                ) : (
                  <ChevronDown className='w-5 h-5 text-muted-foreground' />
                )}
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className='mt-6'>
              <Separator />
              <div className='mt-6'>{children}</div>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  )
}
