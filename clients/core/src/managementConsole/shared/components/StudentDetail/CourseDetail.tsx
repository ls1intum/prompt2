import { CourseAvatar } from '@core/managementConsole/layout/Sidebar/CourseSwitchSidebar/components/CourseAvatar'
import { CourseEnrollment } from '@core/network/queries/getStudentEnrollments'
import { PropsWithChildren } from 'react'
import { LinkHeading } from './LinkHeading'

export function formatDate(date: string | null): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('us-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

interface CourseDetailProps extends PropsWithChildren {
  studentCourseEnrollment: CourseEnrollment
}

export function CourseDetail({ children, studentCourseEnrollment }: CourseDetailProps) {
  return (
    <>
      <CourseAvatar
        bgColor={studentCourseEnrollment.studentReadableData['bg-color']}
        iconName={studentCourseEnrollment.studentReadableData['icon']}
      />
      <div>
        <div>
          <div className='flex items-baseline gap-1'>
            <LinkHeading targetURL={`/management/course/${studentCourseEnrollment.courseId}`}>
              <h3 className='font-semibold text-xl leading-tight'>
                {studentCourseEnrollment.name}
              </h3>
            </LinkHeading>
            <span className='text-sm text-muted-foreground'>
              {studentCourseEnrollment.semesterTag}
            </span>
          </div>

          <p className='text-sm text-muted-foreground'>
            <span className='capitalize'>{studentCourseEnrollment.courseType}</span> ·{' '}
            {studentCourseEnrollment.ects} ECTS
          </p>

          <p className='text-sm text-muted-foreground'>
            {formatDate(studentCourseEnrollment.startDate)} -{' '}
            {formatDate(studentCourseEnrollment.endDate)}
          </p>
        </div>
        <div className='mt-4'>{children}</div>
      </div>
    </>
  )
}
