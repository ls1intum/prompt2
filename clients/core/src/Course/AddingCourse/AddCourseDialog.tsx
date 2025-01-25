import React, { useCallback, useEffect } from 'react'
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
import { CourseAppearanceFormValues } from '../../validations/courseAppearance'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PostCourse } from '../interfaces/postCourse'
import { postNewCourse } from '../../network/mutations/postNewCourse'
import { useNavigate } from 'react-router-dom'
import { useKeycloak } from '../../keycloak/useKeycloak'
import { DialogLoadingDisplay } from '@/components/dialog/DialogLoadingDisplay'
import { DialogErrorDisplay } from '@/components/dialog/DialogErrorDisplay'

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
  const { forceTokenRefresh } = useKeycloak()

  const { mutate, isPending, error, isError, reset } = useMutation({
    mutationFn: (course: PostCourse) => {
      return postNewCourse(course)
    },
    onSuccess: (data: string | undefined) => {
      forceTokenRefresh() // refresh token to get permission for new course
        .then(() => {
          // Invalidate course queries
          return queryClient.invalidateQueries({ queryKey: ['courses'] })
        })
        .then(() => {
          // Wait for courses to be refetched
          return queryClient.refetchQueries({ queryKey: ['courses'] })
        })
        .then(() => {
          // Close the window and navigate
          setIsOpen(false)
          navigate(`/management/course/${data}`)
        })
        .catch((err) => {
          console.error('Error during token refresh or query invalidation:', err)
          return err
        })
    },
  })

  const onSubmit = (data: CourseAppearanceFormValues) => {
    const course: PostCourse = {
      name: coursePropertiesFormValues?.name || '',
      startDate: coursePropertiesFormValues?.dateRange?.from || new Date(),
      endDate: coursePropertiesFormValues?.dateRange?.to || new Date(),
      courseType: coursePropertiesFormValues?.courseType || '',
      ects: coursePropertiesFormValues?.ects || 0,
      semesterTag: coursePropertiesFormValues?.semesterTag || '',
      // eslint-disable-next-line prettier/prettier
      metaData: { icon: data.icon, 'bg-color': data.color },
    }

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
  }, [])

  // makes sure that window is first closed, before resetting the form
  useEffect(() => {
    if (!isOpen) {
      reset()
      setCoursePropertiesFormValues(null)
      setCurrentPage(1)
    }
  }, [isOpen, reset])

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
        {isPending ? (
          <DialogLoadingDisplay customMessage='Updating course data...' />
        ) : isError ? (
          <DialogErrorDisplay error={error} />
        ) : (
          <>
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
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
