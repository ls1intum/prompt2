import { useState } from 'react'
import { Dialog, DialogContent } from '@tumaet/prompt-ui-components'
import { useCopyCourse } from '../../../network/hooks/useCopyCourse'
import { useCourseForm } from '../../../network/hooks/useCourseForm'
import { CopyCourseForm } from './CopyCourseForm'
import { WarningStep } from './WarningStep'
import type { CourseCopyDialogProps, DialogStep } from '../interfaces/copyCourseDialogProps'

export const CopyCourseDialog = ({
  courseId,
  isOpen,
  onClose,
  useTemplateCopy,
}: CourseCopyDialogProps): JSX.Element => {
  const [currentStep, setCurrentStep] = useState<DialogStep>('form')

  const copyHook = useCopyCourse(courseId, currentStep, onClose, setCurrentStep)

  const {
    copyabilityData,
    isCheckingCopyability,
    copyabilityError,
    isCopying,
    handleProceedWithCopy,
    queryClient,
  } = copyHook

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
            useTemplateCopy={useTemplateCopy}
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
