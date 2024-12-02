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
import { AddCourseAppearance } from './AddCourseApperance'

interface AddCourseDialogProps {
  children: React.ReactNode
}

export const AddCourseDialog: React.FC<AddCourseDialogProps> = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [currentPage, setCurrentPage] = React.useState(1)

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: '',
      course_type: '',
      ects: 0,
      semester_tag: '',
      color: '',
      icon: '',
    },
  })

  const onSubmit = (data: CourseFormValues) => {
    // todo API call
    setIsOpen(false)
    setCurrentPage(1)
    form.reset()
  }

  const handleNext = () => {
    setCurrentPage(2)
  }

  const handleBack = () => {
    setCurrentPage(1)
  }

  const handleCancel = () => {
    setIsOpen(false)
    setCurrentPage(1)
    form.reset()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[550px]'>
        <DialogHeader>
          <DialogTitle>Add a New Course</DialogTitle>
        </DialogHeader>
        {currentPage === 1 ? (
          <AddCourseProperties form={form} onNext={handleNext} onCancel={handleCancel} />
        ) : (
          <AddCourseAppearance form={form} onBack={handleBack} onSubmit={onSubmit} />
        )}
      </DialogContent>
    </Dialog>
  )
}
