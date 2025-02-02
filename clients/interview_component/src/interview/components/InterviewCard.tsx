import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { MessageSquare, Save, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { TooltipProvider } from '@/components/ui/tooltip'
import { MinimalTiptapEditor } from '@/components/minimal-tiptap/minimal-tiptap'
import { useCoursePhaseStore } from '../zustand/useCoursePhaseStore'
import { useParticipationStore } from '../zustand/useParticipationStore'
import { useUpdateCoursePhaseParticipation } from '@/hooks/useUpdateCoursePhaseParticipation'
import type { InterviewQuestion } from '../interfaces/InterviewQuestion'
import type { InterviewAnswer } from '../interfaces/InterviewAnswer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PassStatus, useAuthStore } from '@tumaet/prompt-shared-state'

export const InterviewCard = (): JSX.Element => {
  const { studentId } = useParams<{ studentId: string }>()
  const { participations } = useParticipationStore()
  const participation = participations.find((p) => p.student.id === studentId)

  const { user } = useAuthStore()

  const { coursePhase } = useCoursePhaseStore()
  const interviewQuestions =
    (coursePhase?.restrictedData?.interviewQuestions as InterviewQuestion[]) ?? []

  const [answers, setAnswers] = useState<InterviewAnswer[]>([])
  const [score, setScore] = useState<number | undefined>(undefined)
  const [interviewer, setInterviewer] = useState<string | undefined>(undefined)

  const { mutate, isPending: isLoading } = useUpdateCoursePhaseParticipation()
  const isModified =
    answers.some((a) => {
      const originalAnswer = participation?.restrictedData?.interviewAnswers?.find(
        (oa: InterviewAnswer) => oa.questionID === a.questionID,
      )
      return originalAnswer?.answer !== a.answer
    }) ||
    score !== participation?.restrictedData?.interviewScore ||
    interviewer !== participation?.restrictedData?.interviewer

  useEffect(() => {
    if (participation && coursePhase) {
      const interviewAnswers = participation.restrictedData?.interviewAnswers as InterviewAnswer[]
      setAnswers(interviewAnswers ?? [])

      const interviewScore = participation.restrictedData?.interviewScore as number | undefined
      setScore(interviewScore)

      const newInterviewer = participation.restrictedData?.interviewer as string | undefined
      setInterviewer(newInterviewer)
    }
  }, [participation, coursePhase])

  const setAnswer = (questionID: number, answer: string) => {
    setAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers]
      const answerIndex = newAnswers.findIndex((a) => a.questionID === questionID)
      if (answerIndex === -1) {
        newAnswers.push({ questionID, answer })
      } else {
        newAnswers[answerIndex] = { questionID, answer }
      }
      return newAnswers
    })
  }

  const saveChanges = (passStatus?: PassStatus) => {
    if (participation && coursePhase) {
      mutate({
        id: participation.id,
        coursePhaseID: coursePhase.id,
        courseParticipationID: participation.courseParticipationID,
        restrictedData: {
          interviewAnswers: answers,
          interviewScore: score,
        },
        studentReadableData: {},
        passStatus: passStatus ?? participation.passStatus,
      })
    }
  }

  const setInterviewerAsSelf = () => {
    if (user) {
      setInterviewer(user.firstName + ' ' + user.lastName)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center'>
          <MessageSquare className='h-5 w-5 mr-2' />
          Interview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex flex-row space-x-4 mb-4 justify-between'>
          <div className='space-y-2'>
            <Label htmlFor='score'>Interview Score</Label>
            <Input
              id='score'
              className='w-48'
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              type='number'
              min='0'
              max='100'
              placeholder='Enter an interview score'
            />
          </div>
          <div className='col-span-2 space-y-2'>
            <Label>Resolution</Label>
            <div className='space-x-2'>
              <Button
                variant='outline'
                disabled={participation?.passStatus === PassStatus.FAILED}
                className='border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600'
                onClick={() => saveChanges(PassStatus.FAILED)}
              >
                Reject
              </Button>
              <Button
                variant='default'
                disabled={participation?.passStatus === PassStatus.PASSED}
                className='bg-green-500 hover:bg-green-600 text-white'
                onClick={() => saveChanges(PassStatus.PASSED)}
              >
                Accept
              </Button>
            </div>
          </div>
        </div>
        <div className='space-y-2'>
          <div className='space-y-2'>
            <Label htmlFor='interviewer'>Interviewer</Label>
            <div className='flex space-x-2'>
              <Input
                id='interviewer'
                value={interviewer}
                onChange={(e) => setInterviewer(e.target.value)}
                placeholder='Enter interviewer name'
              />
              <Button
                variant='outline'
                className='shrink-0'
                disabled={user === undefined}
                onClick={setInterviewerAsSelf}
              >
                <User className='h-4 w-4 mr-2' />
                Set as Self
              </Button>
            </div>
          </div>
        </div>
        {interviewQuestions.length > 0 && (
          <>
            <Separator className='mt-3 mb-3' />
            <Label className='text-lg'>Interview Questions</Label>
          </>
        )}
        {interviewQuestions
          .sort((a, b) => a.orderNum - b.orderNum)
          .map((question, index) => (
            <div key={question.id}>
              <Label>{question.question}</Label>
              <TooltipProvider>
                <MinimalTiptapEditor
                  value={answers.find((a) => a.questionID === question.id)?.answer ?? ''}
                  onChange={(value) => {
                    setAnswer(question.id, value as string)
                  }}
                  className='w-full'
                  editorContentClassName='p-3'
                  output='html'
                  placeholder='Type your answer here...'
                  editable={true}
                  editorClassName='focus:outline-none'
                />
              </TooltipProvider>
              {index < interviewQuestions.length - 1 && <Separator className='mt-3 mb-3' />}
            </div>
          ))}

        <div className='mt-6 flex justify-end'>
          <Button
            onClick={() => saveChanges()}
            disabled={isLoading || !isModified}
            className='flex items-center'
          >
            <Save className='h-4 w-4 mr-2' />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
