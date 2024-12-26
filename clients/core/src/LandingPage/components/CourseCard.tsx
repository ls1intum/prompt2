import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { DeadlineInfo } from './DeadlineInfo'
import { Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { OpenApplication } from '@/interfaces/open_application'
import { CourseTypeDetails } from '@/interfaces/course_type'
import { useNavigate } from 'react-router-dom'

// todo fix this in the data model and import an actual course here!!
interface CourseCardProps {
  courseDetails: OpenApplication
}

export const CourseCard = ({ courseDetails }: CourseCardProps): JSX.Element => {
  const navigate = useNavigate()
  return (
    <Card key={courseDetails.id}>
      <CardHeader>
        <CardTitle>{courseDetails.courseName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col space-y-2 mb-4'>
          <div className='flex justify-between items-center'>
            <Badge variant={'secondary'}>{CourseTypeDetails[courseDetails.courseType].name}</Badge>
            <span className='text-sm font-medium'>{courseDetails.ects} ECTS</span>
          </div>
          <div className='text-sm text-gray-600 space-y-1'>
            <div className='flex items-center space-x-2'>
              <Calendar className='h-4 w-4 flex-shrink-0' />
              <p>
                {format(courseDetails.startDate, 'MMM d, yyyy')} -{' '}
                {format(courseDetails.endDate, 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <DeadlineInfo deadline={courseDetails.applicationDeadline} />
        </div>
        <Button
          variant='secondary'
          className='w-full'
          onClick={() => navigate(`/apply/${courseDetails.id}`)}
        >
          Apply Now
        </Button>
      </CardContent>
    </Card>
  )
}
