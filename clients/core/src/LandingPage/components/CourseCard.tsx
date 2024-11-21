import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { DeadlineInfo } from './DeadlineInfo'
import { Course } from 'src/interfaces/open_course_applications'
import { Calendar } from 'lucide-react'
import { format } from 'date-fns'

// todo fix this in the data model and import an actual course here!!
interface CourseCardProps {
  course: Course
}

export const CourseCard = ({ course }: CourseCardProps): JSX.Element => (
  <Card key={course.id}>
    <CardHeader>
      <CardTitle>{course.name}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className='flex flex-col space-y-2 mb-4'>
        <div className='flex justify-between items-center'>
          <Badge variant={'secondary'}>Practical Course</Badge>
          <span className='text-sm font-medium'>10 ECTS</span>
        </div>
        <div className='text-sm text-gray-600 space-y-1'>
          <div className='flex items-center space-x-2'>
            <Calendar className='h-4 w-4 flex-shrink-0' />
            <p>
              {format(course.start_date, 'MMM d, yyyy')} - {format(course.end_date, 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        <DeadlineInfo deadline={course.start_date} />
      </div>
      <Button variant='secondary' className='w-full'>
        Apply Now
      </Button>
    </CardContent>
  </Card>
)
