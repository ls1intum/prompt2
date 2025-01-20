'use client'

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
import { X, ChevronUp, ChevronDown, ClipboardList } from 'lucide-react'
import type { InterviewQuestion } from 'src/management/interfaces/InterviewQuestion'
import { useCoursePhaseStore } from '../zustand/useCoursePhaseStore'
import { useUpdateMetaData } from '../hooks/useUpdateMetaData'

export const InterviewQuestionsModal = () => {
  const { coursePhase } = useCoursePhaseStore()
  const [isOpen, setIsOpen] = useState(false)
  const [newQuestion, setNewQuestion] = useState('')
  const [interviewQuestions, setInterviewQuestions] = useState([] as InterviewQuestion[])

  const { mutate } = useUpdateMetaData()

  useEffect(() => {
    if (coursePhase && coursePhase.meta_data?.interview_questions) {
      const questions = coursePhase.meta_data.interview_questions as InterviewQuestion[]
      setInterviewQuestions(questions)
    }
  }, [coursePhase])

  const addQuestion = () => {
    if (newQuestion.trim()) {
      setInterviewQuestions((prev) => {
        return [
          ...prev,
          {
            id: Date.now(),
            question: newQuestion.trim(),
            order_num: interviewQuestions.length,
          },
        ]
      })
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
          ...coursePhase.meta_data,
          interview_questions: interviewQuestions,
        },
      })
    }
    setIsOpen(false)
  }

  return (
    <>
      <Button variant='outline' onClick={() => setIsOpen(true)}>
        <ClipboardList className='h-4 w-4' />
        Set Interview Questions
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='sm:max-w-[700px]'>
          <DialogHeader>
            <DialogTitle>Manage Interview Questions</DialogTitle>
            <DialogDescription>
              These questions will be the template for questions asked by the interviewer during the
              interview. Deleting a question will make already written notes / responses to this
              question unaccessible.
            </DialogDescription>
          </DialogHeader>
          <ul className='space-y-2'>
            {interviewQuestions.map((question, index) => (
              <li
                key={question.id}
                className='flex items-center space-x-2 bg-secondary p-2 rounded-md'
              >
                <div className='flex flex-col'>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => moveQuestion(index, 'up')}
                    disabled={index === 0}
                    aria-label='Move question up'
                  >
                    <ChevronUp className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => moveQuestion(index, 'down')}
                    disabled={index === interviewQuestions.length - 1}
                    aria-label='Move question down'
                  >
                    <ChevronDown className='h-4 w-4' />
                  </Button>
                </div>
                <span className='flex-grow'>{question.question}</span>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => deleteQuestion(question.id)}
                  aria-label='Delete question'
                >
                  <X className='h-4 w-4' />
                </Button>
              </li>
            ))}
          </ul>

          <div className='flex flex-row'>
            <Input
              id='new-question'
              value={newQuestion}
              placeholder='Enter new question'
              onChange={(e) => setNewQuestion(e.target.value)}
            />
            <Button onClick={addQuestion} className='ml-2'>
              Add
            </Button>
          </div>
          <DialogFooter>
            <div className='flex flex-row justify-between'>
              <Button variant='outline' onClick={() => setIsOpen(false)}>
                Revert
              </Button>
              <Button className='ml-2' onClick={saveQuestions}>
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
