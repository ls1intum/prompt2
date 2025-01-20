import { useNavigate, useParams } from 'react-router-dom'
import { useParticipationStore } from './zustand/useParticipationStore'
import { Button } from '@/components/ui/button'
import { ChevronLeft, FileUserIcon } from 'lucide-react'
import { StudentCard } from './components/StudentCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExportedApplicationAnswer } from '@/interfaces/export_application_answer'
import { ExportedApplicationAnswerTable } from '@/components/ExportedApplicationAnswerTable'
import { InterviewCard } from './components/InterviewCard'

export const ProfileDetailPage = (): JSX.Element => {
  const { studentId } = useParams<{ studentId: string }>()
  const { participations } = useParticipationStore()
  const participation = participations.find((p) => p.student.id === studentId)
  const navigate = useNavigate()

  const applicationAnswers =
    (participation?.prev_meta_data?.applicationAnswers as ExportedApplicationAnswer[]) ?? []

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
                {applicationAnswers.length === 0 ? (
                  <div>
                    No Application Exported - Please check your export Settings in Application
                    Configuration
                  </div>
                ) : (
                  <ExportedApplicationAnswerTable applicationAnswers={applicationAnswers} />
                )}
              </CardContent>
            </Card>
            <InterviewCard />
          </div>
        </>
      )}
    </div>
  )
}
