import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InterviewQuestion } from '../interfaces/InterviewQuestion'
import { useCoursePhaseStore } from '../zustand/useCoursePhaseStore'
import { MessageSquare } from 'lucide-react'
import { MinimalTiptapEditor } from '@/components/minimal-tiptap/minimal-tiptap'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useParams } from 'react-router-dom'
import { useParticipationStore } from '../zustand/useParticipationStore'
import { InterviewAnswer } from '../interfaces/InterviewAnswer'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useUpdateCoursePhaseParticipation } from '../hooks/useUpdateCoursePhaseParticipation'

export const InterviewCard = (): JSX.Element => {
  const { studentId } = useParams<{ studentId: string }>()
  const { participations } = useParticipationStore()
  const participation = participations.find((p) => p.student.id === studentId)
  const { coursePhase } = useCoursePhaseStore()
  const interviewQuestions =
    (coursePhase?.meta_data?.interview_questions as InterviewQuestion[]) ?? []
  const [answers, setAnswers] = useState<InterviewAnswer[]>([])

  const { mutate } = useUpdateCoursePhaseParticipation()

  useEffect(() => {
    if (participation && coursePhase) {
      const interviewAnswers = participation.meta_data?.interview_answers as InterviewAnswer[]
      setAnswers(interviewAnswers ?? [])
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
        {interviewQuestions
          .sort((a, b) => a.order_num - b.order_num)
          .map((question) => (
            <div key={question.id}>
              <h2>{question.question}</h2>
              <TooltipProvider>
                <MinimalTiptapEditor
                  value={answers.find((a) => a.questionId === question.id)?.answer ?? ''}
                  onChange={(value) => {
                    setAnswer(question.id, value as string)
                  }}
                  className='w-full'
                  editorContentClassName='p-5'
                  output='html'
                  placeholder='Type your answer here...'
                  editable={true}
                  editorClassName='focus:outline-none'
                />
              </TooltipProvider>
            </div>
          ))}
        <Button onClick={saveChanges}>Save Changes</Button>
      </CardContent>
    </Card>
  )
}
