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
  useTemplateCopy?: boolean
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
  useTemplateCopy,
}: WarningStepProps) => {
  if (isCheckingCopyability) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Checking Course Compatibility</DialogTitle>
          <DialogDescription>
            {useTemplateCopy
              ? 'Please wait while we check if all course phases can be applied...'
              : 'Please wait while we check if all course phases can be copied...'}
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
            {useTemplateCopy
              ? 'There was an error checking if the template can be applied.'
              : 'There was an error checking if the course can be copied.'}
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
          <DialogTitle>
            {useTemplateCopy ? 'Template Ready to Apply' : 'Course Ready to Copy'}
          </DialogTitle>
          <DialogDescription>
            {useTemplateCopy
              ? 'All template phases support configuration templates. The template will be fully applied.'
              : 'All course phases support configuration copying. The course will be fully duplicated.'}
          </DialogDescription>
        </DialogHeader>
        <Alert>
          <Info className='h-4 w-4' />
          <AlertTitle>Everything Looks Good</AlertTitle>
          <AlertDescription>
            {useTemplateCopy
              ? 'All template phases and their configurations will be applied automatically.'
              : 'All phases and their configurations will be copied automatically.'}
          </AlertDescription>
        </Alert>
        <DialogFooter>
          <Button variant='outline' onClick={onBack}>
            Back
          </Button>
          <Button onClick={onProceed} disabled={isCopying}>
            {isCopying && useTemplateCopy
              ? 'Applying Template...'
              : isCopying
                ? 'Copying Course...'
                : useTemplateCopy
                  ? 'Apply Template'
                  : 'Copy Course'}
          </Button>
        </DialogFooter>
      </>
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {useTemplateCopy
            ? 'Warning: Partial Template Application Only'
            : 'Warning: Partial Course Copy Only'}
        </DialogTitle>
        <DialogDescription>
          {useTemplateCopy
            ? 'Some phases of this template cannot be fully applied. Please review the details below before continuing.'
            : 'Some phases of this course cannot be fully copied. Please review the details below before continuing.'}
        </DialogDescription>
      </DialogHeader>
      <Alert variant='destructive'>
        <AlertTriangle className='h-4 w-4' />
        <AlertTitle>Missing Configuration Support</AlertTitle>
        <AlertDescription>
          {useTemplateCopy
            ? 'The following course phases do not support templating of their configurations:'
            : 'The following course phases do not support automatic copying of their configurations:'}
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
          {useTemplateCopy
            ? 'The template will still be applied, but the listed phases will not have their internal configurations applied. ' +
              'You will need to configure those manually after applying the template.'
            : 'The course and its phases will still be copied, including their structure and dependencies. However, the listed phases ' +
              'will not have their internal configurations copied. You will need to configure ' +
              'those manually after the copy.'}
        </AlertDescription>
      </Alert>
      <DialogFooter>
        <Button variant='outline' onClick={onBack}>
          Back
        </Button>
        <Button onClick={onProceed} disabled={isCopying}>
          {useTemplateCopy
            ? isCopying
              ? 'Applying Template...'
              : 'Proceed Anyway'
            : isCopying
              ? 'Copying Course...'
              : 'Proceed Anyway'}
        </Button>
      </DialogFooter>
    </>
  )
}
