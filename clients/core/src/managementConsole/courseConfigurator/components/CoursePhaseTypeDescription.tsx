import { HelpCircle } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@tumaet/prompt-ui-components'
import { useState, useRef, useLayoutEffect, useState as useStateReact } from 'react'
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
  const [position, setPosition] = useStateReact<{ x: number; y: number } | null>(null)
  const iconRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!iconRef.current) return
    const rect = iconRef.current.getBoundingClientRect()

    const ICON_OFFSET_LEFT = 10
    const ICON_OFFSET_TOP = 26

    setPosition({
      x: rect.left - ICON_OFFSET_LEFT,
      y: rect.bottom - ICON_OFFSET_TOP,
    })
  }, [])

  return (
    <div
      ref={iconRef}
      className='relative inline-block'
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <HelpCircle className='h-4 w-4' />

      {position &&
        createPortal(
          <div
            className={`
              absolute z-[9999] transition-opacity duration-150
              ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            `}
            style={{
              position: 'absolute',
              top: position.y,
              left: position.x,
            }}
          >
            <Card className='w-64'>
              <CardHeader className='p-4'>
                <div className='flex items-center'>
                  <HelpCircle className='h-4 w-4' />
                  <span className='ml-2'>Explanation</span>
                </div>
                <h3 className='font-semibold text-lg'>{title}</h3>
              </CardHeader>
              <CardContent className='-mt-6 p-4'>{description}</CardContent>
            </Card>
          </div>,
          document.body,
        )}
    </div>
  )
}
