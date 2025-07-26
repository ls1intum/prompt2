import {
  Alert,
  AlertDescription,
  Switch,
  Label,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@tumaet/prompt-ui-components'
import {
  Loader2,
  AlertCircle,
  LayoutTemplateIcon as Template,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { useCourseTemplate } from '../hooks/useCourseTemplate'

interface CourseTemplateToggleProps {
  courseId: string
}

export const CourseTemplateToggle = ({ courseId }: CourseTemplateToggleProps) => {
  const { templateStatus, isLoading, isUpdating, error, updateTemplateStatus } =
    useCourseTemplate(courseId)

  const handleToggle = async (checked: boolean) => {
    await updateTemplateStatus(checked)
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

  const isTemplate = templateStatus?.isTemplate || false

  return (
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

        {/* Toggle Section */}
        <div className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center gap-3'>
            <Switch
              id='template-toggle'
              checked={isTemplate}
              onCheckedChange={handleToggle}
              disabled={isUpdating}
              className={[
                'data-[state=checked]:bg-green-600',
                'dark:data-[state=checked]:bg-green-500',
                'data-[state=unchecked]:bg-gray-300',
                'dark:data-[state=unchecked]:bg-gray-600',
                'dark:data-[state=unchecked]:border-gray-500',
              ].join(' ')}
            />
            <Label
              htmlFor='template-toggle'
              className='flex items-center gap-2 font-medium cursor-pointer text-gray-900 dark:text-gray-100'
            >
              <span>Mark as template</span>
              {isUpdating && (
                <Loader2 className='h-4 w-4 animate-spin text-blue-600 dark:text-blue-400' />
              )}
            </Label>
          </div>

          {/* Status Indicator */}
          <div className='flex items-center gap-2'>
            {isTemplate ? (
              <div
                className={[
                  'flex items-center gap-2',
                  'text-green-700 dark:text-green-300',
                  'bg-green-100 dark:bg-green-900/30',
                  'px-3 py-1 rounded-full text-sm font-medium',
                  'border border-green-200 dark:border-green-800',
                ].join(' ')}
              >
                <CheckCircle2 className='h-4 w-4' />
                <span>Active Template</span>
              </div>
            ) : (
              <div
                className={[
                  'flex items-center gap-2',
                  'text-gray-600 dark:text-gray-400',
                  'bg-gray-100 dark:bg-gray-700',
                  'px-3 py-1 rounded-full text-sm font-medium',
                  'border border-gray-200 dark:border-gray-600',
                ].join(' ')}
              >
                <XCircle className='h-4 w-4' />
                <span>Not a Template</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Description */}
        <div
          className={`p-4 rounded-lg border-l-4 transition-colors duration-200 ${
            isTemplate
              ? 'bg-green-50 dark:bg-green-900/20 border-l-green-400 dark:border-l-green-500 text-green-800 dark:text-green-200'
              : 'bg-blue-50 dark:bg-blue-900/20 border-l-blue-400 dark:border-l-blue-500 text-blue-800 dark:text-blue-200'
          }`}
        >
          <div className='flex items-start gap-3'>
            {isTemplate ? (
              <CheckCircle2 className='h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0' />
            ) : (
              <Template className='h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0' />
            )}
            <div>
              <p className='font-medium text-sm'>
                {isTemplate ? 'Template Status: Active' : 'Template Status: Inactive'}
              </p>
              <p className='text-sm mt-1 opacity-90'>
                {isTemplate
                  ? 'This course is currently available as a template for creating new courses. ' +
                    'Other users can use this course structure to create their own courses.'
                  : 'This course is not available as a template. Enable this option to allow other users to create new courses based on this course structure.'}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className='p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg border border-gray-100 dark:border-gray-700'>
          <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
            <Template className='h-3 w-3' />
            <span>
              {isTemplate
                ? 'Template courses help maintain consistency across your organization'
                : 'Templates can be created from any published course'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
