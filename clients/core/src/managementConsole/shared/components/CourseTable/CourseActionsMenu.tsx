import React, { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@tumaet/prompt-ui-components'
import { Course } from '@tumaet/prompt-shared-state'
import { useNavigate } from 'react-router-dom'
import { archiveCourse, unarchiveCourse } from '@core/network/mutations/updateCourseArchiveStatus'
import { Archive, ArchiveRestore, ArrowRight } from 'lucide-react'
import { CourseActionsMenuItemWithLoader } from './CourseActionsMenuItemWithLoader'

interface CourseActionsMenuProps {
  selected: Course[]
  trigger: React.ReactNode
  disabled?: boolean
}

type Action = 'archive' | 'unarchive' | null

export const CourseActionsMenu = ({
  selected,
  trigger,
  disabled = false,
}: CourseActionsMenuProps): JSX.Element => {
  const courseIds = selected.map((c) => c.id)
  const isSingle = courseIds.length === 1
  const canArchive = selected.some((c) => !c.archived)
  const canUnarchive = selected.some((c) => c.archived)

  const [actionInProgress, setActionInProgress] = useState<Action>(null)
  const [open, setOpen] = useState(false)

  const navigate = useNavigate()

  const closeMenu = () => {
    setOpen(false)
  }

  async function archiveSelected() {
    setActionInProgress('archive')
    try {
      await Promise.all(selected.filter((c) => !c.archived).map((c) => archiveCourse(c.id)))
    } finally {
      setActionInProgress(null)
      closeMenu()
    }
  }

  async function unarchiveSelected() {
    setActionInProgress('unarchive')
    try {
      await Promise.all(selected.filter((c) => c.archived).map((c) => unarchiveCourse(c.id)))
    } finally {
      setActionInProgress(null)
      closeMenu()
    }
  }

  function openCourse(courseId: string) {
    navigate(`/management/course/${courseId}`)
  }

  const isBusy = actionInProgress !== null

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild disabled={disabled || courseIds.length === 0 || isBusy}>
        {trigger}
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end'>
        {canArchive && (
          <CourseActionsMenuItemWithLoader
            icon={<Archive />}
            name='Archive'
            onClick={archiveSelected}
          />
        )}

        {canUnarchive && (
          <CourseActionsMenuItemWithLoader
            icon={<ArchiveRestore />}
            name='Unarchive'
            onClick={unarchiveSelected}
          />
        )}

        {isSingle && (
          <DropdownMenuItem onSelect={() => openCourse(courseIds[0])}>
            <ArrowRight />
            Open course
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
