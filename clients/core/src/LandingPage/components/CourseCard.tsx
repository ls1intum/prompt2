import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// todo fix this in the data model and import an actual course here!!
interface CourseCardProps {
  course: {
    id: number
    name: string
    type: string
    ects: number
    semester: string
  }
}

export const CourseCard = ({ course }: CourseCardProps): JSX.Element => (
  <Card key={course.id}>
    <CardHeader>
      <CardTitle>{course.name}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className='flex flex-col space-y-2 mb-4'>
        <div className='flex justify-between items-center'>
          <Badge variant={course.type === 'Seminar' ? 'secondary' : 'default'}>{course.type}</Badge>
          <span className='text-sm font-medium'>{course.ects} ECTS</span>
        </div>
        <p className='text-sm text-gray-600'>{course.semester}</p>
      </div>
      <Button className='w-full'>Apply Now</Button>
    </CardContent>
  </Card>
)
