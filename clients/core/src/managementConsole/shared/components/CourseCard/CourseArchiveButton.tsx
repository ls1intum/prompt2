import { archiveCourses, unarchiveCourses } from '@core/network/mutations/updateCourseArchiveStatus'
import { ArchiveCourseConfirmationDialog } from '@core/managementConsole/shared/components/ArchiveCourseConfirmationDialog'
import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@tumaet/prompt-ui-components'
import { Archive, ArchiveRestore } from 'lucide-react'
import { useState } from 'react'

interface CourseArchiveButtonProps {
  archived: boolean
  courseID: string
}

export function CourseArchiveButton({ archived, courseID }: CourseArchiveButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleClick = () => {
    if (archived) {
      unarchiveCourses([courseID])
    } else {
      setDialogOpen(true)
    }
  }

  return (
    <>
      <Tooltip>
        <TooltipContent>{archived ? 'Unarchive' : 'Archive'} this course</TooltipContent>
        <TooltipTrigger>
          <Button
            variant='outline'
            onClick={handleClick}
            className='shrink-0 focus-visible:ring-2 focus-visible:ring-offset-2'
            aria-label={archived ? 'Unarchive course' : 'Archive course'}
          >
            {archived ? (
              <ArchiveRestore className='w-6 h-6 text-gray-600 dark:text-gray-100' />
            ) : (
              <Archive className='w-6 h-6 text-gray-600 dark:text-gray-100' />
            )}
          </Button>
        </TooltipTrigger>
      </Tooltip>

      <ArchiveCourseConfirmationDialog
        courseID={courseID}
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={() => archiveCourses([courseID])}
      />
    </>
  )
}
