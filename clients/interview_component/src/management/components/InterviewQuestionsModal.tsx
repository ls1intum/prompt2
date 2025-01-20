import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ClipboardList, Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react'
import type { InterviewQuestion } from 'src/management/interfaces/InterviewQuestion'
import { useCoursePhaseStore } from '../zustand/useCoursePhaseStore'
import { useUpdateCoursePhaseMetaData } from '../hooks/useUpdateCoursePhaseMetaData'

export const InterviewQuestionsModal = () => {
  const { coursePhase } = useCoursePhaseStore()
  const [isOpen, setIsOpen] = useState(false)
  const [newQuestion, setNewQuestion] = useState('')
  const [interviewQuestions, setInterviewQuestions] = useState([] as InterviewQuestion[])

  const { mutate } = useUpdateCoursePhaseMetaData()

  useEffect(() => {
    if (coursePhase && coursePhase.meta_data?.interview_questions) {
      const questions = coursePhase.meta_data.interview_questions as InterviewQuestion[]
      setInterviewQuestions(questions)
    }
  }, [coursePhase])

  const addQuestion = () => {
    if (newQuestion.trim()) {
      setInterviewQuestions((prev) => [
        ...prev,
        {
          id: Date.now(),
          question: newQuestion.trim(),
          order_num: interviewQuestions.length,
        },
      ])
      setNewQuestion('')
    }
  }

  const deleteQuestion = (id: number) => {
    setInterviewQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    setInterviewQuestions((prev) => {
      const newQuestions = [...prev]
      if (direction === 'up' && index > 0) {
        ;[newQuestions[index - 1], newQuestions[index]] = [
          newQuestions[index],
          newQuestions[index - 1],
        ]
      } else if (direction === 'down' && index < newQuestions.length - 1) {
        ;[newQuestions[index], newQuestions[index + 1]] = [
          newQuestions[index + 1],
          newQuestions[index],
        ]
      }
      return newQuestions.map((q, idx) => ({ ...q, order_num: idx }))
    })
  }

  const saveQuestions = () => {
    if (coursePhase) {
      mutate({
        id: coursePhase.id,
        meta_data: {
          interview_questions: interviewQuestions,
        },
      })
    }
    setIsOpen(false)
  }

  return (
    <>
      <Button variant='outline' onClick={() => setIsOpen(true)} className='gap-2'>
        <ClipboardList className='h-4 w-4' />
        Set Interview Questions
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Manage Interview Questions</DialogTitle>
            <DialogDescription>
              These questions will be the template for questions asked by the interviewer during the
              interview. Deleting a question will make already written notes / responses to this
              question unaccessible.
            </DialogDescription>
          </DialogHeader>
          <Separator className='my-4' />
          <ScrollArea className='h-[300px] pr-4'>
            <ul className='space-y-4'>
              {interviewQuestions.map((question, index) => (
                <li
                  key={question.id}
                  className='flex items-center space-x-2 bg-secondary p-3 rounded-lg shadow-sm'
                >
                  <div className='flex flex-col'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => moveQuestion(index, 'up')}
                      disabled={index === 0}
                      aria-label='Move question up'
                      className='h-8 w-8'
                    >
                      <ChevronUp className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => moveQuestion(index, 'down')}
                      disabled={index === interviewQuestions.length - 1}
                      aria-label='Move question down'
                      className='h-8 w-8'
                    >
                      <ChevronDown className='h-4 w-4' />
                    </Button>
                  </div>
                  <span className='flex-grow text-sm'>{question.question}</span>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => deleteQuestion(question.id)}
                    aria-label='Delete question'
                    className='h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
          <Separator className='my-4' />
          <div className='flex flex-col space-y-2'>
            <div className='flex items-center space-x-2'>
              <Input
                id='new-question'
                value={newQuestion}
                placeholder='Enter new question'
                onChange={(e) => setNewQuestion(e.target.value)}
                className='flex-grow'
                maxLength={200}
              />
              <Button
                onClick={addQuestion}
                disabled={!newQuestion.trim()}
                aria-label='Add question'
              >
                <Plus className='h-4 w-4 mr-2' />
                Add
              </Button>
            </div>
            <p className='text-xs text-muted-foreground text-right'>
              {newQuestion.length}/200 characters
            </p>
          </div>
          <DialogFooter className='sm:justify-between'>
            <Button variant='outline' onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveQuestions}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
