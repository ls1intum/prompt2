import { useCourseStore } from '@tumaet/prompt-shared-state'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CalendarDays, GraduationCap, Clock, Calendar } from 'lucide-react'
import { CourseTypeDetails } from '@tumaet/prompt-shared-state'

export const CourseCards = (): JSX.Element => {
  const { courses } = useCourseStore()

  const formatDate = (dateString: string): string => {
    const [year, month, date] = dateString.split('-')
    return `${date}.${month}.${year}`
  }

  return (
    <div className='container mx-auto px-4 py-8 grid gap-8'>
      {courses.map((course) => {
        const bgColor = course.studentReadableData?.['bg-color'] || 'bg-gray-50'

        return (
          <Card key={course.id} className='shadow-lg'>
            <CardHeader className={`rounded-t-lg ${bgColor}`}>
              <div className='flex justify-between items-center'>
                <div>
                  <CardTitle className='text-3xl font-bold text-black'>{course.name}</CardTitle>
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
                      <p className='text-lg'>{course.semesterTag}</p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-3'>
                    <Calendar className='w-6 h-6' />
                    <div>
                      <p className='text-secondary-foreground'>Duration</p>
                      <p className='text-lg'>
                        {`${formatDate(course.startDate.toString())} - ${formatDate(course.endDate.toString())}`}
                      </p>
                    </div>
                  </div>
                </div>
                <div className='space-y-4'>
                  <div className='flex items-center space-x-3'>
                    <GraduationCap className='w-6 h-6' />
                    <div>
                      <p className='text-secondary-foreground'>Course Type</p>
                      <p className='text-lg'>{CourseTypeDetails[course.courseType].name}</p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-3'>
                    <Clock className='w-6 h-6' />
                    <div>
                      <p className='text-secondary-foreground'>ECTS</p>
                      <p className='text-lg'>{course.ects}</p>
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
