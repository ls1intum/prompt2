import React, { useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CourseFormValues } from '../../validations/course'
import { AddCourseProperties } from './AddCourseProperties'
import { AddCourseAppearance } from './AddCourseAppearance'
import { CourseAppearanceFormValues } from 'src/validations/courseAppearance'

interface AddCourseDialogProps {
  children: React.ReactNode
}

export const AddCourseDialog: React.FC<AddCourseDialogProps> = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [coursePropertiesFormValues, setCoursePropertiesFormValues] =
    React.useState<CourseFormValues | null>(null)

  const onSubmit = (data: CourseAppearanceFormValues) => {
    const completeData = { ...coursePropertiesFormValues, ...data }
    console.log(completeData)
    // todo API call
    setIsOpen(false)
    setCurrentPage(1)

    setCoursePropertiesFormValues(null) // reset the page 1 form
  }

  const handleNext = (data) => {
    setCoursePropertiesFormValues(data)
    setCurrentPage(2)
  }

  const handleBack = () => {
    setCurrentPage(1)
  }

  const handleCancel = useCallback(() => {
    setIsOpen(false)
    setCoursePropertiesFormValues(null)
    setCurrentPage(1)
  }, [])

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleCancel()
    } else {
      setIsOpen(open)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[550px]'>
        <DialogHeader>
          <DialogTitle>Add a New Course</DialogTitle>
        </DialogHeader>
        {currentPage === 1 ? (
          <AddCourseProperties
            onNext={handleNext}
            onCancel={handleCancel}
            initialValues={coursePropertiesFormValues || undefined}
          />
        ) : (
          <AddCourseAppearance onBack={handleBack} onSubmit={onSubmit} />
        )}
      </DialogContent>
    </Dialog>
  )
}
