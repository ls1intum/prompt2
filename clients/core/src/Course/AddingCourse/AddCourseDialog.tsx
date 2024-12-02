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
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PostCourse } from '@/interfaces/post_course'
import { postNewCourse } from '../../network/mutations/postNewCourse'
import { useNavigate } from 'react-router-dom'

interface AddCourseDialogProps {
  children: React.ReactNode
}

export const AddCourseDialog: React.FC<AddCourseDialogProps> = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [coursePropertiesFormValues, setCoursePropertiesFormValues] =
    React.useState<CourseFormValues | null>(null)

  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { mutate, isPending, error, isError } = useMutation({
    mutationFn: (course: PostCourse) => {
      return postNewCourse(course)
    },
    onSuccess: (data: string | undefined) => {
      console.log('Received ID' + data)
      queryClient.invalidateQueries({ queryKey: ['courses'] })

      setIsOpen(false)
      setIsOpen(false)
      navigate(`/management/course/${data}`)
    },
  })

  const onSubmit = (data: CourseAppearanceFormValues) => {
    const course: PostCourse = {
      name: coursePropertiesFormValues?.name || '',
      start_date: coursePropertiesFormValues?.dateRange?.from || new Date(),
      end_date: coursePropertiesFormValues?.dateRange?.to || new Date(),
      course_type: coursePropertiesFormValues?.course_type || '',
      ects: coursePropertiesFormValues?.ects || 0,
      semester_tag: coursePropertiesFormValues?.semester_tag || '',
      // eslint-disable-next-line prettier/prettier
      meta_data: { icon: data.icon, 'bg-color': data.color },
    }

    console.log(course)
    // todo API call
    mutate(course)

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
      {isPending ? (
        <div>Loading...</div>
      ) : isError ? (
        <DialogContent className='sm:max-w-[550px]'>
          <div>Error: {error.message}</div>
        </DialogContent>
      ) : (
        <DialogContent className='sm:max-w-[550px]'>
          <DialogHeader>
            <DialogTitle className='text-2xl font-bold text-center'>Add a New Course</DialogTitle>
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
      )}
    </Dialog>
  )
}
