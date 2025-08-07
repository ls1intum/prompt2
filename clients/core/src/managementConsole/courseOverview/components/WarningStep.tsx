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
import { c } from 'framer-motion/dist/types.d-Cjd591yU'

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
  createTemplate?: boolean
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
  createTemplate,
}: WarningStepProps) => {
  if (isCheckingCopyability) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Checking Course Compatibility</DialogTitle>
          <DialogDescription>
            {useTemplateCopy && !createTemplate
              ? 'Please wait while we check if all course phases can be applied...'
              : createTemplate
                ? 'Please wait while we check if the course phases can be made into a template...'
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
            {useTemplateCopy && !createTemplate
              ? 'There was an error checking if the template can be applied.'
              : createTemplate
                ? 'There was an error checking if the course can be made into a template.'
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
            {useTemplateCopy && !createTemplate
              ? 'Template Ready to Apply'
              : createTemplate
                ? 'Template Ready to Create'
                : 'Course Ready to Copy'}
          </DialogTitle>
          <DialogDescription>
            {useTemplateCopy && !createTemplate
              ? 'All template phases support configuration templates. The template will be fully applied.'
              : createTemplate
                ? 'The course with all its course phase configurations can be made into a template.'
                : 'All course phases support configuration copying. The course will be fully duplicated.'}
          </DialogDescription>
        </DialogHeader>
        <Alert>
          <Info className='h-4 w-4' />
          <AlertTitle>Everything Looks Good</AlertTitle>
          <AlertDescription>
            {useTemplateCopy && !createTemplate
              ? 'All template phases and their configurations will be applied automatically.'
              : createTemplate
                ? 'All course phase configurations will be preserved in the template.'
                : 'All phases and their configurations will be copied automatically.'}
          </AlertDescription>
        </Alert>
        <DialogFooter>
          <Button variant='outline' onClick={onBack}>
            Back
          </Button>
          <Button onClick={onProceed} disabled={isCopying}>
            {isCopying && useTemplateCopy && !createTemplate
              ? 'Applying Template...'
              : isCopying && useTemplateCopy && createTemplate
                ? 'Creating Template...'
                : isCopying && !useTemplateCopy
                  ? 'Copying Course...'
                  : useTemplateCopy && !createTemplate
                    ? 'Apply Template'
                    : createTemplate
                      ? 'Create Template'
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
          {useTemplateCopy && !createTemplate
            ? 'Warning: Partial Template Application Only'
            : createTemplate
              ? 'Warning: Partial Template Creation Only'
              : 'Warning: Partial Course Copy Only'}
        </DialogTitle>
        <DialogDescription>
          {useTemplateCopy && !createTemplate
            ? 'Some phases of this template cannot be fully applied. Please review the details below before continuing.'
            : createTemplate
              ? 'Some phases of this course cannot be fully made into a template. Please review the details below before continuing.'
              : 'Some phases of this course cannot be fully copied. Please review the details below before continuing.'}
        </DialogDescription>
      </DialogHeader>
      <Alert variant='destructive'>
        <AlertTriangle className='h-4 w-4' />
        <AlertTitle>Missing Configuration Support</AlertTitle>
        <AlertDescription>
          {useTemplateCopy && !createTemplate
            ? 'The following course phases do not support templating of their configurations:'
            : createTemplate
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
          {useTemplateCopy && !createTemplate
            ? 'The template will still be applied, but the listed phases will not have their internal configurations applied. ' +
              'You will need to configure those manually after applying the template.'
            : createTemplate
              ? 'The course will still be made into a template, but the listed phases will not have their internal configurations preserved. ' +
                'You will need to configure those manually after creating the template.'
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
          {isCopying && useTemplateCopy && !createTemplate
            ? 'Applying Template...'
            : isCopying && useTemplateCopy && createTemplate
              ? 'Creating Template...'
              : isCopying && !useTemplateCopy
                ? 'Copying Course...'
                : 'Proceed Anyway'}
        </Button>
      </DialogFooter>
    </>
  )
}
