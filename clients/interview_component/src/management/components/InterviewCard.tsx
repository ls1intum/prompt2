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
import { useUpdateCoursePhaseParticipation } from '../hooks/useUpdateCoursePhaseParticipation'
import type { InterviewQuestion } from '../interfaces/InterviewQuestion'
import type { InterviewAnswer } from '../interfaces/InterviewAnswer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const InterviewCard = (): JSX.Element => {
  const { studentId } = useParams<{ studentId: string }>()
  const { participations } = useParticipationStore()
  const participation = participations.find((p) => p.student.id === studentId)
  const { coursePhase } = useCoursePhaseStore()
  const interviewQuestions =
    (coursePhase?.meta_data?.interview_questions as InterviewQuestion[]) ?? []
  const [answers, setAnswers] = useState<InterviewAnswer[]>([])
  const [score, setScore] = useState<number | undefined>(undefined)
  const [interviewer, setInterviewer] = useState<string | undefined>(undefined)

  const { mutate, isPending: isLoading } = useUpdateCoursePhaseParticipation()
  const isModified =
    answers.some((a) => {
      const originalAnswer = participation?.meta_data?.interview_answers?.find(
        (oa) => oa.questionId === a.questionId,
      )
      return originalAnswer?.answer !== a.answer
    }) ||
    score !== participation?.meta_data?.interviewScore ||
    interviewer !== participation?.meta_data?.interviewer

  useEffect(() => {
    if (participation && coursePhase) {
      const interviewAnswers = participation.meta_data?.interview_answers as InterviewAnswer[]
      setAnswers(interviewAnswers ?? [])

      const interviewScore = participation.meta_data?.interviewScore as number | undefined
      setScore(interviewScore)

      const newInterviewer = participation.meta_data?.interviewer as string | undefined
      setInterviewer(newInterviewer)
    }
  }, [participation, coursePhase])

  const setAnswer = (questionId: number, answer: string) => {
    setAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers]
      const answerIndex = newAnswers.findIndex((a) => a.questionId === questionId)
      if (answerIndex === -1) {
        newAnswers.push({ questionId, answer })
      } else {
        newAnswers[answerIndex] = { questionId, answer }
      }
      return newAnswers
    })
  }

  const saveChanges = () => {
    if (participation && coursePhase) {
      mutate({
        id: participation.id,
        course_phase_id: coursePhase.id,
        course_participation_id: participation.course_participation_id,
        meta_data: {
          interview_answers: answers,
          interviewScore: score,
        },
      })
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
              <Button variant='outline' className='shrink-0' disabled={true}>
                <User className='h-4 w-4 mr-2' />
                Set as Self
              </Button>
            </div>
          </div>
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
              placeholder='Enter a interview score'
            />
          </div>
        </div>
        <Separator className='mt-3 mb-3' />
        <Label className='text-lg'>Interview Questions</Label>
        {interviewQuestions
          .sort((a, b) => a.order_num - b.order_num)
          .map((question, index) => (
            <div key={question.id}>
              <Label>{question.question}</Label>
              <TooltipProvider>
                <MinimalTiptapEditor
                  value={answers.find((a) => a.questionId === question.id)?.answer ?? ''}
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
            onClick={saveChanges}
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
