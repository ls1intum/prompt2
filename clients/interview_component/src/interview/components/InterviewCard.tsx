import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { MessageSquare, User } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Separator,
  TooltipProvider,
  MinimalTiptapEditor,
  Input,
  Label,
} from '@tumaet/prompt-ui-components'
import { useCoursePhaseStore } from '../zustand/useCoursePhaseStore'
import { useParticipationStore } from '../zustand/useParticipationStore'
import type { InterviewQuestion } from '../interfaces/InterviewQuestion'
import type { InterviewAnswer } from '../interfaces/InterviewAnswer'
import { PassStatus, useAuthStore } from '@tumaet/prompt-shared-state'
import { useUpdateCoursePhaseParticipation } from '@/hooks/useUpdateCoursePhaseParticipation'

export const InterviewCard = (): JSX.Element => {
  const { studentId } = useParams<{ studentId: string }>()
  const { participations } = useParticipationStore()
  const participation = participations.find((p) => p.student.id === studentId)

  const { user } = useAuthStore()
  const { coursePhase } = useCoursePhaseStore()
  const interviewQuestions =
    (coursePhase?.restrictedData?.interviewQuestions as InterviewQuestion[]) ?? []

  const [answers, setAnswers] = useState<InterviewAnswer[]>(
    (participation?.restrictedData?.interviewAnswers as InterviewAnswer[]) ?? [],
  )
  const [score, setScore] = useState<number | undefined>(undefined)
  const [interviewer, setInterviewer] = useState<string | undefined>(
    participation?.restrictedData?.interviewer,
  )

  const { mutate } = useUpdateCoursePhaseParticipation()

  // Compare current state with original data
  const isModified =
    answers.some((a) => {
      const originalAnswer = participation?.restrictedData?.interviewAnswers?.find(
        (oa: InterviewAnswer) => oa.questionID === a.questionID,
      )
      return originalAnswer?.answer !== a.answer
    }) ||
    score !== participation?.restrictedData?.score ||
    interviewer !== participation?.restrictedData?.interviewer

  useEffect(() => {
    if (participation && coursePhase) {
      const interviewAnswers = participation.restrictedData?.interviewAnswers as InterviewAnswer[]
      setAnswers(interviewAnswers ?? [])

      const interviewScore = participation.restrictedData?.score as number | undefined
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
        coursePhaseID: coursePhase.id,
        courseParticipationID: participation.courseParticipationID,
        restrictedData: {
          interviewAnswers: answers,
          score: score,
          interviewer: interviewer,
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

  // When an input loses focus, save changes if any modifications exist.
  const handleBlur = () => {
    if (isModified) {
      saveChanges()
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
              onBlur={handleBlur}
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
                onBlur={handleBlur}
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
                  // Auto-save on blur
                  onBlur={handleBlur}
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
        {/* The manual save button has been removed */}
      </CardContent>
    </Card>
  )
}
