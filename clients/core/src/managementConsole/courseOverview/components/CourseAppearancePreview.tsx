import React from 'react'
import DynamicIcon from '@/components/DynamicIcon'
import {
  DEFAULT_COURSE_COLOR,
  DEFAULT_COURSE_ICON,
} from '@core/managementConsole/courseOverview/constants/courseAppearance'

interface CourseAppearancePreviewProps {
  color?: string
  icon?: string
  createTemplate?: boolean
}

export const CourseAppearancePreview = ({
  color,
  icon,
  createTemplate,
}: CourseAppearancePreviewProps) => {
  const appliedColor = color || DEFAULT_COURSE_COLOR
  const appliedIcon = icon || DEFAULT_COURSE_ICON

  return (
    <div className='space-y-2'>
      <h3 className='text-lg font-semibold mb-2'>Preview</h3>
      <div className='flex items-center space-x-4'>
        <div className='relative flex aspect-square size-12 items-center justify-center after:absolute after:inset-0 after:rounded-lg after:border-2 after:border-primary'>
          <div
            className={`flex aspect-square items-center justify-center rounded-lg text-gray-800 size-12 ${appliedColor}`}
          >
            <DynamicIcon name={appliedIcon} />
          </div>
        </div>
        <span className='text-sm text-gray-600'>
          {createTemplate ? (
            'This is how your template icon will appear in the sidebar.'
          ) : (
            <>
              This is how your course icon will appear in the sidebar.
              <br />
              <b>Please note:</b> it will only be displayed while the course is active.
            </>
          )}
        </span>
      </div>
    </div>
  )
}
