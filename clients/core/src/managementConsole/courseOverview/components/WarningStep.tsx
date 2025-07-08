import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Alert,
  AlertDescription,
  AlertTitle,
} from '@tumaet/prompt-ui-components'
import { AlertTriangle, Info } from 'lucide-react'
import type { QueryClient } from '@tanstack/react-query'
import type { CopyabilityData } from '../interfaces/copyCourseDialogProps'

interface WarningStepProps {
  copyabilityData?: CopyabilityData
  isCheckingCopyability: boolean
  copyabilityError: Error | null
  isCopying: boolean
  courseId: string
  onBack: () => void
  onProceed: () => void
  queryClient: QueryClient
}

export const WarningStep = ({
  copyabilityData,
  isCheckingCopyability,
  copyabilityError,
  isCopying,
  courseId,
  onBack,
  onProceed,
  queryClient,
}: WarningStepProps) => {
  if (isCheckingCopyability) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Checking Course Compatibility</DialogTitle>
          <DialogDescription>
            Please wait while we check if all course phases can be copied...
          </DialogDescription>
        </DialogHeader>
        <div className='flex items-center justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
        </div>
      </>
    )
  }

  if (copyabilityError) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Error Checking Compatibility</DialogTitle>
          <DialogDescription>
            There was an error checking if the course can be copied.
          </DialogDescription>
        </DialogHeader>
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to check course compatibility. Please try again.
          </AlertDescription>
        </Alert>
        <DialogFooter>
          <Button variant='outline' onClick={onBack}>
            Back
          </Button>
          <Button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ['course-copyability', courseId] })
            }
          >
            Retry
          </Button>
        </DialogFooter>
      </>
    )
  }

  if (!copyabilityData) return null

  const { copyable, missingPhaseTypes = [] } = copyabilityData

  if (copyable) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Course Ready to Copy</DialogTitle>
          <DialogDescription>
            All course phases support configuration copying. The course will be fully duplicated.
          </DialogDescription>
        </DialogHeader>
        <Alert>
          <Info className='h-4 w-4' />
          <AlertTitle>Everything Looks Good</AlertTitle>
          <AlertDescription>
            All phases and their configurations will be copied automatically.
          </AlertDescription>
        </Alert>
        <DialogFooter>
          <Button variant='outline' onClick={onBack}>
            Back
          </Button>
          <Button onClick={onProceed} disabled={isCopying}>
            {isCopying ? 'Copying...' : 'Copy Course'}
          </Button>
        </DialogFooter>
      </>
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Warning: Partial Copy Only</DialogTitle>
        <DialogDescription>
          Some phases of this course cannot be fully copied. Please review the details below before
          continuing.
        </DialogDescription>
      </DialogHeader>
      <Alert variant='destructive'>
        <AlertTriangle className='h-4 w-4' />
        <AlertTitle>Missing Configuration Support</AlertTitle>
        <AlertDescription>
          The following phases do not support automatic copying of their configurations:
          <ul className='list-disc list-inside mt-2'>
            {missingPhaseTypes.map((phaseType, index) => (
              <li key={index}>{phaseType}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
      <Alert>
        <Info className='h-4 w-4' />
        <AlertTitle>What Will Happen</AlertTitle>
        <AlertDescription>
          The course and its phases will still be copied, including their structure and
          dependencies. However, the listed phases will not have their internal configurations
          (e.g., settings, criteria, or forms) copied. You will need to configure those manually
          after the copy.
        </AlertDescription>
      </Alert>
      <DialogFooter>
        <Button variant='outline' onClick={onBack}>
          Back
        </Button>
        <Button onClick={onProceed} disabled={isCopying}>
          {isCopying ? 'Copying...' : 'Proceed Anyway'}
        </Button>
      </DialogFooter>
    </>
  )
}
