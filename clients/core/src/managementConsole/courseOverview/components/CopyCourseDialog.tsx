import { useState } from 'react'
import { Dialog, DialogContent } from '@tumaet/prompt-ui-components'
import { useCopyCourse } from '../../../network/hooks/useCopyCourse'
import { useCourseForm } from '../../../network/hooks/useCourseForm'
import { CopyCourseForm } from './CopyCourseForm'
import { WarningStep } from './WarningStep'
import type { CourseCopyDialogProps, DialogStep } from '../interfaces/copyCourseDialogProps'
import type { JSX } from 'react/jsx-runtime' // Declare JSX variable

interface ExtendedCourseCopyDialogProps extends CourseCopyDialogProps {
  useTemplateCopy?: boolean
}

export const CopyCourseDialog = ({
  courseId,
  isOpen,
  onClose,
  useTemplateCopy = false,
}: ExtendedCourseCopyDialogProps): JSX.Element => {
  const [currentStep, setCurrentStep] = useState<DialogStep>('form')

  // Use the appropriate hook based on the useTemplateCopy prop
  const regularCopyHook = useCopyCourse(courseId, currentStep, onClose, setCurrentStep)
  const templateCopyHook = useCopyCourse(courseId, currentStep, onClose, setCurrentStep)

  const {
    copyabilityData,
    isCheckingCopyability,
    copyabilityError,
    isCopying,
    handleProceedWithCopy,
    queryClient,
  } = useTemplateCopy ? templateCopyHook : regularCopyHook

  const { form, formData, course, onFormSubmit, resetForm } = useCourseForm(
    courseId,
    setCurrentStep,
  )

  const handleClose = () => {
    setCurrentStep('form')
    resetForm()
    onClose()
  }

  const handleBackToForm = () => {
    setCurrentStep('form')
  }

  const handleProceed = () => {
    if (!formData) return
    handleProceedWithCopy(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} aria-hidden='true'>
      <DialogContent className='max-w-md'>
        {currentStep === 'form' && (
          <CopyCourseForm
            form={form}
            courseName={course?.name}
            onSubmit={onFormSubmit}
            onClose={handleClose}
          />
        )}
        {currentStep === 'warning' && (
          <WarningStep
            copyabilityData={copyabilityData}
            isCheckingCopyability={isCheckingCopyability}
            copyabilityError={copyabilityError}
            isCopying={isCopying}
            courseId={courseId}
            onBack={handleBackToForm}
            onProceed={handleProceed}
            queryClient={queryClient}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
