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
import { Loader2, AlertCircle } from 'lucide-react'
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
      <Card>
        <CardHeader>
          <CardTitle>Template Settings</CardTitle>
          <CardDescription>
            Configure whether this course is available as a template
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center space-x-2'>
            <Loader2 className='h-4 w-4 animate-spin' />
            <span className='text-sm text-muted-foreground'>Loading template status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Template Settings</CardTitle>
        <CardDescription>
          Configure whether this course is available as a template for creating new courses
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {error && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className='flex items-center space-x-2'>
          <Switch
            id='template-toggle'
            checked={templateStatus?.isTemplate || false}
            onCheckedChange={handleToggle}
            disabled={isUpdating}
          />
          <Label htmlFor='template-toggle' className='flex items-center space-x-2'>
            <span>Mark as template</span>
            {isUpdating && <Loader2 className='h-3 w-3 animate-spin' />}
          </Label>
        </div>

        <div className='text-sm text-muted-foreground'>
          {templateStatus?.isTemplate
            ? 'This course is currently available as a template for creating new courses.'
            : 'This course is not available as a template.'}
        </div>
      </CardContent>
    </Card>
  )
}
