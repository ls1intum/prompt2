import { HelpCircle } from 'lucide-react'
import { Card, CardContent } from '@tumaet/prompt-ui-components'
import { useState, useRef } from 'react'

interface CoursePhaseTypeDescriptionProps {
  title: string
  description: string
}

const DISTANCE_HOVER_TOP = 36 + 10 // 36: touch lower edge of CPTItem, 10: extra distance

export const CoursePhaseTypeDescription = ({
  title,
  description,
}: CoursePhaseTypeDescriptionProps) => {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<'left' | 'right'>('right')
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const tooltipWidth = 260 // (w-64 = 256px) + (padding = 4px)

      if (rect.right + tooltipWidth > viewportWidth) {
        setPosition('left')
      } else {
        setPosition('right')
      }
    }
    setOpen(true)
  }

  return (
    <div
      ref={containerRef}
      className='inline-block'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setOpen(false)}
    >
      <HelpCircle className='h-4 w-4 cursor-pointer' />

      {open && (
        <div
          className='absolute z-[9999]'
          style={
            position === 'right'
              ? { top: DISTANCE_HOVER_TOP, left: -2 }
              : { top: DISTANCE_HOVER_TOP, right: -2 }
          }
        >
          <Card className='w-64 shadow-lg'>
            <CardContent className='p-4'>
              <p className='font-semibold'>{title}</p>
              <p className='text-sm text-muted-foreground'>{description}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
