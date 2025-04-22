import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ValidationResult } from '../../../interfaces/validationResult'
import { ClipboardCheck, FileText, BarChart3 } from 'lucide-react'
import { getAllTeaseStudents } from '../../../network/queries/getAllTeaseStudents'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { TeaseStudent } from '../../../interfaces/tease/student'

const DataCompletionSummary = ({ checks }: { checks: ValidationResult[] }) => {
  const { phaseId } = useParams<{ phaseId: string }>()

  const {
    data: students,
    isPending,
    isError,
    //refetch,
  } = useQuery<TeaseStudent[]>({
    queryKey: ['tease_students', phaseId],
    queryFn: () => getAllTeaseStudents(phaseId ?? ''),
  })

  const numberOfStudentsSubmitted =
    students?.filter((s) => s.projectPreferences.length > 0).length || 0
  const numberOfStudents = students?.length || 0

  const highLevelCategoryStats = {
    previous: {
      total: checks.filter((c) => c.highLevelCategory === 'previous').length,
      completed: checks.filter((c) => c.highLevelCategory === 'previous' && c.isValid).length,
    },
    survey: {
      total: checks.filter((c) => c.highLevelCategory === 'survey').length,
      completed: checks.filter((c) => c.highLevelCategory === 'survey' && c.isValid).length,
    },
  }

  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <ClipboardCheck className='h-5 w-5' />
          Data Completion Summary
        </CardTitle>
        <CardDescription>Overall student data completeness and category breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Card className='border-amber-100'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-amber-700 flex items-center gap-2'>
                <FileText className='h-4 w-4' />
                Data from Previous Phases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {highLevelCategoryStats.previous.total > 0
                  ? Math.round(
                      (highLevelCategoryStats.previous.completed /
                        highLevelCategoryStats.previous.total) *
                        100,
                    )
                  : 0}
                %
              </div>
              <p className='text-xs text-muted-foreground'>
                {highLevelCategoryStats.previous.completed} of{' '}
                {highLevelCategoryStats.previous.total} checks complete
              </p>
            </CardContent>
          </Card>

          <Card className='border-teal-100'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-teal-700 flex items-center gap-2'>
                <BarChart3 className='h-4 w-4' />
                Survey Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {!isPending && !isError && numberOfStudents > 0
                  ? Math.round((numberOfStudentsSubmitted / numberOfStudents) * 100)
                  : 0}
                %
              </div>
              <p className='text-xs text-muted-foreground'>
                {!isPending && !isError && numberOfStudents > 0 && (
                  <>
                    {numberOfStudentsSubmitted} of {numberOfStudents} students have submitted
                  </>
                )}
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}

export default DataCompletionSummary
