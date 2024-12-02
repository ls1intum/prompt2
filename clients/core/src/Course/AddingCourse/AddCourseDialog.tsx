import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { courseFormSchema, CourseFormValues } from '../../validations/course'
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

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: '',
      course_type: '',
      ects: 0,
      semester_tag: '',
    },
  })

  const onSubmit = (data: CourseAppearanceFormValues) => {
    const completeData = { ...coursePropertiesFormValues, ...data }
    console.log(completeData)
    // todo API call
    setIsOpen(false)
    setCurrentPage(1)
    // reset the appearance form
    form.reset()
    setCoursePropertiesFormValues(null) // reset the page 1 form
  }

  const handleNext = (data) => {
    setCoursePropertiesFormValues(data)
    setCurrentPage(2)
  }

  const handleBack = () => {
    setCurrentPage(1)
  }

  const handleCancel = () => {
    setIsOpen(false)
    setCurrentPage(1)
    setCoursePropertiesFormValues(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
