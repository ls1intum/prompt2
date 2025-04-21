import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ValidationResult } from '../../../interfaces/validationResult'
import { ClipboardCheck, FileText, BarChart3 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

const DataCompletionSummary = ({ checks }: { checks: ValidationResult[] }) => {
  const totalChecks = checks.length
  const completedChecks = checks.filter((check) => check.isValid).length
  const completionPercentage = Math.round((completedChecks / totalChecks) * 100)

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
        <div className='mb-6'>
          <div className='flex justify-between mb-2'>
            <span className='text-sm font-medium'>Overall Completion</span>
            <span className='text-sm font-medium'>{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className='h-2' />
        </div>

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
                {Math.round(
                  (highLevelCategoryStats.previous.completed /
                    highLevelCategoryStats.previous.total) *
                    100,
                )}
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
                {Math.round(
                  (highLevelCategoryStats.survey.completed / highLevelCategoryStats.survey.total) *
                    100,
                )}
                %
              </div>
              <p className='text-xs text-muted-foreground'>
                {highLevelCategoryStats.survey.completed} of {highLevelCategoryStats.survey.total}{' '}
                checks complete
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}

export default DataCompletionSummary
