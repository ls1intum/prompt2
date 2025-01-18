import { useNavigate, useParams } from 'react-router-dom'
import { useParticipationStore } from './zustand/useParticipationStore'
import { Button } from '@/components/ui/button'
import { ChevronLeft, FileUserIcon, MessageSquare } from 'lucide-react'
import { StudentCard } from './components/StudentCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const ProfileDetailPage = (): JSX.Element => {
  const { studentId } = useParams<{ studentId: string }>()
  const { participations } = useParticipationStore()
  const participation = participations.find((p) => p.student.id === studentId)
  const navigate = useNavigate()

  return (
    <div className=''>
      <div className='relative pb-4'>
        <Button
          onClick={() => navigate(-1)}
          variant='ghost'
          size='sm'
          className='absolute top-0 left-0'
        >
          <ChevronLeft className='h-4 w-4' />
          <span>Back</span>
        </Button>
        {!participation && (
          <div className='flex justify-center items-center h-64'>
            <p className='text-lg text-muted-foreground'>Participant not found</p>
          </div>
        )}
      </div>
      {participation && (
        <>
          <div className='pt-6 mb-8'>
            <StudentCard participation={participation} />
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <FileUserIcon className='h-5 w-5 mr-2' />
                  Application
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className='space-y-2'>
                  <div>
                    <dt className='text-sm font-medium text-muted-foreground'>Status</dt>
                    <dd className='text-sm font-semibold'>Submitted</dd>
                  </div>
                  <div>
                    <dt className='text-sm font-medium text-muted-foreground'>Date Submitted</dt>
                    <dd className='text-sm font-semibold'>June 15, 2023</dd>
                  </div>
                  <div>
                    <dt className='text-sm font-medium text-muted-foreground'>Course</dt>
                    <dd className='text-sm font-semibold'>Web Development Bootcamp</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <MessageSquare className='h-5 w-5 mr-2' />
                  Interview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className='space-y-2'>
                  <div>
                    <dt className='text-sm font-medium text-muted-foreground'>Status</dt>
                    <dd className='text-sm font-semibold'>Scheduled</dd>
                  </div>
                  <div>
                    <dt className='text-sm font-medium text-muted-foreground'>Date</dt>
                    <dd className='text-sm font-semibold'>June 22, 2023</dd>
                  </div>
                  <div>
                    <dt className='text-sm font-medium text-muted-foreground'>Interviewer</dt>
                    <dd className='text-sm font-semibold'>John Doe</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
