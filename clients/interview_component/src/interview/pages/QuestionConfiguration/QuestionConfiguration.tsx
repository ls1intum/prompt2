import { useEffect, useRef, useState } from 'react'
import { Loader2, Plus, GripVertical, Trash2 } from 'lucide-react'
import type { InterviewQuestion } from '../../interfaces/InterviewQuestion'
import { useCoursePhaseStore } from '../../zustand/useCoursePhaseStore'
import { useUpdateCoursePhaseMetaData } from '@/hooks/useUpdateCoursePhaseMetaData'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import {
  DeleteConfirmation,
  Input,
  Button,
  ManagementPageHeader,
} from '@tumaet/prompt-ui-components'

export const QuestionConfiguration = () => {
  const { coursePhase } = useCoursePhaseStore()
  const [newQuestion, setNewQuestion] = useState('')
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [toBeDeletedQuestionID, setToBeDeletedQuestionID] = useState<number | undefined>(undefined)

  const { mutate } = useUpdateCoursePhaseMetaData()

  useEffect(() => {
    if (coursePhase) {
      const questions = coursePhase.restrictedData?.interviewQuestions ?? []
      setInterviewQuestions(questions)
      setIsLoading(false)
    }
  }, [coursePhase])

  useEffect(() => {
    if (coursePhase && !isLoading) {
      mutate({
        id: coursePhase.id,
        restrictedData: {
          interviewQuestions: interviewQuestions,
        },
      })
    }
  }, [interviewQuestions, coursePhase, mutate, isLoading])

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault() // Prevent form submission if wrapped in a form
      addQuestion()
    }
  }

  const addQuestion = () => {
    if (newQuestion.trim()) {
      setInterviewQuestions((prev) => [
        ...prev,
        {
          id: Date.now(),
          question: newQuestion.trim(),
          orderNum: prev.length,
        },
      ])
      setNewQuestion('')
      requestAnimationFrame(() => {
        scrollToBottom()
      })
    }
  }

  const deleteQuestion = () => {
    if (!toBeDeletedQuestionID) return
    setInterviewQuestions((prev) => prev.filter((q) => q.id !== toBeDeletedQuestionID))
    setToBeDeletedQuestionID(undefined)
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const newQuestions = Array.from(interviewQuestions)
    const [reorderedItem] = newQuestions.splice(result.source.index, 1)
    newQuestions.splice(result.destination.index, 0, reorderedItem)

    setInterviewQuestions(newQuestions.map((q, idx) => ({ ...q, orderNum: idx })))
  }

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView(false)
  }

  return (
    <div className='flex flex-col'>
      {/* Sticky header */}
      <div className='sticky top-0 bg-background p-4 z-10 border-b'>
        <header className='mb-4'>
          <ManagementPageHeader>Interview Question Configuration</ManagementPageHeader>
          <p className='text-muted-foreground'>
            These questions will be used as a template during interviews. Deleting a question will
            make any associated notes or responses inaccessible.
          </p>
        </header>
        <div className='flex flex-col space-y-2'>
          <div className='flex items-center space-x-2'>
            <Input
              id='new-question'
              value={newQuestion}
              placeholder='Enter new question'
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyDown={handleEnter}
              className='flex-grow'
              maxLength={200}
            />
            <Button onClick={addQuestion} disabled={!newQuestion.trim()} aria-label='Add question'>
              <Plus className='h-4 w-4 mr-2' />
              Add
            </Button>
          </div>
          <p className='text-xs text-muted-foreground text-right'>
            {newQuestion.length}/200 characters
          </p>
        </div>
      </div>

      {/* Scrollable content */}
      <div className='flex-grow overflow-auto h-[calc(100vh-300px)] p-4'>
        {isLoading ? (
          <div className='flex justify-center items-center h-64'>
            <Loader2 className='h-12 w-12 animate-spin text-primary' />
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div ref={scrollRef}>
              <Droppable droppableId='questions'>
                {(provided) => (
                  <ul {...provided.droppableProps} ref={provided.innerRef} className='space-y-4'>
                    {interviewQuestions.map((question, index) => (
                      <Draggable
                        key={question.id}
                        draggableId={question.id.toString()}
                        index={index}
                      >
                        {(prov) => (
                          <li
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            className='flex items-center space-x-2 bg-secondary p-3 rounded-lg shadow-sm transition-colors duration-200 hover:bg-secondary/80'
                          >
                            <div {...prov.dragHandleProps} className='cursor-move'>
                              <GripVertical className='h-5 w-5 text-muted-foreground' />
                            </div>
                            <span className='flex-grow text-sm'>{question.question}</span>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => {
                                setToBeDeletedQuestionID(question.id)
                                setDeleteDialogOpen(true)
                              }}
                              aria-label='Delete question'
                              className='h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10'
                            >
                              <Trash2 className='h-4 w-4 ml-2 mr-2' />
                            </Button>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </div>
          </DragDropContext>
        )}
      </div>
      {deleteDialogOpen && (
        <DeleteConfirmation
          isOpen={deleteDialogOpen}
          setOpen={setDeleteDialogOpen}
          onClick={(deleteConfirmed) =>
            deleteConfirmed ? deleteQuestion() : setToBeDeletedQuestionID(undefined)
          }
          deleteMessage='Are you sure you want to delete this question? This may result in the loss of interview answers.'
        />
      )}
    </div>
  )
}
