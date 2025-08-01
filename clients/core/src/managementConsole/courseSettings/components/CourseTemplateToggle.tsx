import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Alert,
  AlertDescription,
} from '@tumaet/prompt-ui-components'
import { Loader2, AlertCircle, LayoutTemplateIcon as Template } from 'lucide-react'
import { useCourseTemplate } from '../hooks/useCourseTemplate'
import { useState } from 'react'
import { CopyCourseDialog } from '../../../managementConsole/courseOverview/components/CopyCourseDialog'

interface CourseTemplateToggleProps {
  courseId: string
}

export const CourseTemplateToggle = ({ courseId }: CourseTemplateToggleProps) => {
  const { templateStatus, isLoading, isUpdating, error } = useCourseTemplate(courseId)

  const isTemplate = templateStatus?.isTemplate || false

  const [isDialogOpen, setDialogOpen] = useState(false)

  const handleDialogOpen = async () => {
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
  }

  if (isLoading) {
    return (
      <Card className='border-l-4 border-l-blue-500 dark:border-l-blue-400 dark:bg-gray-800/50'>
        <CardHeader className='pb-4'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg'>
              <Template className='h-5 w-5 text-blue-600 dark:text-blue-400' />
            </div>
            <div>
              <CardTitle className='text-lg text-gray-900 dark:text-gray-100'>
                Template Settings
              </CardTitle>
              <CardDescription className='mt-1 text-gray-600 dark:text-gray-400'>
                Configure whether this course is available as a template
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center py-8'>
            <div className='flex flex-col items-center gap-3'>
              <Loader2 className='h-8 w-8 animate-spin text-blue-600 dark:text-blue-400' />
              <span className='text-sm text-muted-foreground dark:text-gray-400'>
                Loading template status...
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card
        className={`border-l-4 transition-all duration-200 dark:bg-gray-800/50 ${
          isTemplate
            ? 'border-l-green-500 dark:border-l-green-400 bg-green-50/30 dark:bg-green-900/10'
            : 'border-l-gray-300 dark:border-l-gray-600'
        }`}
      >
        <CardHeader className='pb-4'>
          <div className='flex items-center gap-3'>
            <div
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isTemplate ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              <Template
                className={`h-5 w-5 transition-colors duration-200 ${
                  isTemplate
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              />
            </div>
            <div>
              <CardTitle className='text-lg text-gray-900 dark:text-gray-100'>
                Template Settings
              </CardTitle>
              <CardDescription className='mt-1 text-gray-600 dark:text-gray-400'>
                Configure whether this course is available as a template for creating new courses
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          {error && (
            <Alert
              variant='destructive'
              className='border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
            >
              <AlertCircle className='h-4 w-4 text-red-600 dark:text-red-400' />
              <AlertDescription className='ml-2 text-red-800 dark:text-red-200'>
                {error}
              </AlertDescription>
            </Alert>
          )}
          <div>
            <Button
              onClick={handleDialogOpen}
              disabled={isUpdating}
              className={`
              w-full
              ${isUpdating ? 'opacity-70 cursor-not-allowed' : ''}
            `}
            >
              {isUpdating ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  <span>Updating...</span>
                </>
              ) : (
                <span>
                  {isTemplate ? 'Remove from Templates' : 'Make a Template out of this Course'}
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <CopyCourseDialog courseId={courseId} isOpen={isDialogOpen} onClose={handleDialogClose} />
    </>
  )
}
