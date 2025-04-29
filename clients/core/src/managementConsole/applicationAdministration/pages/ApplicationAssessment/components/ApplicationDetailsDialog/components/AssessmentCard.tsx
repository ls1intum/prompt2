import { useState } from 'react'
import { Send, Trash2 } from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
  Textarea,
} from '@tumaet/prompt-ui-components'
import { PassStatus, useAuthStore } from '@tumaet/prompt-shared-state'
import { InstructorComment } from '../../../../../interfaces/instructorComment'
import { useModifyAssessment } from '../hooks/mutateAssessment'
import { ApplicationAssessment } from '@core/managementConsole/applicationAdministration/interfaces/applicationAssessment'

interface AssessmentCardProps {
  score: number | null
  restrictedData: { [key: string]: any }
  acceptanceStatus: PassStatus
  courseParticipationID: string
}

export const AssessmentCard = ({
  score,
  restrictedData,
  acceptanceStatus,
  courseParticipationID,
}: AssessmentCardProps): JSX.Element => {
  const [currentScore, setCurrentScore] = useState<number | null>(score)
  const [newComment, setNewComment] = useState<string>('')
  const comments = (restrictedData.comments as InstructorComment[]) ?? []
  const { user } = useAuthStore()
  const author = `${user?.firstName} ${user?.lastName}`

  const { mutate: mutateAssessment } = useModifyAssessment(courseParticipationID)

  const handleScoreSubmit = (newScore: number) => {
    const assessment: ApplicationAssessment = {
      Score: newScore,
    }
    mutateAssessment(assessment)
  }

  const handleAcceptanceStatusChange = (newStatus: PassStatus) => {
    const assessment: ApplicationAssessment = {
      passStatus: newStatus,
    }
    mutateAssessment(assessment)
  }

  const handleCommentSubmit = (comment: string) => {
    comments.push({
      text: comment,
      timestamp: new Date().toISOString(),
      author: author,
    })
    const assessment: ApplicationAssessment = {
      restrictedData: {
        comments,
      },
    }
    mutateAssessment(assessment)
  }

  const handleDeleteComment = (comment: InstructorComment) => {
    const filteredComments = comments.filter(
      (c) => !(c.author == comment.author && c.timestamp === comment.timestamp),
    )
    console.log(filteredComments)
    const assessment: ApplicationAssessment = {
      restrictedData: {
        comments: filteredComments,
      },
    }
    mutateAssessment(assessment)
  }

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='text-2xl font-bold'>Assessment</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-4'>
          <div>
            <Label htmlFor='new-score' className='text-sm font-medium'>
              Application Score
            </Label>
            <div className='flex items-center space-x-2 mt-1'>
              <Input
                id='new-score'
                title='Assessment Score'
                type='number'
                value={currentScore ?? ''}
                placeholder='New score'
                onChange={(e) =>
                  setCurrentScore(e.target.value === '' ? null : Number(e.target.value))
                }
                className='w-28'
              />
              <Button
                disabled={!currentScore || currentScore === score}
                onClick={() => handleScoreSubmit(currentScore ?? 0)}
                size='sm'
              >
                Submit
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor='resolution' className='text-sm font-medium'>
              Resolution
            </Label>
            <div className='flex items-center space-x-4 mt-2'>
              <Button
                variant='outline'
                size='lg'
                disabled={acceptanceStatus === PassStatus.FAILED}
                className='border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600'
                onClick={() => handleAcceptanceStatusChange(PassStatus.FAILED)}
              >
                Reject
              </Button>
              <Button
                variant='default'
                size='lg'
                disabled={acceptanceStatus === PassStatus.PASSED}
                className='bg-green-500 hover:bg-green-600 text-white'
                onClick={() => handleAcceptanceStatusChange(PassStatus.PASSED)}
              >
                Accept
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {comments && comments.length > 0 && (
          <div className='space-y-2'>
            <Label className='text-sm font-medium'>Previous Comments</Label>
            <div className='space-y-2 max-h-60 overflow-y-auto'>
              {comments.map((comment, index) => (
                <div
                  key={index}
                  className='border border-border p-3 rounded-md bg-secondary text-card-foreground flex justify-between items-start'
                >
                  <div>
                    <p className='text-sm text-muted-foreground mb-1'>
                      <strong className='font-medium text-foreground'>{comment.author}</strong>{' '}
                      {comment.timestamp && (
                        <span className='text-muted-foreground'>
                          - {new Date(comment.timestamp).toLocaleString()}
                        </span>
                      )}
                    </p>
                    <p className='text-foreground whitespace-pre-line'>{comment.text}</p>
                  </div>
                  {comment.author === author && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleDeleteComment(comment)}
                      className='text-red-500 hover:text-red-600 hover:bg-red-50'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <Label htmlFor='new-comment' className='text-sm font-medium'>
            Add Comment
          </Label>
          <div className='flex items-start space-x-2 mt-1'>
            <Textarea
              id='new-comment'
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder='Type your comment here...'
              className='flex-grow'
              rows={3}
            />
            <Button
              size='sm'
              disabled={!newComment}
              onClick={() => {
                handleCommentSubmit(newComment)
                setNewComment('')
              }}
            >
              <Send className='h-4 w-4 mr-2' />
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
