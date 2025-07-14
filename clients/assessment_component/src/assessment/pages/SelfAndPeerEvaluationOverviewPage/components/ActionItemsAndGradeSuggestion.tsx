import { Target, TrendingUp, CheckCircle2, Loader2, Check } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  ErrorPage,
} from '@tumaet/prompt-ui-components'
import { useGetMyActionItems } from '../hooks/useGetMyActionItems'
import { useGetMyGradeSuggestion } from '../hooks/useGetMyGradeSuggestion'

export const ActionItemsAndGradeSuggestion = () => {
  const {
    data: actionItems = [],
    isPending: isActionItemsPending,
    isError: isActionItemsError,
    refetch: refetchActionItems,
  } = useGetMyActionItems()

  const {
    data: gradeSuggestion,
    isPending: isGradeSuggestionPending,
    isError: isGradeSuggestionError,
    refetch: refetchGradeSuggestion,
  } = useGetMyGradeSuggestion()

  const isError = isActionItemsError || isGradeSuggestionError
  const isPending = isActionItemsPending || isGradeSuggestionPending

  const refetch = () => {
    refetchActionItems()
    refetchGradeSuggestion()
  }

  if (isError) return <ErrorPage onRetry={refetch} />

  if (isPending)
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-blue-600' />
      </div>
    )

  const getGradeText = (grade: number): string => {
    if (grade <= 1.5) return 'Very Good Performance'
    if (grade <= 2.5) return 'Good Performance'
    if (grade <= 3.5) return 'Satisfactory Performance'
    if (grade <= 4.0) return 'Sufficient Improvement'
    return 'Needs Improvement'
  }

  return (
    <div className='space-y-6'>
      {gradeSuggestion && (
        <Card className='border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
          <CardHeader className='pb-4'>
            <CardTitle className='flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100'>
              <TrendingUp className='h-5 w-5 text-blue-600' />
              Grade Suggestion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-3'>
              <Badge className='bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'>
                {gradeSuggestion.toFixed(1)}
              </Badge>
              <span className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                {getGradeText(gradeSuggestion)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className='border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
        <CardHeader className='pb-4'>
          <CardTitle className='flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100'>
            <Target className='h-5 w-5 text-blue-600' />
            Action Items
            {actionItems.length > 0 && (
              <Badge className='bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'>
                {actionItems.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {actionItems.length === 0 ? (
            <div className='flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700'>
              <CheckCircle2 className='h-5 w-5 text-blue-600 flex-shrink-0' />
              <div>
                <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                  No action items to address
                </p>
                <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                  Great job! You&apos;re performing well in all areas.
                </p>
              </div>
            </div>
          ) : (
            <div className='space-y-2'>
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  className='flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors'
                >
                  <Check className='h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5' />
                  <p className='text-sm text-gray-700 dark:text-gray-300 leading-relaxed'>
                    {item.action}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
