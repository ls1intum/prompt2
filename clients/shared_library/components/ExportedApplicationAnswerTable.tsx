import { ExportedApplicationAnswer } from '@tumaet/prompt-shared-state'
import { useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AlignLeft, CheckSquare } from 'lucide-react'
import { Badge } from './ui/badge'

interface ExportedApplicationAnswerTableProps {
  applicationAnswers: ExportedApplicationAnswer[]
}

export const ExportedApplicationAnswerTable = ({
  applicationAnswers,
}: ExportedApplicationAnswerTableProps) => {
  const orderedAnswers = useMemo(() => {
    if (!applicationAnswers) return []
    return applicationAnswers?.sort((a, b) => a.orderNum - b.orderNum)
  }, [applicationAnswers])

  return (
    <div className='overflow-x-auto'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-1/12'>Type</TableHead>
            <TableHead className='w-1/5'>Key</TableHead>
            <TableHead>Answer</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orderedAnswers.map((answer, index) => {
            return (
              <TableRow key={answer.key} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                <TableCell>
                  {answer.type === 'multiselect' ? (
                    <CheckSquare className='h-4 w-4 text-muted-foreground' />
                  ) : (
                    <AlignLeft className='h-4 w-4 text-muted-foreground' />
                  )}
                </TableCell>

                <TableCell className='font-medium'>
                  <div className='flex items-center space-x-2'>
                    <span>{answer.key}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {Array.isArray(answer.answer) ? (
                    <div>
                      {answer.answer.map((item, idx) => (
                        <Badge key={idx} className='mr-1'>
                          {item}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className='whitespace-pre-wrap break-words'>{answer.answer}</p>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
