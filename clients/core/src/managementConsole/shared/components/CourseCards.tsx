import { useCourseStore } from '@tumaet/prompt-shared-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, GraduationCap, Clock, Calendar } from 'lucide-react'
import { CourseTypeDetails } from '@tumaet/prompt-shared-state'
import { useNavigate } from 'react-router-dom'

export const CourseCards = (): JSX.Element => {
  const { courses } = useCourseStore()
  const navigate = useNavigate()

  const handleCourseClick = (courseId: string) => {
    navigate(`/management/course/${courseId}`)
  }

  const formatDate = (dateString: string): string => {
    const [year, month, date] = dateString.split('-')
    return `${date}.${month}.${year}`
  }

  return (
    <div
      className={`container mx-auto px-4 py-8 ${
        courses.length === 1
          ? 'max-w-md mx-auto' // Center a single card with appropriate max width
          : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'
      }`}
    >
      {courses.map((course) => {
        const bgColor = course.studentReadableData?.['bg-color'] || 'bg-gray-50'

        return (
          <Card
            key={course.id}
            className='shadow-lg hover:shadow-2xl transition-shadow cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
            onClick={() => handleCourseClick(course.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleCourseClick(course.id)
              }
            }}
            tabIndex={0}
            role='button'
            aria-label={`View details for course: ${course.name}`}
          >
            <CardHeader className={`rounded-t-lg ${bgColor}`}>
              <div className='flex justify-between items-center'>
                <div>
                  <CardTitle className='text-2xl font-bold text-black'>{course.name}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className='p-6'>
              <div className='grid grid-cols-1 gap-4'>
                <div className='space-y-4'>
                  <div className='flex items-center space-x-3'>
                    <CalendarDays className='w-5 h-5' />
                    <div>
                      <p className='text-secondary-foreground'>Semester</p>
                      <p className='text-base'>{course.semesterTag}</p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-3'>
                    <Calendar className='w-5 h-5' />
                    <div>
                      <p className='text-secondary-foreground'>Duration</p>
                      <p className='text-base'>
                        {`${formatDate(course.startDate.toString())} - ${formatDate(course.endDate.toString())}`}
                      </p>
                    </div>
                  </div>
                </div>
                <div className='space-y-4'>
                  <div className='flex items-center space-x-3'>
                    <GraduationCap className='w-5 h-5' />
                    <div>
                      <p className='text-secondary-foreground'>Course Type</p>
                      <p className='text-base'>{CourseTypeDetails[course.courseType].name}</p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-3'>
                    <Clock className='w-5 h-5' />
                    <div>
                      <p className='text-secondary-foreground'>ECTS</p>
                      <p className='text-base'>{course.ects}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
