import { getPermissionString, Role } from '@/interfaces/permission_roles'
import { useAuthStore } from '@/zustand/useAuthStore'
import { useCourseStore } from '@/zustand/useCourseStore'
import { useParams } from 'react-router-dom'
import CourseConfiguratorPage from '../CourseConfigurator/CourseConfigurator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const CourseOverview = (): JSX.Element => {
  const { courses } = useCourseStore()
  const { courseId } = useParams<{ courseId: string }>()
  const course = courses.find((c) => c.id === courseId)

  const { permissions } = useAuthStore()
  const requiredPermissions = [
    getPermissionString(Role.PROMPT_ADMIN, course?.name, course?.semester_tag),
    getPermissionString(Role.COURSE_LECTURER, course?.name, course?.semester_tag),
    getPermissionString(Role.COURSE_EDITOR, course?.name, course?.semester_tag),
  ]

  const canViewCourseConfig = permissions.some((permission) =>
    requiredPermissions.includes(permission),
  )

  if (!course) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='text-center text-red-600'>Course Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-center'>
              The requested course could not be found. Please check the course ID and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold'>{course.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='font-semibold'>Semester:</p>
              <p>{course.semester_tag}</p>
            </div>
            <div>
              <p className='font-semibold'>Course ID:</p>
              <p>{course.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {canViewCourseConfig ? (
        <>
          <h2 className='text-xl font-semibold mb-4'>Course Configuration</h2>
          <CourseConfiguratorPage />
        </>
      ) : (
        <Card>
          <CardContent className='text-center py-8'>
            <p className='text-gray-600'>
              You don&apos;t have permission to view the course configuration.
            </p>
          </CardContent>
        </Card>
      )}
    </>
  )
}
