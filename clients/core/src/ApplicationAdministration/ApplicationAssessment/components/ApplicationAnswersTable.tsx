import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ApplicationQuestionText } from '@/interfaces/application_question_text'
import { ApplicationAnswerMultiSelect } from '@/interfaces/application_answer_multi_select'
import { ApplicationQuestionMultiSelect } from '@/interfaces/application_question_multi_select'
import { ApplicationAnswerText } from '@/interfaces/application_answer_text'
import { AlignLeft, CheckSquare } from 'lucide-react'

interface ApplicationAnswersTableProps {
  questions: (ApplicationQuestionText | ApplicationQuestionMultiSelect)[]
  answers_multi_select: ApplicationAnswerMultiSelect[]
  answers_text: ApplicationAnswerText[]
}

export const ApplicationAnswersTable = ({
  questions,
  answers_multi_select,
  answers_text,
}: ApplicationAnswersTableProps) => {
  const sortedQuestions = [...questions].sort((a, b) => a.order_num - b.order_num)

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Application Answers</CardTitle>
        <CardDescription>
          Review the applicant&apos;s responses to the application questions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-1/3'>Question</TableHead>
                <TableHead>Answer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedQuestions.map((question, index) => {
                const answer =
                  answers_multi_select.find((a) => a.application_question_id === question.id)
                    ?.answer ||
                  answers_text.find((a) => a.application_question_id === question.id)?.answer ||
                  ''

                return (
                  <TableRow key={question.id} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                    <TableCell className='font-medium'>
                      <div className='flex items-center space-x-2'>
                        {Array.isArray(answer) ? (
                          <CheckSquare className='h-4 w-4 text-muted-foreground' />
                        ) : (
                          <AlignLeft className='h-4 w-4 text-muted-foreground' />
                        )}
                        <span>{question.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {Array.isArray(answer) ? (
                        <ul className='list-none space-y-1'>
                          {answer.map((item, idx) => (
                            <li key={idx} className='flex items-center space-x-2'>
                              <span className='h-1.5 w-1.5 rounded-full bg-primary' />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className='whitespace-pre-wrap break-words'>{answer}</p>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
