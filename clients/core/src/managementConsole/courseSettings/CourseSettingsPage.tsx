import { useParams } from 'react-router-dom'
import { ManagementPageHeader } from '@tumaet/prompt-ui-components'
import { CourseTemplateToggle } from './components/CourseTemplateToggle'

export const CourseSettingsPage = (): JSX.Element => {
  const { courseId } = useParams<{ courseId: string }>()

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between mb-4'>
        <ManagementPageHeader>Course Settings</ManagementPageHeader>
      </div>

      {courseId && <CourseTemplateToggle courseId={courseId} />}
    </div>
  )
}
