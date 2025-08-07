import { useCourseStore } from '@tumaet/prompt-shared-state'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@tumaet/prompt-ui-components'
import { CalendarDays, GraduationCap, Clock, Calendar, ChevronRight } from 'lucide-react'
import { CourseTypeDetails } from '@tumaet/prompt-shared-state'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import DynamicIcon from '@/components/DynamicIcon'

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
          : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start justify-start'
      }`}
    >
      {courses.map((course) => {
        const bgColor = course.studentReadableData?.['bg-color'] || 'bg-gray-50'

        return (
          <motion.div
            key={course.id}
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card
              className={
                'overflow-hidden border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer ' +
                'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none h-full flex flex-col'
              }
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
              <CardHeader className={`rounded-t-lg ${bgColor} py-6 px-6 border-b`}>
                <div className='flex items-center gap-4'>
                  <div className='size-6'>
                    <DynamicIcon
                      name={course.studentReadableData?.['icon'] || 'graduation-cap'}
                      color='black'
                    />
                  </div>
                  <CardTitle className='text-2xl font-bold text-gray-900 leading-tight'>
                    {course.name}
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className='p-6 flex-grow'>
                <div className='space-y-5'>
                  <div className='flex items-center gap-3'>
                    <div className='bg-gray-100 p-2 rounded-full'>
                      <CalendarDays className='w-5 h-5 text-gray-700' />
                    </div>
                    <div>
                      <p className='text-sm font-medium text-gray-500'>Semester</p>
                      <p className='text-base font-semibold'>{course.semesterTag}</p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <div className='bg-gray-100 p-2 rounded-full'>
                      <Calendar className='w-5 h-5 text-gray-700' />
                    </div>
                    <div>
                      <p className='text-sm font-medium text-gray-500'>Duration</p>
                      <p className='text-base font-semibold'>
                        {course.startDate && course.endDate
                          ? `${formatDate(course.startDate.toString())} - ${formatDate(course.endDate.toString())}`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <div className='bg-gray-100 p-2 rounded-full'>
                      <GraduationCap className='w-5 h-5 text-gray-700' />
                    </div>
                    <div>
                      <p className='text-sm font-medium text-gray-500'>Course Type</p>
                      <p className='text-base font-semibold'>
                        {CourseTypeDetails[course.courseType].name}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <div className='bg-gray-100 p-2 rounded-full'>
                      <Clock className='w-5 h-5 text-gray-700' />
                    </div>
                    <div>
                      <p className='text-sm font-medium text-gray-500'>ECTS</p>
                      <p className='text-base font-semibold'>{course.ects}</p>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className='px-6 py-4 border-t flex justify-end'>
                <div className='text-sm font-medium text-primary flex items-center'>
                  Go to course <ChevronRight className='ml-1 h-4 w-4' />
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
