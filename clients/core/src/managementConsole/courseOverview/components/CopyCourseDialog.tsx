import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  useToast,
  DatePickerWithRange,
  FormDescription,
  Alert,
  AlertDescription,
  AlertTitle,
} from '@tumaet/prompt-ui-components'
import { AlertTriangle, Info } from 'lucide-react'
import { useCourseStore } from '@tumaet/prompt-shared-state'
import { type CopyCourseFormValues, copyCourseSchema } from '@core/validations/copyCourse'
import { copyCourse } from '@core/network/mutations/copyCourse'
import { checkCourseCopyable } from '@core/network/mutations/checkCourseCopyable'
import { useNavigate } from 'react-router-dom'
import type { CopyCourse } from '../interfaces/copyCourse'

interface CourseCopyDialogProps {
  courseId: string
  isOpen: boolean
  onClose: () => void
}

type DialogStep = 'form' | 'warning' | 'loading'

export const CopyCourseDialog = ({
  courseId,
  isOpen,
  onClose,
}: CourseCopyDialogProps): JSX.Element => {
  const { courses } = useCourseStore()
  const course = courses.find((c) => c.id === courseId)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<DialogStep>('form')
  const [formData, setFormData] = useState<CopyCourseFormValues | null>(null)

  const form = useForm<CopyCourseFormValues>({
    resolver: zodResolver(copyCourseSchema),
    defaultValues: {
      name: course?.name,
      semesterTag: '',
      dateRange: {
        from: undefined,
        to: undefined,
      },
    },
  })

  // Query to check if course is copyable
  const {
    data: copyabilityData,
    isLoading: isCheckingCopyability,
    error: copyabilityError,
  } = useQuery({
    queryKey: ['course-copyability', courseId],
    queryFn: () => checkCourseCopyable(courseId),
    enabled: currentStep === 'warning' && !!courseId,
  })

  const { mutate: mutateCopyCourse, isPending: isCopying } = useMutation({
    mutationFn: (courseData: CopyCourse) => {
      return copyCourse(courseId ?? '', courseData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      toast({
        title: 'Successfully Copied Course',
      })
      navigate('/management/general')
      handleClose()
    },
    onError: () => {
      toast({
        title: 'Failed to Copy Course',
        description: 'Please try again later!',
        variant: 'destructive',
      })
      setCurrentStep('form')
    },
  })

  const handleClose = () => {
    setCurrentStep('form')
    setFormData(null)
    form.reset()
    onClose()
  }

  const onFormSubmit = (data: CopyCourseFormValues) => {
    setFormData(data)
    setCurrentStep('warning')
  }

  const handleProceedWithCopy = () => {
    if (!formData) return

    const copyData: CopyCourse = {
      name: formData.name,
      semesterTag: formData.semesterTag,
      startDate: formData.dateRange.from,
      endDate: formData.dateRange.to,
    }

    mutateCopyCourse(copyData)
  }

  const handleBackToForm = () => {
    setCurrentStep('form')
  }

  const renderFormStep = () => (
    <>
      <DialogHeader>
        <DialogTitle>Copy {course?.name}</DialogTitle>
        <DialogDescription>
          Create a copy of this course with a new name and semester tag.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit)} className='space-y-6'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Name</FormLabel>
                <FormControl>
                  <Input placeholder='Enter course name' {...field} className='w-full' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='semesterTag'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Semester Tag</FormLabel>
                <FormControl>
                  <Input placeholder='Enter semester tag' {...field} className='w-full' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='dateRange'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Duration</FormLabel>
                <DatePickerWithRange
                  date={field.value}
                  setDate={field.onChange}
                  className='w-full'
                />
                <FormDescription>Select the start and end dates for your course.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type='button' variant='outline' onClick={handleClose}>
              Cancel
            </Button>
            <Button type='submit'>Continue</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  )

  const renderWarningStep = () => {
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
            <Button variant='outline' onClick={handleBackToForm}>
              Back
            </Button>
            <Button onClick={() => setCurrentStep('warning')}>Retry</Button>
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
              All phases and their configurations will be copied automatically
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant='outline' onClick={handleBackToForm}>
              Back
            </Button>
            <Button onClick={handleProceedWithCopy} disabled={isCopying}>
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
            Some phases of this course cannot be fully copied. Please review the details below
            before continuing.
          </DialogDescription>
        </DialogHeader>
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertTitle>Missing Configuration Support</AlertTitle>
          <AlertDescription>
            The following phases do not support automatic copying of their configurations:
            {missingPhaseTypes.map((phaseType, index) => (
              <li key={index}>{phaseType}</li>
            ))}
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
          <Button variant='outline' onClick={handleBackToForm}>
            Back
          </Button>
          <Button onClick={handleProceedWithCopy} disabled={isCopying}>
            {isCopying ? 'Copying...' : 'Proceed Anyway'}
          </Button>
        </DialogFooter>
      </>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} aria-hidden='true'>
      <DialogContent className='max-w-md'>
        {currentStep === 'form' && renderFormStep()}
        {currentStep === 'warning' && renderWarningStep()}
      </DialogContent>
    </Dialog>
  )
}
