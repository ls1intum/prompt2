import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { PassStatus } from '@/interfaces/course_phase_participation'
import { InstructorComment } from '@/interfaces/instructor_comment'
import { Send } from 'lucide-react'
import { useState } from 'react'

interface AssessmentCardProps {
  score: number | null
  metaData: { [key: string]: any }
  acceptanceStatus: PassStatus
  handleAcceptanceStatusChange: (status: PassStatus) => void
  onScoreSubmission: (score: number) => void
  onCommentSubmission: (comment: string) => void
}

export const AssessmentCard = ({
  score,
  metaData,
  acceptanceStatus,
  handleAcceptanceStatusChange,
  onScoreSubmission,
  onCommentSubmission,
}: AssessmentCardProps): JSX.Element => {
  const [currentScore, setCurrentScore] = useState<number | null>(score)
  const [newComment, setNewComment] = useState<string>('')
  const comments = metaData.comments as InstructorComment[]

  return (
    <Card>
      <CardContent className='pt-6'>
        <CardTitle className='text-xl font-semibold mb-4'>Assessment</CardTitle>
        <div className='space-y-4'>
          <div className='space-y-4'>
            <Label htmlFor='new-score' className='mb-2 block font-medium'>
              Assessment Score
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
              />
              <Button
                disabled={!currentScore || currentScore === score}
                onClick={() => onScoreSubmission(currentScore ?? 0)}
                size='sm'
              >
                Submit
              </Button>
            </div>
            <Label htmlFor='new-score' className='mb-2 block font-medium'>
              Resolution
            </Label>
            <div className='flex items-center space-x-4 mt-4'>
              <Button
                variant='outline'
                size='lg'
                disabled={acceptanceStatus === PassStatus.FAILED}
                className='border-red-500 text-red-500 hover:border-red-600 hover:text-red-600 hover:bg-red-50'
                onClick={() => handleAcceptanceStatusChange(PassStatus.FAILED)}
              >
                Reject
              </Button>
              <Button
                variant='default'
                size='lg'
                disabled={acceptanceStatus === PassStatus.PASSED}
                className='bg-green-500 hover:bg-green-600'
                onClick={() => handleAcceptanceStatusChange(PassStatus.PASSED)}
              >
                Accept
              </Button>
            </div>
          </div>

          <Separator className='my-4' />
          {comments !== undefined && comments.length > 0 && (
            <div className='space-y-2 mt-4'>
              <Label className='mb-2 block font-medium'>Previous Comments</Label>
              {comments.map((comment, index) => (
                <div
                  key={index}
                  className='border border-border p-3 rounded-md bg-secondary text-card-foreground'
                >
                  <p className='text-sm text-muted-foreground mb-1'>
                    <strong className='font-medium text-foreground'>{comment.author}</strong>{' '}
                    {comment.timestamp && (
                      <span className='text-muted-foreground'>
                        - {new Date(comment.timestamp).toLocaleString()}
                      </span>
                    )}
                  </p>
                  <p className='text-foreground'>{comment.text}</p>
                </div>
              ))}
            </div>
          )}
          <div>
            <Label htmlFor='new-comment' className='mb-2 block font-medium'>
              Add Comment
            </Label>
            <div className='flex items-start space-x-2'>
              <Textarea
                id='new-comment'
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder='Type your comment here...'
                className='flex-grow'
              />
              <Button
                size='sm'
                disabled={!newComment}
                onClick={() => {
                  onCommentSubmission(newComment)
                  setNewComment('')
                }}
              >
                <Send className='h-4 w-4 mr-2' />
                Send
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
