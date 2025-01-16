import { useCourseStore } from '@/zustand/useCourseStore'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CalendarDays, GraduationCap, Clock, Calendar } from 'lucide-react'
import { CourseTypeDetails } from '@/interfaces/course_type'

export const CourseOverview = (): JSX.Element => {
  const { courses } = useCourseStore()
  const { courseId } = useParams<{ courseId: string }>()
  const course = courses.find((c) => c.id === courseId)

  const formatDate = (dateString: string): string => {
    const [year, month, date] = dateString.split('-')
    return `${date}.${month}.${year}`
  }

  if (!course) {
    return (
      <div className='flex items-center justify-center h-screen bg-gray-50'>
        <Card className='w-full max-w-md shadow-lg'>
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
    <div className='container mx-auto px-4 py-8 max-w-6xl'>
      <Card className='mb-8 shadow-lg'>
        <CardHeader className='rounded-t-lg'>
          <div className='flex justify-between items-center'>
            <div>
              <CardTitle className='text-3xl font-bold'>{course.name}</CardTitle>
              <CardDescription className='mt-2'>Instructor Dashboard</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='p-6'>
          <div className='grid md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <div className='flex items-center space-x-3'>
                <CalendarDays className='w-6 h-6' />
                <div>
                  <p className='text-secondary-foreground'>Semester</p>
                  <p className='text-lg'>{course.semester_tag}</p>
                </div>
              </div>
              <div className='flex items-center space-x-3'>
                <Clock className='w-6 h-6 ' />
                <div>
                  <p className='text-secondary-foreground'>ECTS</p>
                  <p className='text-lg'>{course.ects}</p>
                </div>
              </div>
            </div>
            <div className='space-y-4'>
              <div className='flex items-center space-x-3'>
                <Calendar className='w-6 h-6' />
                <div>
                  <p className='text-secondary-foreground'>Duration</p>
                  <p className='text-lg'>
                    {`${formatDate(course.start_date.toString())} - ${formatDate(course.end_date.toString())}`}
                  </p>
                </div>
              </div>
              <div className='flex items-center space-x-3'>
                <GraduationCap className='w-6 h-6' />
                <div>
                  <p className='text-secondary-foreground'>Course Type</p>
                  <p className='text-lg'>{CourseTypeDetails[course.course_type].name}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
