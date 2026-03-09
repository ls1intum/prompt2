import { useCourseStore } from '@tumaet/prompt-shared-state'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@tumaet/prompt-ui-components'

interface ArchiveCourseConfirmationDialogProps {
  courseID: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ArchiveCourseConfirmationDialog({
  courseID,
  isOpen,
  onOpenChange,
  onConfirm,
}: ArchiveCourseConfirmationDialogProps) {
  const { courses } = useCourseStore()
  const course = courses.find((c) => c.id === courseID)
  const hasApplicationPhase =
    course?.coursePhases.some((p) => p.coursePhaseType === 'Application') ?? false

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive this course?</AlertDialogTitle>
          <AlertDialogDescription className='mt-2'>
            {hasApplicationPhase && (
              <>
                <p className='font-semibold text-black'>
                  This course has an active application phase.
                </p>
                <p>Archiving it will prevent students from submitting applications.</p>
              </>
            )}
            <p>
              The course will no longer appear in the sidebar but is still retrievable at the
              Archived Courses page.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Archive</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
