import { HelpCircle } from 'lucide-react'
import { Card, CardContent } from '@tumaet/prompt-ui-components'
import { useState, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'

interface CoursePhaseTypeDescriptionProps {
  title: string
  description: string
}

export const CoursePhaseTypeDescription = ({
  title,
  description,
}: CoursePhaseTypeDescriptionProps): JSX.Element => {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const iconRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!iconRef.current) return
    const rect = iconRef.current.getBoundingClientRect()

    setPos({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 6,
    })
  }, [])

  return (
    <div
      ref={iconRef}
      className='relative'
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <HelpCircle className='h-4 w-4 cursor-pointer' />

      {open &&
        pos &&
        createPortal(
          <div
            className='fixed z-[9999] transition-opacity duration-150 opacity-100'
            style={{
              top: pos.y,
              left: pos.x,
              transform: 'translateX(-50%)',
            }}
          >
            <Card className='w-64 shadow-lg'>
              <CardContent className='p-4'>
                <p className='font-semibold'>{title}</p>
                <p className='text-sm text-muted-foreground'>{description}</p>
              </CardContent>
            </Card>
          </div>,
          document.body,
        )}
    </div>
  )
}
