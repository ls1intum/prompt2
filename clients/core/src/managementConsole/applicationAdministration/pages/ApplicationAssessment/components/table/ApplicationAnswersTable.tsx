import {
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@tumaet/prompt-ui-components'
import { ApplicationQuestionText } from '@core/interfaces/application/applicationQuestion/applicationQuestionText'
import { ApplicationQuestionMultiSelect } from '@core/interfaces/application/applicationQuestion/applicationQuestionMultiSelect'
import { ApplicationAnswerText } from '@core/interfaces/application/applicationAnswer/text/applicationAnswerText'
import { ApplicationAnswerMultiSelect } from '@core/interfaces/application/applicationAnswer/multiSelect/applicationAnswerMultiSelect'

import { AlignLeft, CheckSquare } from 'lucide-react'

interface ApplicationAnswersTableProps {
  questions: (ApplicationQuestionText | ApplicationQuestionMultiSelect)[]
  answersMultiSelect: ApplicationAnswerMultiSelect[]
  answersText: ApplicationAnswerText[]
}

export const ApplicationAnswersTable = ({
  questions,
  answersMultiSelect,
  answersText,
}: ApplicationAnswersTableProps) => {
  const sortedQuestions = [...questions].sort((a, b) => a.orderNum - b.orderNum)

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
                <TableHead className='w-1/12'>Type</TableHead>
                <TableHead className='w-1/3'>Question</TableHead>
                <TableHead>Answer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedQuestions.map((question, index) => {
                const answer =
                  answersMultiSelect.find((a) => a.applicationQuestionID === question.id)?.answer ||
                  answersText.find((a) => a.applicationQuestionID === question.id)?.answer ||
                  ''

                return (
                  <TableRow key={question.id} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                    <TableCell>
                      {Array.isArray(answer) ? (
                        <CheckSquare className='h-4 w-4 text-muted-foreground' />
                      ) : (
                        <AlignLeft className='h-4 w-4 text-muted-foreground' />
                      )}
                    </TableCell>

                    <TableCell className='font-medium'>
                      <div className='flex items-center space-x-2'>
                        <span>{question.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {Array.isArray(answer) ? (
                        <div>
                          {answer.map((item, idx) => (
                            <Badge key={idx} className='mr-1'>
                              {item}
                            </Badge>
                          ))}
                        </div>
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
